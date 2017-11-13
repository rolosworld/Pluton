package Main::DBMethods::User;
use strict;
use warnings;

use Moose::Role;

=head2 is

=cut

sub is {
    my $self  = shift;
    my $roles = $self->getRoles;
    foreach (@_) {
        return 1 if $roles->{$_};
    }
    return 0;
}

=head2 getRoles

=cut

sub getRoles {
    my ($self) = @_;
    unless ( $self->{__roles} ) {
        my %roles = map { ( $_->role->name ) => $_->role->id }
            $self->memberships( undef, { prefetch => 'role' } )->all;
        $self->{__roles} = \%roles;
    }
    return $self->{__roles};
}

=head2 authorized

=cut

sub authorized {
    my ( $self, $path ) = @_;
    if ( substr( $path, -1 ) ne '/' ) {
        $path = $path . '/';
    }

    my $authorizations = $self->getAuthorizations;
    foreach my $authorization ( keys %$authorizations ) {
        return 1 if $path =~ /^$authorization.*/;
    }

    return 0;
}

=head2 getAuthorizations

=cut

sub getAuthorizations {
    my ( $self, $conf ) = @_;
    unless ( $self->{__authorizations} ) {
        my @roles = values %{ $self->getRoles };
        my @paths
            = $self->result_source->schema->resultset('PathAuthorization')
            ->search( { role => \@roles } )->get_column('path')->all;

        my %authorizations
            = map { ( substr( $_, -1 ) eq '/' ? $_ : $_ . '/' ) => 1 } @paths;
        $self->{__authorizations} = \%authorizations;
    }

    return $self->{__authorizations};
}

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
