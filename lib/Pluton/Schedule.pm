package Pluton::Schedule;
use Modern::Perl;
use Moose;
use namespace::autoclean;
use Main::JSON::Validator;

extends 'Pluton::SystemUser::Command';

our $__schedule_schema = {
    required   => [qw(name)],
    properties => {
        id => { type => 'integer', minimum => 1, maximum => 10000 },
        name => { type => 'string', pattern => '^\w+$', minLength => 1, maxLength => 32 },
        minute => { type => 'integer', minimum => 0, maximum => 59 },
        hour => { type => 'integer', minimum => 0, maximum => 23 },
        day_of_month => { type => 'integer', minimum => 1, maximum => 31 },
        month => { type => 'integer', minimum => 1, maximum => 12 },
        day_of_week => { type => 'integer', minimum => 0, maximum => 6 },
    }
};

sub __validate_schedule {
    my ($self, $params) = @_;
    my $validator = Main::JSON::Validator->new;
    $validator->schema($__schedule_schema);

    return $validator->validate($params);
}

sub edit {
    my ($self, $params) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_schedule($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    my $exist = $c->model('DB::Schedule')->search({
        name => $$params{name},
    })->next;

    if ( $exist && $exist->id != $$params{id}) {
        # Show values also?
        $self->jsonrpc_error(
            [   {   path    => '/name',
                    message => 'Schedule with the same name exist',
                }
            ]);

        return;
    }

    if (!$exist) {
        $exist = $c->model('DB::Schedule')->search({
            id => $$params{id},
        })->next;
    }

    if ( !$exist ) {
        $self->jsonrpc_error(
            [   {   path    => '/id',
                    message => 'Schedule does not exist',
                }
            ]);

        return;
    }

    my $values = {
        name => $$params{name},
        minute => $$params{minute},
        hour => $$params{hour},
        day_of_month => $$params{day_of_month},
        month => $$params{month},
        day_of_week => $$params{day_of_week},
    };
    $exist->update($values);

    return $self->list;
}

sub add {
    my ($self, $params) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_schedule($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    my $exist = $c->model('DB::Schedule')->search({
        name => $$params{name},
    })->next;

    if ( $exist ) {
        # Show values also?
        $self->jsonrpc_error(
            [   {   path    => '/name',
                    message => 'Schedule with the same name exist',
                }
            ]);

        return;
    }

    my $values = {
        creator => $c->user->id,
        name => $$params{name},
        minute => $$params{minute},
        hour => $$params{hour},
        day_of_month => $$params{day_of_month},
        month => $$params{month},
        day_of_week => $$params{day_of_week},
    };
    $c->model('DB::Schedule')->create($values);

    return $self->list;
}

sub list {
    my ($self) = @_;
    my $c = $self->c;

    my @schedules = $c->model('DB::Schedule')->all;
    return \@schedules;
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
