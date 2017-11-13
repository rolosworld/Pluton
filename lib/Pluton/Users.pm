package Pluton::Users;
use Modern::Perl;
use Moose;
use namespace::autoclean;
use JSON::Validator;

extends 'Main::Module';

our $__get_schema = {
    properties => {
        id => { type => 'integer' },
    }
};

sub get {
    my ( $self, $params ) = @_;
    my $c = $self->c;

    if (!$$params{id}) {
        return $c->user->obj;
    }

    my $validator = JSON::Validator->new;
    $validator->schema($__get_schema);

    my @errors = $validator->validate($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    # Get user
    my $user = $c->model('DB::User')->search({id => $$params{id}})->next;

    # If Not Found
    if (!$user) {
        # Return error
        $self->jsonrpc_error(
            [   {   path    => '/id',
                    message => 'No such user',
                }
            ]);
    }

    return {
        id    => $user->id,
        alias => $user->alias,
    };
}

no Moose;

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
