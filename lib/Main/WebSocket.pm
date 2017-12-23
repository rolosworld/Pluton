package Main::WebSocket;
use Moose;

extends 'Main::Module';

use Protocol::WebSocket::Handshake::Server;
use AnyEvent::Handle;
use JSON;

Main::Events::add(
    'websocket_handshake',
    sub {
        my $ws  = shift;
        $Main::WebSocket::Globals::WebSockets{$ws} = $ws;
    }
);

Main::Events::add(
    'websocket_error',
    sub {
        my $ws  = shift;
        if ($Main::WebSocket::Globals::WebSockets{$ws}) {
            delete $Main::WebSocket::Globals::WebSockets{$ws};
        }
    }
);

sub __on_error {
    my ($self) = @_;
    return sub {
        my $error = pop;
        Main::Events::fire( 'websocket_error', $self, $error );
        $self->c->log->error(
            sprintf( 'Error[%s]: %s', $self->c->user_exists ? $self->c->user->username : '*', $error )
        );
    };
}

sub session_expired {
    my ($self) = @_;
    my $c = $self->c;

    if ($c->user_exists && $c->session_expires < time()) {
        $self->destroy;
        $self->{queue} = [];
        $c->logout;
        $c->delete_session("session expired");
        return 1;
    }

    $c->reset_session_expires;
    return 0;
}

sub __on_read {
    my ($self) = @_;
    return sub {
        # Close connection if session expired
        if ($self->session_expired) {
            return;
        }

        $self->{lock} = 1;
        my $hs = $self->{handshake};
        my $frame = $hs->build_frame;
        $frame->append( $_[0]->rbuf );

        my $error = 0;
        while ( my $message = $frame->next ) {
            # Fire event websocket_read
            my $decoded;
            eval { $decoded = decode_json($message); };

            if ($@) {
                Main::Events::fire( 'websocket_error', $self, $@ );
                $error = 1;
                last;
            }

            if ($decoded) {
                Main::Events::fire( 'websocket_read', $self, $decoded );
                Main::Events::fire( 'websocket_read_' . $decoded->{type}, $self, $decoded );
            }
        }
        $self->{lock} = 0;

        if ($error) {
            $self->destroy;
            $self->{queue} = [];
            return;
        }

        $self->processQueue;
    };
}

sub handshake {
    my ($self) = @_;

    my $c  = $self->c;
    my $hs = $self->{handshake}
        = Protocol::WebSocket::Handshake::Server->new_from_psgi(
        $c->req->env );

    my $hd = $self->{handle} = AnyEvent::Handle->new(
        fh       => $c->req->io_fh,
        on_error => $self->__on_error
    );

    if ($self->session_expired) {
        return;
    }

    $hs->parse( $hd->fh );

    $hd->push_write( $hs->to_string );

# $hd->push_write( $hs->build_frame( buffer => "Echo Initiated" )->to_bytes );

    # Fire event websocket_handshake
    $self->{lock} = 1;
    Main::Events::fire( 'websocket_handshake', $self );

    $hd->on_read( $self->__on_read );

    $self->{lock} = 0;
    $self->processQueue;
}

sub processQueue {
    my ($self) = @_;

    foreach my $args ( @{$self->{queue}} ) {
        $self->send( $args );
    }

    $self->{queue} = [];
}

sub send {
    my ( $self, $args ) = @_;
    if (!$args->{force} && $self->{lock}) {
        if ( ! defined $self->{queue} ) {
            $self->{queue} = [];
        }

        push( @{$self->{queue}}, $args );
        return;
    }

    my $json = encode_json($args);
    my $message
        = $self->{handshake}->build_frame( buffer => $json )->to_bytes;
    $self->{handle}->push_write($message);
}

sub close {
    my ( $self, $args ) = @_;
    $self->{lock} = 0;
    $self->{queue} = [];

    my $message
        = $self->{handshake}->build_frame( type => 'close' )->to_bytes;
    $self->{handle}->push_write($message);
}

sub destroy {
    my ($self) = @_;
    $self->close;
    $self->c->log->info('WebSocket destroyed');
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
