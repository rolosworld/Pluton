package Pluton::SystemUser::Command;
use Modern::Perl;
use Moose;
use namespace::autoclean;
use Main::JSON::Validator;
use Crypt::CBC;
use Expect;
use MIME::Base64 ();

extends 'Main::Module';

sub encrypt_password {
    my ($self, $pass) = @_;
    my $c = $self->c;

    my $key = $c->session->{system_user_digest} . $c->req->cookies->{system_user_digest}->value;
    my $cipher = Crypt::CBC->new( -key    => $key, -cipher => 'Blowfish' );
    return MIME::Base64::encode_base64($cipher->encrypt( $pass ));
}

sub decrypt_password {
    my ($self, $pass) = @_;
    my $c = $self->c;

    my $key = $c->session->{system_user_digest} . $c->req->cookies->{system_user_digest}->value;
    my $cipher = Crypt::CBC->new( -key    => $key, -cipher => 'Blowfish' );
    return $cipher->decrypt(MIME::Base64::decode_base64($pass));
}


our $__run_schema = {
    required   => [qw(user)],
    properties => {
        user => { type => 'integer', minimum => 1, maximum => 10000 },
    }
};

sub __validate_run {
    my ($self, $params) = @_;
    my $validator = Main::JSON::Validator->new;
    $validator->schema($__run_schema);

    return $validator->validate($params);
}

sub run {
    my ($self, $params) = @_;
    my $c = $self->c;

    my @errors = $self->__validate_run($params);
    if ( $errors[0] ) {
        $self->jsonrpc_error( \@errors );
    }

    my $system_user = $c->model('DB::SystemUser')->search({
        owner => $c->user->id,
        id => $$params{user},
    })->next;

    if ( !$system_user ) {
        $self->jsonrpc_error(
            [   {   path    => '/user',
                    message => 'User doesn\'t exist in your system users list',
                }
            ]);
        return;
    }

    my $pass_decrypted  = $self->decrypt_password($system_user->password);

    my $run = {
        username => $system_user->username,
        password => $pass_decrypted,
        command  => $$params{command},
        fs_passphrase => $$params{fs_passphrase},
        response_type => $$params{response_type},
    };

    my $output = $self->raw($run);
    return $output;
}

sub raw {
    my ($self, $params) = @_;
    my $c = $self->c;
    my $uid = 0;
    if ( $c->user_exists ) {
        $uid = $c->user->id;
    }

    my $exp = Expect->new;
    $exp->raw_pty(1);

    # We assume the command is created by us with no remote input
    my $command = $$params{command};
    my $system_user = $$params{username};
    my $system_pass = $$params{password};
    my $fs_passphrase = $$params{fs_passphrase};
    my $response_type = $$params{response_type};

    my @parameters = ('su', '-c', $command, '-', $system_user);

    my $output = join(' ', @parameters) . "\n";
    $c->log->debug("\n" . $output);
    if (!$exp->spawn(@parameters)) {
        $c->log->error("Cannot spawn $command: $!");
        return;
    }

    my $timeout = 30;
    $exp->log_file(sub {
        my $stdout = shift;
        $output .= $stdout;
        if ($uid) {
            Main::WebSocket::Users::sendTo($c, [$uid], {
                type => $response_type || 'command-stdout',
                force => 1,
                data => {
                    content => $stdout
                }
            });
        }
    });
    $exp->expect($timeout,
                 [
                  'encryption password: ' => sub {
                      shift->send("$fs_passphrase\n");
                      exp_continue;
                  },
                 ],
                 [
                  'Password: ' => sub {
                      shift->send("$system_pass\n");
                      exp_continue;
                  },
                 ],
        );


    $exp->soft_close();

    return $output;
}

our $jobs = 0;
sub forkit {
    my ($self, $params) = @_;
    my $c = $self->c;

    if ($jobs >= $c->config->{max_jobs}) {
        $c->log->debug("MAX JOBS REACHED: $jobs");
        return 0;
    }

    $c->log->debug("PID $$");
    my $pid = fork();
    $jobs++;

    if (!$pid) {
        $self->run( $params );
        $jobs--;
        $c->log->debug("JOBS( $jobs ) PID_DONE( $pid )");
    }
    else {
        $c->log->debug("JOBS( $jobs ) PID $$ ($pid)");
    }

    return 1;
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
