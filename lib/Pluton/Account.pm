package Pluton::Account;
use Modern::Perl;
use Moose;
use namespace::autoclean;
use Crypt::SaltedHash;
use Digest::SHA1 qw{sha1_base64};

extends 'Main::Account';

our $__login_schema = {
    required   => [qw(username password)],
    properties => {
        username => { type => 'string', format => 'email', minLength => 5, maxLength => 255 },
        password => { type => 'string', minLength => 8, maxLength => 255 },
    }
};

sub __get_login_schema {
    return $__login_schema;
}

sub __validate_password {
    my ($self, $user, $params) = @_;
    my $result = $self->SUPER::__validate_password($user, $params);

    # Since the user signed in succesfully,
    # We generate the digest string from the password, so we can decrypt the system_users passwords
    # We split the digest between session and cookie to make it a bit more "secure"
    if ( $result ) {
        my $digest = sha1_base64($$params{password});
        my $session_part = substr($digest, 0, -8);
        my $cookie_part = substr($digest, -8);
        my $c = $self->c;
        $c->session->{system_user_digest} = $session_part;
        $c->response->cookies->{system_user_digest} = {value => $cookie_part};
    }

    return $result;
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
