package Main::Events;
use strict;
use warnings;

our %events = ();

sub add {
    my ( $type, $callback ) = @_;
    if ( !defined $events{$type} ) {
        $events{$type} = [];
    }

    push( @{ $events{$type} }, $callback );
}

sub getAll {
    return %events;
}

sub fire {
    my $type = shift;
    foreach my $callback ( @{ $events{$type} } ) {
        &$callback(@_);
    }
}

sub rm {
    my $type = shift;
    delete $events{$type};
}

sub flush {
    %events = {};
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