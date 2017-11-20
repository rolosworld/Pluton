package Pluton::SystemUser;
use Modern::Perl;
use Moose;
use namespace::autoclean;
use Main::JSON::Validator;
use Crypt::CBC;
use Pluton::SystemUser::Command;
use MIME::Base64;

extends 'Main::Module';

sub encrypt_password {
    my ($self, $pass) = @_;
    my $c = $self->c;

    my $key = $c->session->{system_user_digest} . $c->req->cookies->{system_user_digest}->value;
    my $cipher = Crypt::CBC->new( -key    => $key, -cipher => 'Blowfish' );
    return encode_base64($cipher->encrypt( $pass ));
}

sub decrypt_password {
    my ($self, $pass) = @_;
    my $c = $self->c;

    my $key = $c->session->{system_user_digest} . $c->req->cookies->{system_user_digest}->value;
    my $cipher = Crypt::CBC->new( -key    => $key, -cipher => 'Blowfish' );
    return $cipher->decrypt(decode_base64($pass));
}

our $__system_user_credentials_schema = {
    required   => [qw(username password)],
    properties => {
        username => { type => 'string', pattern => '^\w+$', minLength => 1, maxLength => 32 },
        password => { type => 'string', minLength => 1, maxLength => 70 },
    }
};

sub __validate_credentials {
    my ($self, $params) = @_;
    my $validator = Main::JSON::Validator->new;
    $validator->schema($__system_user_credentials_schema);

    return $validator->validate($params);
}

