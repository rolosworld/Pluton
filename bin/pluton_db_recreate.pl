#!/usr/bin/env perl

use strict;
use warnings;

my $num_args = $#ARGV + 1;
if ( $num_args != 4 ) {
    print "Usage: pluton_db_recreate.pl <database> <hostname> <user> <pass>\n";
    exit;
}

my $database = $ARGV[0];
my $host = $ARGV[1];
my $user = $ARGV[2];
my $pass = $ARGV[3];

my $filename = 'conf/pluton_local.pl';
open(my $fh, '<:encoding(UTF-8)', $filename)
    or die "Could not open file '$filename' $!";

my @output = ();
while (my $row = <$fh>) {
    chomp $row;

    if ( $row =~ / dsn => .+/ ) {
        $row =~ s/ dsn => .+/ dsn => 'dbi:Pg:dbname=$database;host=$host',/;
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

print(`dropdb -h $host $database`);
print(`createdb -E UNICODE $database`);
print(`psql -h $host $database < sql/main.sql`);
print(`psql -h $host $database < sql/websockets.sql`);
print(`psql -h $host $database < sql/pluton.sql`);
