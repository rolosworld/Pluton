package Pluton::Controller::JSONRPCv2;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Main::Controller::JSONRPCv2'; }

use Main::Events;

Main::Events::add(
    'websocket_read_JSONRPCv2',
    sub {
        my $ws    = shift;
        my $args  = shift;

        my $c = $ws->c;

        my $response = {
            type => 'JSONRPCv2',
            id   => $$args{id},
            data => $c->controller('JSONRPCv2')->getResponse( $c, $$args{data} )
        };

        $ws->send($response);
    }
);

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
