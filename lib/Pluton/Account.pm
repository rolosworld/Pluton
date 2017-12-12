package Pluton::Account;
use Modern::Perl;
use Moose;
use namespace::autoclean;
use Crypt::SaltedHash;
use Digest::SHA1 qw{sha1_base64};
use Crypt::CBC;
use MIME::Base64 ();

extends 'Main::Account';

our $__email_login_schema = {
    required   => [qw(username password)],
    properties => {
        username => { type => 'string', format => 'email', minLength => 5, maxLength => 255 },
        password => { type => 'string', minLength => 8, maxLength => 255 },
    }
};

our $__login_schema = {
    required   => [qw(username password)],
    properties => {
        username => { type => 'string', pattern => '^\w+$', minLength => 1, maxLength => 32 },
        password => { type => 'string', pattern => '^[^\n^\r.]+$', minLength => 1, maxLength => 70 },
    }
};

sub __validate_login {
    my ($self, $params) = @_;
    my $validator = Main::JSON::Validator->new;
    if ($$params{username} =~ /@/) {
        $validator->schema($__email_login_schema);
    }
    else {
        $validator->schema($__login_schema);
    }

    return $validator->validate($params);
}

sub __digest_password {
    my ($self, $params) = @_;

    # Since the user signed in succesfully,
    # We generate the digest string from the password, so we can decrypt the system_users passwords
    # We split the digest between session and cookie to make it a bit more "secure"
    my $digest = $self->{digest_password_key} = sha1_base64($$params{password});
    my $session_part = substr($digest, 0, -8);
    my $cookie_part = substr($digest, -8);
    my $c = $self->c;
    $c->session->{system_user_digest} = $session_part;
    $c->response->cookies->{system_user_digest} = {value => $cookie_part};
}

sub __validate_email_password {
    my ($self, $user, $params) = @_;
    my $result = $self->SUPER::__validate_password($user, $params);

    if ($result) {
        $self->__digest_password( $params );
    }

    return $result;
}

sub email_login {
    my ( $self, $params ) = @_;
    my $c = $self->c;

    # Find if user exist
    my $user = $c->find_user({
        username => $$params{username},
    });

    if ( $user ) {
        if (!$user->active) {
            $self->jsonrpc_error(
                [   {   path    => '/username',
                        message => 'User disabled.',
                    }
                ]);
        }

        # Validate password
        if ($self->__validate_email_password($user, $params)) {
            return $c->user->obj;
        }

        $self->jsonrpc_error(
            [   {   path    => '/password',
                    message => 'Invalid username and password combination.',
                    data    => 'reset_password',
                }
            ]);
    }

    $self->jsonrpc_error(
        [   {   path    => '/username',
                message => 'User not found',
                data    => 'registration',
            }
        ]);
}


sub __validate_password {
    my ($self, $params) = @_;
    my $c = $self->c;

    if ($c->config->{system_users_blacklist}->{$$params{username}}) {
        return 0;
    }

    my $su = $self->getObject( 'SystemUser::Command', c => $c);
    my $run = {
        username => $$params{username},
        password => $$params{password},
        command  => 'whoami',
    };
    my $output = $su->raw($run);

    if (!$output) {
        return 0;
    }

    my @_output = split("\n", $output);

    if (scalar( @_output ) < 2 && $_output[2] ne $$params{username}) {
        return 0;
    }

    $self->__digest_password( $params );

    return 1;
}

sub login {
    my ( $self, $params ) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_login($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    # User is trying to sign in with email
    if ($$params{username} =~ /@/) {
        return $self->email_login( $params );
    }

    # User is trying to sign in as a system user

    # Confirm the credentials are valid
    if (!$self->__validate_password($params)) {
        $self->jsonrpc_error(
            [   {   path    => '/password',
                    message => 'Invalid username and password combination.',
                    data    => 'reset_password',
                }
            ]);
        return;
    }


    # Search for a DB user
    my $user = $c->find_user({
        username => $$params{username},
    });

    # Create a DB user if it doesn't exist with user privileges
    if (!$user) {
        my $user_role = $c->model('DB::Role')->search({name => 'user'})->next;
        my $user_obj = $self->getObject('User', c => $c);
        $user = $user_obj->create({
            username => $$params{username},
            password => $$params{password},
            memberships => [{role => $user_role->id}],
        });
        $user = $c->find_user({
            username => $$params{username},
        });
    }

    if (!$user->active) {
        $self->jsonrpc_error(
            [   {   path    => '/username',
                    message => 'User disabled.',
                }
            ]);
        return;
    }


    # Add a single system user for this system user if it doesn't exist
    my $system_user = $c->model('DB::SystemUser')->search({
        owner => $user->id,
        username => $$params{username},
    })->next;

    my $key = $self->{digest_password_key};
    my $cipher = Crypt::CBC->new( -key => $key, -cipher => 'Blowfish' );
    my $encrypted_password = MIME::Base64::encode_base64($cipher->encrypt( $$params{password} ));
    if ($system_user) {
        if ($system_user->password ne $encrypted_password) {
            $system_user->update({
                password => $encrypted_password,
            });
        }
    }
    else {
        my $su = $self->getObject( 'SystemUser::Command', c => $c);
        my $run = {
            username => $$params{username},
            password => $$params{password},
            command  => 'mkdir -p ~/.s3ql ~/.pluton/authinfo ~/.pluton/backup ~/.pluton/scripts ~/.pluton/logs && touch ~/.s3ql/authinfo2 && chmod 600 ~/.s3ql/authinfo2',
        };
        my $output = $su->raw($run);
        $c->model('DB::SystemUser')->create({
            owner => $user->id,
            username => $$params{username},
            password => $encrypted_password,
        });
    }

    $self->__login($user);
    return $c->user->obj;
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
