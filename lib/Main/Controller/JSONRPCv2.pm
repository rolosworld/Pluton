package Main::Controller::JSONRPCv2;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Main::Controller'; }

with 'Main::Roles::JSONRPCv2::Response';

use JSON;

sub index : Path : Args(0) {
    my ( $self, $c ) = @_;
    $c->res->content_type('text/javascript+json');
    my $body = $c->req->body;
    my $content = do { local $/; <$body> };
    my $res = $self->getResponse( $c, $content );
    $c->res->body( $res );
}

sub getResponse {
    my ( $self, $c, $content ) = @_;

    my $req;

    my $res = $self->invalid_request;

    {
        my $error_handler = sub {
            my $error = shift;
            $c->log->error($error);
            my @parts = split( ' ', $error, 2 );
            my $method = $parts[0];
            my $message = $self->jsonrpc_error_code( $method );
            if ( defined $message ) {
                $method = lc $method;
                my $data;
                if (scalar @parts > 1) {
                    $data = JSON::from_json( $parts[1] );
                }
                $res = $self->$method( $c->stash->{current_id}, $data );
            }
            else {
                $res = $self->internal_error( $c->stash->{current_id} );
            }
        };

        local $SIG{__DIE__} = sub {
            $res = $self->parse_error( $c->stash->{current_id} );
        };
        eval {
            $req = JSON::from_json($content);

            if ( ref $req eq 'ARRAY' && @$req ) {
                my $results = [];
                foreach (@$req) {
                    $c->stash->{current_id} = undef;

                    # Handle method errors
                    local $SIG{__DIE__} = $error_handler;
                    eval { $res = $self->process( $c, $_ ); };

                    if ($res) {
                        push( @$results, $res );
                    }
                }
                $res = $results;
                $res = '' if !@$res;
            }
            else {
                $c->stash->{current_id} = undef;

                # Handle method errors
                local $SIG{__DIE__} = $error_handler;
                eval { $res = $self->process( $c, $req ); }

            }
        };
    }

    if ($res) {
        $res = JSON::to_json( $res, { convert_blessed => 1 } );
    }

    return $res || '';
}

sub process {
    my ( $self, $c, $req ) = @_;

    if (   ref $req ne 'HASH'
        || !defined $$req{jsonrpc}
        || $$req{jsonrpc} ne '2.0'
        || !defined $$req{method}
        || !( $$req{method} =~ /\w|\./ ) )
    {
        return $self->invalid_request( ref $req eq 'HASH' ? $$req{id} : undef );
    }

    $c->stash->{current_id} = $$req{id};
    my $method = $$req{method};
    my @parts = split( '\.', $method );

    # rpc.* is reserved
    if ( $parts[0] eq 'rpc' ) {
        return $self->invalid_request( $$req{id} );
    }

    my $method_path = '/' . join( '/', @parts );
    $method = pop(@parts);
    my $controller = $c->controller( join( '::', @parts ) );

    if ( !$controller ) {
        return $self->method_not_found( $$req{id} );
    }

    if ( !$controller->can($method) ) {
        return $self->method_not_found( $$req{id} );
    }

    my $remote;
    my $attrs = $controller->meta->get_method($method)->attributes || [];
    foreach my $attr (@$attrs) {
        if ( $attr eq 'Remote' ) {
            $remote = 1;
            last;
        }
    }
    if ( !$remote ) {
        return $self->method_not_found( $$req{id} );
    }

    if ( !$self->authorized_method( $c, $method_path ) ) {
        return $self->method_not_found( $$req{id} );
    }

    $c->log->debug(
        sprintf( 'JSONRPCv2 executing: %s->%s', $controller, $method ) );
    return $self->jsonrpc_response_result( $$req{id},
        $controller->$method( $c, $$req{params} ) );
}

# Implement method authorization
sub authorized_method {
    my ( $self, $c, $method ) = @_;
    return $self->authorized( $c, $method );
}

