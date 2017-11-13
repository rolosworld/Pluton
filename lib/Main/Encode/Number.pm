package Main::Encode::Number;
use Moose;

has 'map' => ( is => 'rw' );

our %maps = (
    b64 => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    b62 => '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    b36 => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    hex => '0123456789abcdef',
    bin => '01'
);


sub BUILD {
    my $self = shift;
    $$self{base} = length $self->map;
}

sub encode {
    my ($self, $value) = @_;
    my $map = $self->map;
    my $base = $$self{base};
    my $mod = 0;
    my $out = '';

    while ($value >= $base) {
        $mod = $value % $base;
        $value = $value / $base;
        $value = int( $value );
        $out = substr( $map, $mod, 1 ) . $out;
    }

    $out = substr( $map, $value, 1 ) . $out;

    return $out;
}


sub decode {
    my ($self, $encoded) = @_;
    my $map = $self->map;

    my $base = $$self{base};
    my $len = length $encoded;

    my $out;
    if ($len) {
        my $v;
        $out = 0;
        for (my $i = 0; $i < $len; $i++) {
            $v = substr( $encoded, $i, 1 );
            $v = index( $map, $v );
            $out = $base * $out + $v;
        }
    }

    return $out;
}

1;
__END__

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
