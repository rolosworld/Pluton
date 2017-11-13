package Pluton::Controller::Account;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Main::Controller' }

=head2 login

=cut

sub login : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'Account', c => $c )->login($params);
}

=head2 logout

=cut

sub logout : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'Account', c => $c )->logout;
}

=encoding utf8

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

__PACKAGE__->meta->make_immutable;

1;
