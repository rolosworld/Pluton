package Pluton::Controller::SystemUser;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Main::Controller' }

=head2 add

=cut

sub add : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'SystemUser', c => $c )->add($params);
}

=head2 list

=cut

sub list : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'SystemUser', c => $c )->list;
}

=head2 s3ql

=cut

sub s3ql : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'SystemUser', c => $c )->s3ql( $params );
}

=head2 s3ql_remount

=cut

sub s3ql_remount : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'SystemUser', c => $c )->s3ql_remount( $params );
}

=head2 folders

=cut

sub folders : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'SystemUser', c => $c )->folders( $params );
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
