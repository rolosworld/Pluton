package Pluton::Object::Backup;
use Modern::Perl;
use Moose;
use namespace::autoclean;

extends 'Pluton::SystemUser::Command';

has 'backup' => ( is => 'rw' );

sub current_path {
    my ($self) = @_;
    my $c = $self->c;
    my $backup = $self->backup;
    my $bid = $backup->id;
    my $path = $self->getObject('Object::Mount', c => $c, mount => $backup->mount)->path;
    return "$path/current/$bid";
}

sub previous_path {
    my ($self) = @_;
    my $c = $self->c;
    my $backup = $self->backup;
    my $bid = $backup->id;
    my $path = $self->getObject('Object::Mount', c => $c, mount => $backup->mount)->path;
    return "$path/previous/$bid";
}

sub script_file {
    my ($self) = @_;
    my $backup = $self->backup;
    my $bid = $backup->id;
    return "~/.pluton/scripts/$bid.sh";
}

sub log_file {
    my ($self) = @_;
    my $backup = $self->backup;
    my $bid = $backup->id;
    return "~/.pluton/logs/$bid.log";
}

sub crontab_file {
    return "~/.pluton/crontab";
}

sub import_crontab {
    my ($self) = @_;
    my $backup = $self->backup;
    my $user = $backup->get_column('system_user');
    my $crontab_file = $self->crontab_file;

    # Import a file into crontab:
    return $self->run({user => $user, command => "cat $crontab_file | crontab -"});
}

sub cleanup_crontab {
    my ($self) = @_;
    my $backup = $self->backup;
    my $user = $backup->get_column('system_user');
    my $crontab_file = $self->crontab_file;
    my $script_file = $self->script_file;

    # Export the current crontab into a file:
    my $crontab = $self->run({user => $user, command => "crontab -l"});
    my @rows = split("\n", $crontab);

    # Empty our crontab
    my $output = $self->run({user => $user, command => "cat /dev/null >  $crontab_file"});
    shift @rows;
    shift @rows;
    foreach my $row (@rows) {
        if ($row =~ /no crontab for/) {
            next;
        }

        my @parts = split(' ', $row);

        # Filter out backup script
        if ( $parts[-1] ne "$script_file" ) {
            $output .= $self->run({user => $user, command => "echo '$row' >>  $crontab_file"});
        }
    }

    return $output;
}

sub crontab {
    my ($self) = @_;
    my $c = $self->c;
    my $backup = $self->backup;
    my $mount = $backup->mount;
    my $user = $backup->get_column('system_user');
    my $keep = $backup->keep;
    my $bid = $backup->id;

    my $current_path = $self->current_path;
    my $previous_path = $self->previous_path;

    my $script_file = $self->script_file;
    my $log_file = $self->log_file;
    my $crontab_file = $self->crontab_file;

    my $backup_dest = $self->getObject('Object::Mount', c => $c, mount => $mount)->path;

    # Create backup destination
    my $output .= $self->run({user => $user, command => "mkdir -p $current_path $previous_path"});

    # Create backup script
    $output .= $self->run({user => $user, command => "echo '#!/bin/bash' >  $script_file"});
    $output .= $self->run({user => $user, command => "echo 'STAMP=`date +\"%Y-%m-%dT%H-%M-%S\"`' >>  $script_file"});

    # Manage previous backups
    if ($keep) {
        $output .= $self->run({user => $user, command => "echo 's3qlcp $current_path $previous_path/\${STAMP} &>> $log_file' >>  $script_file"});
        $output .= $self->run({user => $user, command => "echo 's3qllock $previous_path/\${STAMP} &>> $log_file' >>  $script_file"});
        $output .= $self->run({user => $user, command => "echo 'KEEP=$keep' >>  $script_file"});
        $output .= $self->run({user => $user, command => "echo 'CURR=`find $previous_path -maxdepth 1 -type d | wc -l`' >>  $script_file"});
        $output .= $self->run({user => $user, command => "echo 'DELTA=\$((CURR-KEEP))' >>  $script_file"});
        $output .= $self->run({user => $user, command => "echo 'if [ \${DELTA} -gt \"1\" ]; then' >>  $script_file"});
        $output .= $self->run({user => $user, command => "echo 'DELTA2=\$((DELTA-1))' >>  $script_file"});
        $output .= $self->run({user => $user, command => "echo 'find $previous_path -maxdepth 1 -type d | sort | head -\${DELTA} | tail -\${DELTA2} | xargs -n1 s3qlrm &>> $log_file' >>  $script_file"});
        $output .= $self->run({user => $user, command => "echo 'fi' >>  $script_file"});
    }

    my @folders = split("\n", $backup->folders);
    foreach my $folder (@folders) {

        # Try that the destination folder doesn't conflict with some other folder
        my @parts = split('/', $folder);
        my $fname = join('_', @parts);

        $output .= $self->run({user => $user, command => "echo 'rsync -avh ~/\"$folder/\" $current_path/\"$fname\" --delete &>> $log_file' >>  $script_file"});
        $output .= $self->run({user => $user, command => "chmod 700 $script_file"});
    }

    $output .= $self->cleanup_crontab;

    # Add new crontab line
    my $schedule = $c->model('DB::Schedule')->search({
        id => $backup->get_column('schedule'),
    })->next;

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

    $output .= $self->run({user => $user, command => "echo '$schedule_str $script_file' >>  $crontab_file"});

    $output .= $self->import_crontab;

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