sub add {
    my ($self, $params) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_credentials($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    if ($c->config->{system_users_blacklist}->{$$params{username}}) {
        $self->jsonrpc_error(
            [   {   path    => '/username',
                    message => 'User is blacklisted',
                }
            ]);

        return;
    }

    my $exist = $c->model('DB::SystemUser')->search({
        owner => $c->user->id,
        username => $$params{username},
    })->next;

    if ( $exist ) {
        $self->jsonrpc_error(
            [   {   path    => '/username',
                    message => 'User exist in your system users list',
                }
            ]);

        return;
    }

    my $sys_cmd = $self->getObject('SystemUser::Command', c => $c);
    my $output = $sys_cmd->run({
        username => $$params{username},
        password => $$params{password},
        command  => 'whoami',
    });

    if (!$output) {
        $self->jsonrpc_error(
            [   {   path    => '/username',
                    message => 'Unexpected error when validating OS user',
                }
            ]);

        return;
    }

    my @_output = split("\n", $output);

    if (scalar( @_output ) < 2 && $_output[1] ne $$params{username}) {
        $self->jsonrpc_error(
            [   {   path    => '/username',
                    message => 'User doesn\'t exist in the OS',
                }
            ]);

        return;
    }

    my $pass_encrypted = $self->encrypt_password($$params{password});

    $c->model('DB::SystemUser')->create({
        owner => $c->user->id,
        username => $$params{username},
        password => $pass_encrypted,
    });

    return $self->list;
}

sub list {
    my ($self) = @_;
    my $c = $self->c;

    my @sys_users = $c->model('DB::SystemUser')->search({
        owner => $c->user->id,
    })->all;

    return \@sys_users;
}

our $__system_user_s3ql_schema = {
    required   => [qw(user)],
    properties => {
        authinfo2 => { type => 'string', minLength => 1 },
        user => { type => 'string', pattern => '^\d+$', minLength => 1, maxLength => 10 },
    }
};

sub __validate_s3ql {
    my ($self, $params) = @_;
    my $validator = Main::JSON::Validator->new;
    $validator->schema($__system_user_s3ql_schema);

    return $validator->validate($params);
}

sub s3ql {
    my ($self, $params) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_s3ql($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    my $system_user = $c->model('DB::SystemUser')->search({
        owner => $c->user->id,
        id => $$params{user},
    })->next;

    if ( !$system_user ) {
        $self->jsonrpc_error(
            [   {   path    => '/user',
                    message => 'User doesn\'t exist in your system users list',
                }
            ]);

        return;
    }

    my $sys_cmd = $self->getObject('SystemUser::Command', c => $c);

    my $pass_decrypted  = $self->decrypt_password($system_user->password);

    my $run = {
        username => $system_user->username,
        password => $pass_decrypted,
    };

    if ($$params{authinfo2}) {
        # Create authinfo2 file and .pluton folder
        $$run{command} = 'mkdir -p ~/.s3ql ~/.pluton/backup && install -b -m 600 /dev/null ~/.s3ql/authinfo2';
        $sys_cmd->run($run);

        # Fill the file with the content, line per line
        my $authinfo2 = $$params{authinfo2};

        # Don't allow single quotes
        $authinfo2 =~ s/'//g;
        my @content = split("\n", $authinfo2);
        foreach my $row (@content) {
            $$run{command} = "echo '$row' >> ~/.s3ql/authinfo2";
            $sys_cmd->run($run);
        }
    }

    # Get the content of the file
    $$run{command} = "cat ~/.s3ql/authinfo2";
    my $output = $sys_cmd->run($run);

    my @_output = split("\n", $output);
    shift @_output;

    return join("\n", @_output);
}

sub s3ql_remount {
    my ($self, $params) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_s3ql($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    my $system_user = $c->model('DB::SystemUser')->search({
        owner => $c->user->id,
        id => $$params{user},
    })->next;

    if ( !$system_user ) {
        $self->jsonrpc_error(
            [   {   path    => '/user',
                    message => 'User doesn\'t exist in your system users list',
                }
            ]);
        return;
    }

    my $sys_cmd = $self->getObject('SystemUser::Command', c => $c);

    my $pass_decrypted  = $self->decrypt_password($system_user->password);

    my $run = {
        username => $system_user->username,
        password => $pass_decrypted,
    };

    # Get the content of the file
    $$run{command} = "cat ~/.s3ql/authinfo2";
    my $output = $sys_cmd->run($run);
    my @_output = split("\n", $output);
    shift @_output;

    my $storage_url;
    foreach my $row (@_output) {
        my @parts = split(' ', $row);
        if ($parts[0] eq 'storage-url:') {
            $storage_url = $parts[1];
            last;
        }
    }

    if (!$storage_url) {
        $self->jsonrpc_error(
            [   {   path    => '/user',
                    message => 'No storage-url found on the s3ql configuration',
                }
            ]);
        return;
    }

    # umount first
    $$run{command} = "umount.s3ql ~/.pluton/backup";
    my $output = $sys_cmd->run($run);

    # fsck
    $$run{command} = "fsck.s3ql --force '$storage_url'";
    $output .= $sys_cmd->run($run);

    # mount
    $$run{command} = "mount.s3ql '$storage_url' ~/.pluton/backup";
    $output .= $sys_cmd->run($run);

    return $output;
}

sub s3qlstat {
    my ($self, $params) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_s3ql($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    my $system_user = $c->model('DB::SystemUser')->search({
        owner => $c->user->id,
        id => $$params{user},
    })->next;

    if ( !$system_user ) {
        $self->jsonrpc_error(
            [   {   path    => '/user',
                    message => 'User doesn\'t exist in your system users list',
                }
            ]);
        return;
    }

    my $sys_cmd = $self->getObject('SystemUser::Command', c => $c);

    my $pass_decrypted  = $self->decrypt_password($system_user->password);

    my $run = {
        username => $system_user->username,
        password => $pass_decrypted,
    };

    $$run{command} = "s3qlstat ~/.pluton/backup";
    my $output = $sys_cmd->run($run);
    my @_output = split("\n", $output);

    return join("\n", @_output);
}

no Moose;

=head1 NAME

Pluton - Catalyst based application

=head1 SYNOPSIS


=head1 DESCRIPTION


=head1 SEE ALSO


=head1 AUTHOR

Rolando González Chévere <rolosworld@gmail.com>

=head1 LICENSE

 Copyright (c) 2017 Rolando González Chévere <rolosworld@gmail.com>

 This file is part of Pluton.

 Pluton is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.

 Pluton is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Pluton.  If not, see <http://www.gnu.org/licenses/>.

=cut

1;