1;
__END__

=head1 NAME

Main::Controller::JSONRPCv2

=head1 SYNOPSIS

Controller to handle JSONRPCv2 requests

=head1 DESCRIPTION


=head1 REFERENCES

code             | message          | meaning
-----------------|------------------|-----------------------------------------------------------
-32700           | Parse error      | Invalid JSON was received by the server. An error occurred
                 |                  | on the server while parsing the JSON text.
-32600           | Invalid Request  | The JSON sent is not a valid Request object.
-32601           | Method not found | The method does not exist / is not available.
-32602           | Invalid params   | Invalid method parameter(s).
-32603           | Internal error   | Internal JSON-RPC error.
-32000 to -32099 | Server error     | Reserved for implementation-defined server-errors.


EXAMPLES:

Syntax:

--> data sent to Server
<-- data sent to Client


rpc call with positional parameters:
--> {"jsonrpc": "2.0", "method": "subtract", "params": [42, 23], "id": 1}
<-- {"jsonrpc": "2.0", "result": 19, "id": 1}

--> {"jsonrpc": "2.0", "method": "subtract", "params": [23, 42], "id": 2}
<-- {"jsonrpc": "2.0", "result": -19, "id": 2}


rpc call with named parameters:
--> {"jsonrpc": "2.0", "method": "subtract", "params": {"subtrahend": 23, "minuend": 42}, "id": 3}
<-- {"jsonrpc": "2.0", "result": 19, "id": 3}

--> {"jsonrpc": "2.0", "method": "subtract", "params": {"minuend": 42, "subtrahend": 23}, "id": 4}
<-- {"jsonrpc": "2.0", "result": 19, "id": 4}


a Notification (has no id):
--> {"jsonrpc": "2.0", "method": "update", "params": [1,2,3,4,5]}
--> {"jsonrpc": "2.0", "method": "foobar"}


rpc call of non-existent method:
--> {"jsonrpc": "2.0", "method": "foobar", "id": "1"}
<-- {"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": "1"}


rpc call with invalid JSON:
--> {"jsonrpc": "2.0", "method": "foobar, "params": "bar", "baz]
<-- {"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}, "id": null}


rpc call with invalid Request object:
--> {"jsonrpc": "2.0", "method": 1, "params": "bar"}
<-- {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}


rpc call Batch, invalid JSON:
--> [  {"jsonrpc": "2.0", "method": "sum", "params": [1,2,4], "id": "1"},  {"jsonrpc": "2.0", "method"]
<-- {"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}, "id": null}


rpc call with an empty Array:
--> []
<-- {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}


rpc call with an invalid Batch (but not empty):
--> [1]
<-- [  {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null} ]


rpc call with invalid Batch:
--> [1,2,3]
<-- [
 {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null},
 {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null},
 {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}
]


rpc call Batch:
--> [
        {"jsonrpc": "2.0", "method": "sum", "params": [1,2,4], "id": "1"},
        {"jsonrpc": "2.0", "method": "notify_hello", "params": [7]},
        {"jsonrpc": "2.0", "method": "subtract", "params": [42,23], "id": "2"},
        {"foo": "boo"},
        {"jsonrpc": "2.0", "method": "foo.get", "params": {"name": "myself"}, "id": "5"},
        {"jsonrpc": "2.0", "method": "get_data", "id": "9"}
    ]
<-- [
        {"jsonrpc": "2.0", "result": 7, "id": "1"},
        {"jsonrpc": "2.0", "result": 19, "id": "2"},
        {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null},
        {"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": "5"},
        {"jsonrpc": "2.0", "result": ["hello", 5], "id": "9"}
    ]


rpc call Batch (all notifications):
--> [
        {"jsonrpc": "2.0", "method": "notify_sum", "params": [1,2,4]},
        {"jsonrpc": "2.0", "method": "notify_hello", "params": [7]}
    ]
<-- //Nothing is returned for all notification batches


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
