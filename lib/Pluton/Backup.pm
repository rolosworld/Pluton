package Pluton::Backup;
use Modern::Perl;
use Moose;
use namespace::autoclean;
use Main::JSON::Validator;

extends 'Pluton::SystemUser::Command';

our $__backup_schema = {
    required   => [qw(system_user schedule name folders)],
    properties => {
        id => { type => 'integer', minimum => 1, maximum => 10000 },
        system_user => { type => 'integer', minimum => 1, maximum => 10000 },
        schedule => { type => 'integer', minimum => 1, maximum => 10000 },
        name => { type => 'string', pattern => '^\w+$', minLength => 1, maxLength => 32 },
        folders => {
            type => 'array',
            items => {
                type => 'string', pattern => '^[ \/\.\w]+$', minLength => 1, maxLength => 255,
            },
        },
    }
};

sub __validate_backup {
    my ($self, $params) = @_;
    my $validator = Main::JSON::Validator->new;
    $validator->schema($__backup_schema);

    return $validator->validate($params);
}

sub edit {
    my ($self, $params) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_backup($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    my $exist = $c->model('DB::SystemUser')->search({
        id => $$params{system_user},
        owner => $c->user->id,
    })->next;

    if ( !$exist ) {
        $self->jsonrpc_error(
            [   {   path    => '/system_user',
                    message => 'System User does not exist',
                }
            ]);

        return;
    }

    $exist = $c->model('DB::Schedule')->search({
        id => $$params{schedule},
        creator => $c->user->id,
    })->next;

    if ( !$exist ) {
        $self->jsonrpc_error(
            [   {   path    => '/schedule',
                    message => 'Schedule does not exist',
                }
            ]);

        return;
    }


    $exist = $c->model('DB::Backup')->search({
        name => $$params{name},
    })->next;

    if ( $exist && $exist->id != $$params{id}) {
        # Show values also?
        $self->jsonrpc_error(
            [   {   path    => '/name',
                    message => 'Backup with the same name exist',
                }
            ]);

        return;
    }

    if (!$exist) {
        $exist = $c->model('DB::Backup')->search({
            id => $$params{id},
        })->next;
    }

    if ( !$exist ) {
        $self->jsonrpc_error(
            [   {   path    => '/id',
                    message => 'Backup does not exist',
                }
            ]);

        return;
    }

    my $values = {
        creator => $c->user->id,
        name => $$params{name},
        system_user => $$params{system_user},
        schedule => $$params{schedule},
        folders => join("\n", @{$$params{folders}}),
    };

    $exist->update($values);

    return $self->list;
}

sub add {
    my ($self, $params) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_backup($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    my $exist = $c->model('DB::Backup')->search({
        name => $$params{name},
    })->next;

    if ( $exist ) {
        # Show values also?
        $self->jsonrpc_error(
            [   {   path    => '/name',
                    message => 'Backup with the same name exist',
                }
            ]);

        return;
    }

    $exist = $c->model('DB::SystemUser')->search({
        id => $$params{system_user},
        owner => $c->user->id,
    })->next;

    if ( !$exist ) {
        $self->jsonrpc_error(
            [   {   path    => '/system_user',
                    message => 'System User does not exist',
                }
            ]);

        return;
    }

    $exist = $c->model('DB::Schedule')->search({
        id => $$params{schedule},
        creator => $c->user->id,
    })->next;

    if ( !$exist ) {
        $self->jsonrpc_error(
            [   {   path    => '/schedule',
                    message => 'Schedule does not exist',
                }
            ]);

        return;
    }

    my $values = {
        creator => $c->user->id,
        name => $$params{name},
        system_user => $$params{system_user},
        schedule => $$params{schedule},
        folders => join("\n", @{$$params{folders}}),
    };
    $c->model('DB::Backup')->create($values);

    return $self->list;
}

sub list {
    my ($self) = @_;
    my $c = $self->c;

    my @backups = $c->model('DB::Backup')->search({
        creator => $c->user->id,
    })->all;

    return \@backups;
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
