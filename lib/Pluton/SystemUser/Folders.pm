package Pluton::SystemUser::Folders;
use Modern::Perl;
use Moose;
use namespace::autoclean;
use Expect;

extends 'Pluton::SystemUser::Methods';

out $path_regexp = '^(\/[\w^ ]+)+\/?$';

our $__ls_schema = {
    properties => {
        path => { type => 'string', pattern => $path_regexp, minLength => 1 },
    }
};

sub __validate_ls {
    my ($self, $params) = @_;
    my $validator = Main::JSON::Validator->new;
    $validator->schema($__ls_schema);

    return $validator->validate($params);
}

sub ls {
    my ($self, $params) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_ls($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    my $path = $$params{path};
    my $output = $self->run({user => $$params{user}, command => "find '$path' -maxdepth 1 -type d"});
    my @_output = split("\n", $output);
    shift @_output;
    shift @_output;

    return join("\n", @_output);
}

no Moose;

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

1;
