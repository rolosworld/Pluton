package Pluton::Backup;
use Modern::Perl;
use Moose;
use namespace::autoclean;
use Main::JSON::Validator;

extends 'Pluton::SystemUser::Command';

our $__backup_schema = {
    required   => [qw(system_user mount schedule name folders keep)],
    properties => {
        id => { type => 'integer', minimum => 1, maximum => 10000 },
        system_user => { type => 'integer', minimum => 1, maximum => 10000 },
        mount => { type => 'integer', minimum => 1, maximum => 10000 },
        schedule => { type => 'integer', minimum => 1, maximum => 10000 },
        keep => { type => 'integer', minimum => 0, maximum => 100 },
        name => { type => 'string', minLength => 1, maxLength => 80 },
        folders => {
            type => 'array',
            minItems => 1,
            items => {
                type => 'string', pattern => '^[ \/\-\w]+$', minLength => 2, maxLength => 255,
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

    my $mount = $c->model('DB::Mount')->search({
        id => $$params{mount},
        system_user => $$params{system_user},
        creator => $c->user->id,
    })->next;

    if ( !$mount ) {
        $self->jsonrpc_error(
            [   {   path    => '/mount',
                    message => 'Mount does not exist',
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
        creator => $c->user->id,
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
        mount => $$params{mount},
        schedule => $$params{schedule},
        keep => $$params{keep},
        folders => join("\n", @{$$params{folders}}),
    };

    $exist->update($values);
    $self->getObject('Object::Backup', c=> $c, backup => $exist)->crontab;

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
        creator => $c->user->id,
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

    $exist = $c->model('DB::Mount')->search({
        id => $$params{mount},
        system_user => $$params{system_user},
        creator => $c->user->id,
    })->next;

    if ( !$exist ) {
        $self->jsonrpc_error(
            [   {   path    => '/mount',
                    message => 'Mount does not exist',
                }
            ]);

        return;
    }

    my $values = {
        creator => $c->user->id,
        name => $$params{name},
        system_user => $$params{system_user},
        mount => $$params{mount},
        schedule => $$params{schedule},
        keep => $$params{keep},
        folders => join("\n", @{$$params{folders}}),
    };
    my $backup = $c->model('DB::Backup')->create($values);
    $self->getObject('Object::Backup', c=> $c, backup => $backup)->crontab;

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

our $__backup_restore_schema = {
    required   => [qw(backup destination)],
    properties => {
        backup => { type => 'integer', minimum => 1, maximum => 10000 },
        source => { type => 'string', pattern => '^[\-\w\:]+$', minLength => 19, maxLength => 19, },
        destination => { type => 'string', pattern => '^[ \/\-\w]+$', minLength => 2, maxLength => 255 },
    }
};

sub __validate_restore {
    my ($self, $params) = @_;
    my $validator = Main::JSON::Validator->new;
    $validator->schema($__backup_restore_schema);

    return $validator->validate($params);
}

sub restore {
    my ($self, $params) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_restore($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    my $backup = $c->model('DB::Backup')->search({
        id => $$params{backup},
    })->next;

    if ( !$backup ) {
        $self->jsonrpc_error(
            [   {   path    => '/backup',
                    message => 'Backup does not exist',
                }
            ]);

        return;
    }

    my $path = $$params{destination};
    if (defined $path) {
        my @parts = split('/', $path);
        foreach my $part (@parts) {
            unless ($part =~ /[ \-\w]/) {
                $self->jsonrpc_error(
                    [   {   path    => '/destination',
                            message => 'Invalid path',
                        }
                    ]);
                last;
            }
        }
    }

    # Restore backup:
    my $dest = $$params{destination};
    my $source = $$params{source};
    my $bid = $backup->id;

    # No date means we use the current backup
    my $src = "current/$bid";
    if ($source) {
        $src = "previous/$bid/\"$source\"";
    }

    my $backup_dest = $self->getObject('Object::Mount', c => $c, mount => $backup->mount)->path;

    my $output = $self->run({user => $backup->system_user->id, command => "rsync -avh $backup_dest/$src ~/\"$dest\"  &>> ~/.pluton/logs/$bid.log"});
    my @_output = split("\n", $output);
    return \@_output;
}

our $__backup_sources_schema = {
    required   => [qw(backup)],
    properties => {
        backup => { type => 'integer', minimum => 1, maximum => 10000 },
    }
};

sub __validate_sources {
    my ($self, $params) = @_;
    my $validator = Main::JSON::Validator->new;
    $validator->schema($__backup_sources_schema);

    return $validator->validate($params);
}

sub sources {
    my ($self, $params) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_sources($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    my $backup = $c->model('DB::Backup')->search({
        id => $$params{backup},
    })->next;

    if ( !$backup ) {
        $self->jsonrpc_error(
            [   {   path    => '/backup',
                    message => 'Backup does not exist',
                }
            ]);

        return;
    }

    my $bid = $backup->id;
    my $backup_dest = $self->getObject('Object::Mount', c => $c, mount => $backup->mount)->local_path;
    my $path = "$backup_dest/previous/$bid";
    my $output = $self->run({user => $backup->system_user->id, command => "find '$path' -maxdepth 1 -type d -regex '\.[/0-9a-zA-Z_ -:]+' | cut -f 6 -d '/'"});
    my @_output = split("\n", $output);
    shift @_output;
    shift @_output;
    shift @_output;

    return \@_output;
}

sub now {
    my ($self, $params) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_sources($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    my $backup = $c->model('DB::Backup')->search({
        id => $$params{backup},
    })->next;

    if ( !$backup ) {
        $self->jsonrpc_error(
            [   {   path    => '/backup',
                    message => 'Backup does not exist',
                }
            ]);

        return;
    }

    my $output = $self->getObject('Object::Backup', c => $c, backup => $backup)->now;
    return $output;
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
