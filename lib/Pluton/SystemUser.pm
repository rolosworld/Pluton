package Pluton::SystemUser;
use Modern::Perl;
use Moose;
use namespace::autoclean;
use Main::JSON::Validator;
use Crypt::CBC;
use Pluton::SystemUser::Command;

extends 'Main::Module';

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

    my $key = $c->session->{system_user_digest} . $c->req->cookies->{system_user_digest}->value;
    my $cipher = Crypt::CBC->new( -key    => $key, -cipher => 'Blowfish' );
    my $pass_encrypted = $cipher->encrypt($$params{password});
    # my $pass_decrypted  = $cipher->decrypt($pass_encrypted);

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

    $DB::single = 1;
    return \@sys_users;
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
