package Main::Roles::Controller;
use Moose::Role;

=head2 authorized

=cut

sub authorized {
    my ( $self, $c, $path ) = @_;

    # Load public authorizations
    if ( !$$self{__public_authorizations} ) {
        my @paths
            = $c->model('DB::PathAuthorization')->search( { role => undef } )
            ->get_column('path')->all;

        my %authorizations
            = map { ( substr( $_, -1 ) eq '/' ? $_ : $_ . '/' ) => 1 } @paths;

        $$self{__public_authorizations} = \%authorizations;
    }

    if ( substr( $path, -1 ) ne '/' ) {
        $path = $path . '/';
    }

    # Authorize public paths
    foreach ( keys %{ $$self{__public_authorizations} } ) {
        return 1 if $path =~ /^$_.*/;
    }

    # Authorize protected paths
    if ( $c->user_exists && $c->user->authorized($path) ) {
        return 1;
    }

    return 0;
}

=head2 setNoCacheHeaders

=cut

sub setNoCacheHeaders {
    my ( $self, $c ) = @_;
    $c->res->header( 'Cache-Control' =>
            'no-store, no-cache, must-revalidate, max-age=0,post-check=0, pre-check=0'
    );
    $c->res->header( 'Expires'       => 'Tue, 01 Jan 2000 00:00:00 GMT' );
    $c->res->header( 'Last-Modified' => 'Tue, 01 Jan 2000 00:00:00 GMT' );
    $c->res->header( 'Pragma'        => 'no-cache' );
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
