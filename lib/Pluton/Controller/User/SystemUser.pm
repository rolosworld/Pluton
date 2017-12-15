package Pluton::Controller::User::SystemUser;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Main::Controller' }

=head2 addmount

=cut

sub addmount : Remote {
    my ( $self, $c, $params ) = @_;
    my $system_user = $c->model('DB::SystemUser')->search({
        owner => $c->user->id,
    })->next;
    $$params{system_user} = $system_user->id;
    return $self->getObject( 'SystemUser', c => $c )->add_mount($params);
}

=head2 rmmount

=cut

sub rmmount : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'SystemUser', c => $c )->rm_mount($params);
}

=head2 editmount

=cut

sub editmount : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'SystemUser', c => $c )->edit_mount($params);
}

=head2 mountauthinfo2

=cut

sub mountauthinfo2 : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'SystemUser', c => $c )->mount_authinfo2($params);
}

=head2 mountmkfs

=cut

sub mountmkfs : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'SystemUser', c => $c )->mount_mkfs($params);
}

=head2 mountremount

=cut

sub mountremount : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'SystemUser', c => $c )->mount_remount($params);
}

=head2 mountumount

=cut

sub mountumount : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'SystemUser', c => $c )->mount_umount($params);
}

=head2 list_mounts

=cut

sub list_mounts : Remote {
    my ( $self, $c, $params ) = @_;
    my $system_user = $c->model('DB::SystemUser')->search({
        owner => $c->user->id,
    })->next;
    $$params{system_user} = $system_user->id;
    return $self->getObject( 'SystemUser', c => $c )->list_mounts($params);
}

=head2 list

=cut

sub list : Remote {
    my ( $self, $c, $params ) = @_;
    return $self->getObject( 'SystemUser', c => $c )->list;
}

=head2 folders

=cut

sub folders : Remote {
    my ( $self, $c, $params ) = @_;
    my $system_user = $c->model('DB::SystemUser')->search({
        owner => $c->user->id,
    })->next;
    $$params{user} = $system_user->id;
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
