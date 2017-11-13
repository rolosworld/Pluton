package Pluton::Controller::Root;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Main::Controller::Root' }

=head2 index

The root page (/)

=cut

sub index : Path : Args(0) {
    my ( $self, $c ) = @_;
    my $data = {
        config => {
        },
    };

    if ( $c->user_exists ) {
        my $user = $c->user->obj;
        $$data{user} = $user;
    }

    # Load re-captcha html in case we needed
    my $recap_conf = $c->config->{'Captcha::reCAPTCHA'};
    $$data{recaptcha_key} = $recap_conf->{public};

    $c->stash->{data}     = $data;
    $c->stash->{template} = 'index.tmpl';
}

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

__PACKAGE__->meta->make_immutable;

1;
