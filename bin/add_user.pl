#!/usr/bin/env perl

use strict;
use warnings;

my $num_args = $#ARGV + 1;
if ( $num_args != 3 ) {
    print "Usage: add_user.pl <role> <user> <pass>\n";
    exit;
}

my $role = $ARGV[0];
my $user = $ARGV[1];
my $pass = $ARGV[2];

my $app = "Pluton";
require "$app.pm";
$app->import;

my $user_role = $app->model('DB::Role')->search({name => $role})->next;
if (!$user_role) {
    die 'Role $role not found.';
}

use Pluton::Account;
my $account_obj = Pluton::Account->new({c => $app});
my @errors = $account_obj->__validate_login({
    username => $user,
    password => $pass,
});

if (@errors) {
    use Data::Dumper;
    die Data::Dumper->Dump(\@errors);
}

use Pluton::User;
my $user_obj = Pluton::User->new({c => $app});

$user_obj = $user_obj->create({
    username => $user,
    password => $pass,
    memberships => [{role => $user_role->id}],
});
