package Main::Account;
use Modern::Perl;
use Moose;
use namespace::autoclean;
use Main::JSON::Validator;
use Crypt::SaltedHash;

extends 'Main::Module';

our $__login_schema = {
    required   => [qw(username password)],
    properties => {
        username => { type => 'string', format => 'email', minLength => 5, maxLength => 255 },
        password => { type => 'string', minLength => 6, maxLength => 255 },
    }
};

sub __login {
    my ($self, $user) = @_;
    my $c = $self->c;
    $c->set_authenticated($user); # logs the user in and calls persist_user
}

sub __validate_login {
    my ($self, $params) = @_;
    my $validator = Main::JSON::Validator->new;
    $validator->schema($__login_schema);

    return $validator->validate($params);
}

sub login {
    my ( $self, $params ) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_login($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

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
        if ( Crypt::SaltedHash->validate( $user->password, $$params{password}, 4 ) ) {
            $self->__login($user);
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

sub logout {
    my ( $self, $params ) = @_;
    my $c = $self->c;

    if ( $c->user_exists ) {
        $c->log->info( 'Logout: ' . $c->user->id );
    }

    # Clean DB sockets
    my $websockets = $c->user->obj->user_websockets->delete;
    $c->logout;
    $c->delete_session("logout");
    return {};
}

no Moose;

1;
__END__

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
