package Pluton::Object::Mount;
use Modern::Perl;
use Moose;
use namespace::autoclean;

extends 'Pluton::SystemUser::Command';

has 'mount' => ( is => 'rw' );

sub authinfo_path {
    return '~/.pluton/authinfo';
}

sub fname {
    return '~/.pluton/authinfo/' . $_[0]->mount->id;
}

sub cache_path {
    return '~/.pluton/cache/' . $_[0]->mount->id;
}

sub path {
    return '~/.pluton/backup/' . $_[0]->mount->id;
}

sub local_path {
    return '.pluton/backup/' . $_[0]->mount->id;
}

sub storage_url {
    my ($self) = @_;
    my $mount = $self->mount;
    my $storage_url = $mount->storage_url;

    my @parts = split(':', $storage_url);
    if ($parts[0] ne 'local') {
        return $storage_url;
    }

    my $system_user = $mount->get_column('system_user');
    my $output = $self->run({user => $system_user, command => "pwd"});
    my @_output = split("\n", $output);
    my $pwd = $_output[2];

    return 'local://' . $pwd . substr( $storage_url, 7 );
}

sub mkfs {
    my ($self) = @_;
    my $c = $self->c;
    my $mount = $self->mount;
    my $storage_url = $self->storage_url;
    my $suser = $mount->get_column('system_user');
    my $fname = $self->fname;
    my $cache_path = $self->cache_path;
    my $path = $self->path;

    # Create cache folder
    my $output = $self->run({user => $suser, command => "mkdir -p $cache_path"});

    # mkfs
    $output .= $self->run({
        user => $suser,
        command => "mkfs.s3ql --force --cachedir $cache_path --authfile $fname '$storage_url'",
        fs_passphrase => $mount->fs_passphrase,
    });

    return $output;
}

sub umount {
    my ($self) = @_;
    my $c = $self->c;
    my $mount = $self->mount;
    my $suser = $mount->get_column('system_user');
    my $path = $self->path;

    # umount first
    my $output .= $self->run({user => $suser, command => "umount.s3ql $path"});

    return $output;
}

sub clean {
    my ($self) = @_;
    my $c = $self->c;
    my $mount = $self->mount;
    my $storage_url = $self->storage_url;
    my $suser = $mount->get_column('system_user');
    my $fname = $self->fname;
    my $cache_path = $self->cache_path;
    my $path = $self->path;

    my $backups = $c->model('DB::Backup')->search({
        mount => $mount->id,
    });

    my $output = '';
    my @script_files = ();
    while (my $backup = $backups->next) {
        $backup = $self->getObject('Object::Backup', c => $c, backup => $backup);
        push(@script_files, $backup->script_file);

        $output .= $backup->cleanup_crontab;
        $output .= $backup->import_crontab;
    }

    # umount first
    $output .= $self->run({user => $suser, command => "umount.s3ql $path"});

    # Remove backup folder, should be empty so use rmdir. It's suppose to fail if the path is not empty
    $output .= $self->run({user => $suser, command => "rmdir $path"});

    # Remove authinfo folder
    $output .= $self->run({user => $suser, command => "rm -rf $cache_path $fname " . join(' ', @script_files)});

    return $output;
}

sub remount {
    my ($self) = @_;
    my $c = $self->c;
    my $mount = $self->mount;
    my $storage_url = $self->storage_url;
    my $suser = $mount->get_column('system_user');
    my $fname = $self->fname;
    my $cache_path = $self->cache_path;
    my $path = $self->path;

    my $output = $self->save_authinfo2;

    # Create backup folder
    $output .= $self->run({user => $suser, command => "mkdir -p $path"});

    # Create cache folder
    $output .= $self->run({user => $suser, command => "mkdir -p $cache_path"});

    # umount first
    $output .= $self->run({user => $suser, command => "umount.s3ql $path"});

    # fsck
    $output .= $self->run({user => $suser, command => "fsck.s3ql --cachedir $cache_path --authfile $fname --force '$storage_url'"});

    # mount
    $output .= $self->run({user => $suser, command => "mount.s3ql --cachedir $cache_path --authfile $fname '$storage_url' $path"});

    # Create current and previous folders if they doesn't exist
    $output .= $self->run({user => $suser, command => "mkdir -p $path/current $path/previous"});

    return $output;
}

sub generate_authinfo2 {
    my ($self) = @_;
    my $c = $self->c;
    my $mount = $self->mount;
    my $storage_url = $self->storage_url;
    my $system_user = $mount->get_column('system_user');

    my $output;

    my $authinfo2 = '[' . $mount->name . "]\n";


    $authinfo2 .= 'storage-url: ' . $storage_url . "\n";

    if ( $mount->backend_login ) {
        $authinfo2 .= 'backend-login: ' . $mount->backend_login . "\n";
    }

    if ( $mount->backend_password ) {
        my $backend_password = $mount->backend_password;
        $backend_password =~ s/\r//g;
        $backend_password =~ s/\n/\\n/g;
        $authinfo2 .= 'backend-password: ' . $backend_password . "\n";
    }

    $authinfo2 .= 'fs-passphrase: ' . $mount->fs_passphrase . "\n\n";

    return $authinfo2;
}

sub save_authinfo2 {
    my ($self) = @_;
    my $suser = $self->mount->get_column('system_user');
    my $fname = $self->fname;
    my $path = $self->authinfo_path;

    my $output = $self->run({user => $suser, command => "mkdir -p $path"});

    # Create authinfo2 file
    $output .= $self->run({user => $suser, command => 'touch ' . $fname . ' && chmod 600 ' . $fname});

    # Fill the file with the content, line per line
    my $authinfo2 = $self->generate_authinfo2;

    # Don't allow single quotes
    $authinfo2 =~ s/'//g;
    my @content = split("\n", $authinfo2);
    $output .= $self->run({user => $suser, command => "cat /dev/null > " . $fname});
    foreach my $row (@content) {
        $output .= $self->run({user => $suser, command => "echo '$row' >> " . $fname});
    }

    return $output;
}

sub stat {
    my ($self) = @_;
    my $c = $self->c;
    my $mount = $self->mount;
    my $suser = $mount->get_column('system_user');
    my $path = $self->path;

    my $output .= $self->run({user => $suser, command => "s3qlstat $path"});
    my @output = split("\n", $output);
    if (scalar @output < 4) {
        return 'Not mounted';
    }
    shift @output;
    shift @output;

    return join("\n", @output);
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
