package Pluton::SystemUser::Command;
use Modern::Perl;
use Moose;
use namespace::autoclean;
use Crypt::CBC;
use Expect;

extends 'Main::Module';

sub run {
    my ($self, $params) = @_;
    my $c = $self->c;

    my $exp = Expect->new;
    $exp->raw_pty(1);

    # We assume the command is created by us with no remote input
    my $command = $$params{command};
    my $system_user = $$params{username};
    my $system_pass = $$params{password};

    my @parameters = ('-c', $command, '-', $system_user);

    if (!$exp->spawn('su', @parameters)) {
        $c->log->error("Cannot spawn $command: $!");
        return;
    }

    my $timeout = 1;
    my $output;
    $exp->log_file(sub {
        $output .= shift;
    });
    $exp->expect($timeout,
                 [
                  qr/password:/i => sub {
                      shift->send("$system_pass\n");
                      exp_continue;
                  },
                 ],
        );


    $exp->soft_close();

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
