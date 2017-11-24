package Pluton::Backup;
use Modern::Perl;
use Moose;
use namespace::autoclean;
use Main::JSON::Validator;

extends 'Pluton::SystemUser::Command';

our $__backup_schema = {
    required   => [qw(system_user schedule name folders keep)],
    properties => {
        id => { type => 'integer', minimum => 1, maximum => 10000 },
        system_user => { type => 'integer', minimum => 1, maximum => 10000 },
        schedule => { type => 'integer', minimum => 1, maximum => 10000 },
        keep => { type => 'integer', minimum => 0, maximum => 100 },
        name => { type => 'string', minLength => 1, maxLength => 80 },
        folders => {
            type => 'array',
            items => {
                type => 'string', pattern => '^[ \/\.\-\w]+$', minLength => 1, maxLength => 255,
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
        keep => $$params{keep},
        folders => join("\n", @{$$params{folders}}),
    };

    $exist->update($values);
    $self->crontab({backup => $exist});

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
        keep => $$params{keep},
        folders => join("\n", @{$$params{folders}}),
    };
    my $backup = $c->model('DB::Backup')->create($values);
    $self->crontab({backup => $backup});

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

sub crontab {
    my ($self, $params) = @_;
    my $c = $self->c;
    my $backup = $$params{backup};
    my $user = $backup->get_column('system_user');
    my $keep = $backup->keep;
    my $bid = $backup->id;

    # Create backup destination
    my $output .= $self->run({user => $user, command => "mkdir -p ~/.pluton/backup/current/$bid ~/.pluton/backup/previous/$bid"});

    # Create backup script
    my @folders = split("\n", $backup->folders);
    foreach my $folder (@folders) {
        $output .= $self->run({user => $user, command => "echo '#!/bin/bash' >  ~/.pluton/scripts/$bid.sh"});
        $output .= $self->run({user => $user, command => "echo 'STAMP=`date +\"%Y-%m-%dT%H-%M-%S\"`' >>  ~/.pluton/scripts/$bid.sh"});

        # Manage previous backups
        if ($keep) {
            $output .= $self->run({user => $user, command => "echo 's3qlcp ~/.pluton/backup/current/$bid ~/.pluton/backup/previous/$bid/\${STAMP} &>> ~/.pluton/logs/$bid.log' >>  ~/.pluton/scripts/$bid.sh"});
            $output .= $self->run({user => $user, command => "echo 's3qllock ~/.pluton/backup/previous/$bid/\${STAMP} &>> ~/.pluton/logs/$bid.log' >>  ~/.pluton/scripts/$bid.sh"});
            $output .= $self->run({user => $user, command => "echo 'KEEP=$keep' >>  ~/.pluton/scripts/$bid.sh"});
            $output .= $self->run({user => $user, command => "echo 'CURR=`find ~/.pluton/backup/previous/$bid -maxdepth 1 -type d | wc -l`' >>  ~/.pluton/scripts/$bid.sh"});
            $output .= $self->run({user => $user, command => "echo 'DELTA=\$((CURR-KEEP))' >>  ~/.pluton/scripts/$bid.sh"});
            $output .= $self->run({user => $user, command => "echo 'if [ \${DELTA} -gt \"1\" ]; then' >>  ~/.pluton/scripts/$bid.sh"});
            $output .= $self->run({user => $user, command => "echo 'DELTA2=\$((DELTA-1))' >>  ~/.pluton/scripts/$bid.sh"});
            $output .= $self->run({user => $user, command => "echo 'find ~/.pluton/backup/previous/$bid -maxdepth 1 -type d | sort | head -\${DELTA} | tail -\${DELTA2} | xargs -n1 s3qlrm &>> ~/.pluton/logs/$bid.log' >>  ~/.pluton/scripts/$bid.sh"});
            $output .= $self->run({user => $user, command => "echo 'fi' >>  ~/.pluton/scripts/$bid.sh"});
        }

        # Try that the destination folder doesn't conflict with some other folder
        my @parts = split('/', $folder);
        my $fname = join('_', @parts);

        $output .= $self->run({user => $user, command => "echo 'rsync -avh ~/\"$folder/\" ~/.pluton/backup/current/$bid/\"$fname\" --delete &>> ~/.pluton/logs/$bid.log' >>  ~/.pluton/scripts/$bid.sh"});
        $output .= $self->run({user => $user, command => "chmod 700 ~/.pluton/scripts/$bid.sh"});
    }

    # Export the current crontab into a file:
    my $crontab = $self->run({user => $user, command => "crontab -l"});
    my @rows = split("\n", $crontab);
    my @new_crontab;

    # Empty our crontab
    $output .= $self->run({user => $user, command => "cat /dev/null >  ~/.pluton/crontab"});
    foreach my $row (@rows) {
        if ($row =~ /Password/ || $row =~ /no crontab for/) {
            next;
        }

        my @parts = split(' ', $row);

        # Filter out backup script
        if ( $parts[-1] ne "~/.pluton/scripts/$bid.sh" ) {
            $output .= $self->run({user => $user, command => "echo '$row' >>  ~/.pluton/crontab"});
        }
    }

    # Add new crontab line
    my $schedule = $backup->schedule;

    my $minute = $schedule->minute;
    my $hour = $schedule->hour;
    my $day_of_month = $schedule->day_of_month;
    my $month = $schedule->month;
    my $day_of_week = $schedule->day_of_week;

    $minute = defined $minute ? $minute : '*';
    $hour = defined $hour ? $hour : '*';
    $day_of_month = defined $day_of_month ? $day_of_month : '*';
    $month = defined $month ? $month : '*';
    $day_of_week = defined $day_of_week ? $day_of_week : '*';

    my $schedule_str = "$minute $hour $day_of_month $month $day_of_week";

    $output .= $self->run({user => $user, command => "echo '$schedule_str ~/.pluton/scripts/$bid.sh' >>  ~/.pluton/crontab"});

    # Import a file into crontab:
    $output .= $self->run({user => $user, command => "cat ~/.pluton/crontab | crontab -"});
    #$c->log->debug($output);

    return $output;
}

# Restore backup:
#     rsync -avh ~/.pluton/backup/previous/<backup_id>/<YYYYMMDDHHMMSS> ~/'<dest_folder>'  &>> ~/.pluton/logs/<backup_id>.log

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
