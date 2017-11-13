package Main::Roles::JSONRPCv2::Response;
use Moose::Role;

our %ERROR = (
    PARSE_ERROR => {
        code    => -32700,
        message => "Parse error"
    },
    INVALID_REQUEST => {
        code    => -32600,
        message => "Invalid Request"
    },
    METHOD_NOT_FOUND => {
        code    => -32601,
        message => "Method not found"
    },
    INVALID_PARAMS => {
        code    => -32602,
        message => "Invalid params"
    },
    INTERNAL_ERROR => {
        code    => -32603,
        message => "Internal error"
    },
    SERVER_ERROR => {
        code    => -32000,
        message => "Server error"
    },
);

sub jsonrpc_error_code {
    my ($self, $error) = @_;
    return $ERROR{$error} if $error;
    return \%ERROR;
}

sub jsonrpc_response_build {
    my ( $self, $data ) = @_;
    return {
        jsonrpc => "2.0",
        %$data
    };
}

sub jsonrpc_response_result {
    my ( $self, $id, $res ) = @_;
    return if !defined $id;
    return $self->jsonrpc_response_build(
        {   result => $res,
            id     => $id,
        }
    );
}

sub jsonrpc_response_error {
    my ( $self, $id, $error, $data ) = @_;
    my %_error = %$error;
    $_error{data} = $data if $data;
    return $self->jsonrpc_response_build(
        {   error => \%_error,
            id    => $id
        }
    );
}

sub parse_error {
    my ($self, $id, $data) = @_;
    return $self->jsonrpc_response_error( $id, $ERROR{PARSE_ERROR}, $data );
}

sub invalid_request {
    my ($self, $id, $data) = @_;
    return $self->jsonrpc_response_error( $id, $ERROR{INVALID_REQUEST}, $data );
}

sub method_not_found {
    my ($self, $id, $data) = @_;
    return $self->jsonrpc_response_error( $id, $ERROR{METHOD_NOT_FOUND}, $data );
}

sub invalid_params {
    my ($self, $id, $data) = @_;
    return $self->jsonrpc_response_error( $id, $ERROR{INVALID_PARAMS}, $data );
}

sub internal_error {
    my ($self, $id, $data) = @_;
    return $self->jsonrpc_response_error( $id, $ERROR{INTERNAL_ERROR}, $data );
}

sub server_error {
    my ($self, $id, $data) = @_;
    return $self->jsonrpc_response_error( $id, $ERROR{SERVER_ERROR}, $data );
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
