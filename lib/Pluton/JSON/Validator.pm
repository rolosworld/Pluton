package Pluton::JSON::Validator;
use Modern::Perl;
use Moose;
use namespace::autoclean;

extends 'Main::JSON::Validator';

sub _build_formats {
    my ($self) = @_;
    my $formats = $self->SUPER::_build_formats;

    # Cron Validators
    $formats->{cron_minute} = sub {
        $DB::single = 1;
        return $self->__cron_common($_[0], 'minute');
    };

    $formats->{cron_hour} = sub {
        return $self->__cron_common($_[0], 'hour');
    };

    $formats->{cron_day_of_month} = sub {
        return $self->__cron_common($_[0], 'day_of_month');
    };

    $formats->{cron_month} = sub {
        return $self->__cron_common($_[0], 'month');
    };

    $formats->{cron_day_of_week} = sub {
        return $self->__cron_common($_[0], 'day_of_week');
    };

    return $formats;
}

sub __cron_common {
    my ($self, $str, $type) = @_;
    if ( length $str > 255 ) {
        return 0;
    }

    my $method = "___cron_$type";

    my @parts = split(',', $str);
    for my $part ( @parts ) {
        if ( $part eq '') {
            return 0;
        }

        if ( $part eq '*' ) {
            next;
        }

        # Validate ranges
        my @_parts = split( '-', $part );
        my $_parts_size = scalar( @_parts );
        if ( $_parts_size > 1 ) {

            # Range should be between 2 values only
            if ( $_parts_size > 2 ) {
                return 0;
            }

            if ( $_parts[0] eq $_parts[1] ||
                 !$self->$method( $_parts[0] ) ||
                 !$self->$method( $_parts[1] ) ) {
                return 0;
            }
        }

        # Validate single value
        else {
            if ( !$self->$method( $part ) ) {
                return 0;
            }
        }
    }

    return 1;
}

# 0-59
sub ___cron_minute {
    my ($self, $str) = @_;
    return $str =~ /^\d+$/ && $str > -1 && $str < 60;
}

# 0-23
sub ___cron_hour {
    my ($self, $str) = @_;
    return $str =~ /^\d+$/ && $str > -1 && $str < 24;
}

# 1-31
sub ___cron_day_of_month {
    my ($self, $str) = @_;
    return $str =~ /^\d+$/ && $str > 0 && $str < 32;
}


# 1-12 or JAN-DEC
sub ___cron_month {
    my ($self, $str) = @_;
    if ( $str =~ /^\d+$/ ) {
        return $str > 0 && $str < 13;
    }

    return length $str == 3 && (lc $str) =~ /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/;
}

# 0-6 or SUN-SAT
sub ___cron_day_of_week {
    my ($self, $str) = @_;
    if ( $str =~ /^\d+$/ ) {
        return $str > -1 && $str < 7;
    }

    return length $str == 3 && (lc $str) =~ /(sun|mon|tue|wed|thu|fri|sat)/;
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
