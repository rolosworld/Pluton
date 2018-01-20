#!/usr/bin/env perl

use strict;
use warnings;

my $num_args = $#ARGV + 1;
my $script_mode = 0;

my $host;
my $port;
my $database;
my $user;
my $pass;
my $postgre_pass;

for ( my $i = 0; $i < scalar @ARGV; $i++ ) {
    my $arg = $ARGV[$i];
    if ( $arg eq '-n' ) {
        $script_mode = 1;
    }
    else {
        my @parts = split( '=', $arg );
        if ( scalar @parts < 2) {
            print "Usage: pluton_db_recreate.pl [-n] hostname=<hostname> port=<port> database=<database> user=<user> pass=<pass> postgre_pass=<postgre_pass>\n";
            exit;
        }

        if ( $parts[0] eq 'hostname' ) {
            $host = $parts[1];
        }
        elsif ( $parts[0] eq 'port' ) {
            $port = $parts[1];
        }
        elsif ( $parts[0] eq 'database' ) {
            $database = $parts[1];
        }
        elsif ( $parts[0] eq 'user' ) {
            $user = $parts[1];
        }
        elsif ( $parts[0] eq 'pass' ) {
            $pass = $parts[1];
        }
        elsif ( $parts[0] eq 'postgre_pass' ) {
            $postgre_pass = $parts[1];
        }
    }
}

if ( !($host && $port && $database && $user && $pass && $postgre_pass) ) {
    print "Usage: pluton_db_recreate.pl [-n] hostname=<hostname> port=<port> database=<database> user=<user> pass=<pass> postgre_pass=<postgre_pass>\n";
    exit;
}

my $filename = 'conf/pluton_local.pl';
open(my $fh, '<:encoding(UTF-8)', $filename)
    or die "Could not open file '$filename' $!";

my @output = ();
while (my $row = <$fh>) {
    chomp $row;

    if ( $row =~ / dsn => .+/ ) {
        $row =~ s/ dsn => .+/ dsn => 'dbi:Pg:dbname=$database;host=$host;port=$port',/;
    }
    elsif ( $row =~ / user => .+/ ) {
        $row =~ s/ user => .+/ user => '$user',/; 
    }
    elsif ( $row =~ / password => .+/ ) {
        $row =~ s/ password => .+/ password => '$pass',/;
    }

    push( @output, $row );
}

open($fh, '>:encoding(UTF-8)', $filename)
    or die "Could not open file '$filename' $!";

print $fh join( "\n", @output );

if ( !$script_mode ) {
    print(`PGPASSWORD=$postgre_pass psql -h $host -U postgres -c "CREATE USER $user WITH CREATEDB ENCRYPTED PASSWORD '"$pass"';"`);
    print(`PGPASSWORD=$pass dropdb -h $host -p $port -U $user $database`);
    print(`PGPASSWORD=$pass createdb -E UNICODE -h $host -p $port -U $user $database`);
    print(`PGPASSWORD=$pass psql -h $host -p $port -U $user $database < sql/main.sql`);
    print(`PGPASSWORD=$pass psql -h $host -p $port -U $user $database < sql/websockets.sql`);
    print(`PGPASSWORD=$pass psql -h $host -p $port -U $user $database < sql/pluton.sql`);
}
