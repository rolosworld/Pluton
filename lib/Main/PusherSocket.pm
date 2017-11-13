package Main::PusherSocket;
use Moose;

extends 'Main::Module';

use Protocol::WebSocket::Handshake::Server;
use AnyEvent::Handle;
use JSON;

Main::Events::add(
    'pushersocket_handshake',
    sub {
        my $ws  = shift;
        my $c   = $ws->c;
        # Get the server id of the connected user
        my $sid = $c->config->{server_pusher_map} ? $c->config->{server_pusher_map}->{($c->user->username)} : 0;
        $Main::WebSocket::Globals::PusherSockets{$sid} = $ws;
    }
);

Main::Events::add(
    'pushersocket_error',
    sub {
        my $ws  = shift;
        my $c   = $ws->c;
        $ws->destroy;

        if (!$c->user_exists) {
            return;
        }

        # Get the server id of the connected user
        my $sid = $c->config->{server_pusher_map} ? $c->config->{server_pusher_map}->{($c->user->username)} : 0;
        if ($Main::WebSocket::Globals::PusherbSockets{$sid}) {
            delete $Main::WebSocket::Globals::PusherSockets{$sid};
        }
    }
);

Main::Events::add(
    'pushersocket_read_data',
    sub {
        my $ws      = shift;
        my $args    = shift;
        my $c       = $ws->c;
        if (!$c->user_exists) {
            return;
        }

        my $sockets = \%Main::WebSocket::Globals::PusherSockets;

        $args = $$args{data};
        if ($args) {
            foreach my $sid (keys %$args) {
                # Get the destination server id
                my $server   = $$sockets{$sid};

                if ( $server ) {
                    my $data = $$args{$sid};

                    $server->send( {
                        type  => 'pusher_msg',
                        users => $$data{users},
                        data  => $$data{args}
                    } );
                }
                else {
                    $c->log->error(
                        sprintf( 'Error[%d]: %s', $sid, 'Pusher socket invalid' )
                    );
                }
            }
        }
    }
);

sub handshake {
    my ($self) = @_;

    my $c  = $self->c;
    # User should exist already if he reached the handshake

    my $hs = $self->{handshake}
        = Protocol::WebSocket::Handshake::Server->new_from_psgi(
        $c->req->env );

    my $hd = $self->{handle} = AnyEvent::Handle->new(
        fh       => $c->req->io_fh,
        on_error => sub {
            my $error = pop;
            Main::Events::fire( 'pushersocket_error', $self, $error );
            $c->log->error(
                sprintf( 'Error[%s]: %s', $self->c->user->username, $error )
            );
        }
    );

    $hs->parse( $hd->fh );

    $hd->push_write( $hs->to_string );

    Main::Events::fire( 'pushersocket_handshake', $self );

    # Need to send pings to keep the sockets alive and clean invalid sockets!!!!

    $hd->on_read(
        sub {
            my $frame = $hs->build_frame;
            $frame->append( $_[0]->rbuf );

            while ( my $message = $frame->next ) {

                # Fire event websocket_read
                my $decoded;
                eval { $decoded = decode_json($message); };

                if ($@) {
                    Main::Events::fire( 'pushersocket_error', $self, $@ );
                }

                if ($decoded) {
                    Main::Events::fire( 'pushersocket_read', $self,
                        $decoded );
                    Main::Events::fire(
                        'pushersocket_read_' . $decoded->{type},
                        $self, $decoded );
                }
            }
        }
    );
}

sub send {
    my ( $self, $args ) = @_;
    my $json = encode_json($args);
    my $message
        = $self->{handshake}->build_frame( buffer => $json )->to_bytes;
    $self->{handle}->push_write($message);
}

sub destroy {
    my ($self) = @_;
    $self->c->log->info('PusherSocket destroyed');
    $self->{handle}->destroy;
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
