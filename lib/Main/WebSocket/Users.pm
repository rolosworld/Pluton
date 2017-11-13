package Main::WebSocket::Users;
use strict;
use warnings;

Main::Events::add(
    'websocket_handshake',
    sub {
        my $ws  = shift;
        my $c = $ws->c;
        my $user = $c->user->obj;
        my $sid  = $c->config->{pusher} ? $c->config->{pusher}->{server_id} : 0;
        $c->model('DB::UserWebSocket')->create({
            user      => $user->id,
            server    => $sid,
            websocket => $ws . '',
        });

        $ws->send(
            {   type => 'system',
                data  => sprintf( 'Connected with UID( %d ) SID( %d )', $user->id, $sid )
            }
        );
    }
);

Main::Events::add(
    'websocket_error',
    sub {
        my $ws  = shift;
        my $websocket = $ws->c->model('DB::UserWebsocket')->search({
            server    => $ws->c->config->{pusher} ? $ws->c->config->{pusher}->{server_id} : 0,
            websocket => $ws . ''
        });
        if ( $websocket ) {
            Main::Events::fire('websocket_users_user_disconnect', $ws);
            $websocket->delete;
        }
    }
);

sub sendAll {
    my $args = shift;
    my $websockets = \%Main::WebSocket::Globals::WebSockets;
    foreach my $websocket ( keys %$websockets ) {
        $$websockets{$websocket}->send($args);
    }
}

sub sendTo {
    my ($c, $users, $args) = @_;

    my $websockets = \%Main::WebSocket::Globals::WebSockets;
    my $sid = $c->config->{pusher} ? $c->config->{pusher}->{server_id} : 0;
    my $sockets = $c->model('DB::UserWebsocket')->search({
        server => $sid,
        user   => $users
    })->get_column('websocket');
    my @garbage;
    while (my $socket = $sockets->next ) {
        if ($$websockets{$socket}) {
            $$websockets{$socket}->send($args);
        }
        else {
            push(@garbage, $socket);
        }
    }
    $c->model('DB::UserWebsocket')->search({
        websocket => \@garbage,
        server    => $sid
    })->delete;
}

sub sendToPusher {
    my ($c, $users, $args) = @_;

    my $pusher_client = $Main::WebSocket::Globals::PusherClient;

    my $sid = $c->config->{pusher} ? $c->config->{pusher}->{server_id} : 0;

    # Send using pusher to users on other servers
    # Get users websocket + server
    # uid, server_id
    my $sockets = $c->model('DB::UserWebsocket')->search({
        server => {
            '!=' => $sid
        },
        user   => $users
    });

    my $push_args = {};
    while (my $socket = $sockets->next ) {
        $sid = $socket->server;
        if (!$$push_args{$sid}) {
            $$push_args{$sid} = {
                users => [],
                args  => $args,
            };
        }

        push(@{$$push_args{$sid}{users}}, $socket->get_column('user'));
    }

    if (scalar keys %$push_args) {
        $pusher_client->send({
            type => 'data',
            data => $push_args
        });
    }
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
