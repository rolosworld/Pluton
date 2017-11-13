package Main::Roles::Methods;
use Moose::Role;

use Class::Load ':all';
use DateTime;
use JSON;

=head2 getNameSplit

=cut

sub getNameSplit {
    my $self = shift;
    if ( !$self->{__namespace_split} ) {
        my @namespace_split = split '::', ref $self;
        $self->{__namespace_split} = \@namespace_split;
    }
    return $self->{__namespace_split};
}

=head2 getNamespace

=cut

sub getNamespace {
    return shift->getNameSplit->[0];
}

=head2 getModuleName

=cut

sub getModuleName {
    return shift->getNameSplit->[-1];
}

=head2 getObjectName

=cut

sub getObjectName {
    my ( $self, $class ) = @_;
    return $self->getNamespace . '::' . $class;
}

=head2 getObject

=cut

sub getObject {
    my $self  = shift;
    my $class = shift;

    my $package = $self->getObjectName($class);

    if ( !is_class_loaded($package) ) {
        my ( $res, $e ) = try_load_class($package);
        if ( !$res ) {
            $self->log->error($e);
            $package = sprintf( 'Main::%s', $class );
            load_class($package);
        }
    }

    return $package->new(@_);
}

=head2 get_today

=cut

sub get_today {
    my $self = shift;
    my $today = DateTime->now( time_zone => 'local' );
    $today->truncate( to => 'day' );
    $today->set_hour(0);
    return $today;
}

=head2 log

=cut

sub log {
    my $self = shift;
    return $self->getNamespace->log;
}

=head2 jsonrpc_error

=cut

sub jsonrpc_error {
    my ( $self, $error ) = @_;
    die(sprintf( "SERVER_ERROR %s\n",
            JSON::to_json( $error, { convert_blessed => 1 } ) )
    );
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
