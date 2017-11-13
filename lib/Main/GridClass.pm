package Main::GridClass;

use Moose;
use namespace::autoclean;

with 'Main::Roles::Methods';

use Data::Dumper;
use JSON;

use Main::Language;

our $lang = Main::Language->new;

has 'c' => ( is => 'rw' );
has 'transactions' => ( is => 'rw', isa => 'Int', default => sub {1} );

=head2 say

=cut

sub say {
    my $self = shift;
    return $lang->say(@_);
}

=head2 type

=cut

sub type { return ''; }

=head2 uniqid

=cut

sub uniqid { return ''; }

=head2 columns

=cut

sub columns { return []; }

=head2 model

=cut

sub model { return ''; }

=head2 find

=cut

my $_cache = {};

sub find {
    my ( $self, $id ) = @_;
    unless ( defined $_cache->{$id} ) {
        $_cache->{$id} = $self->c->model( $self->model )->find($id);
    }

    return $_cache->{$id};
}

=head2 create

=cut

sub create {
    my ( $self, $data ) = @_;
    return $self->save( { data => $data, } );
}

=head2 update

=cut

sub update {
    my ( $self, $objs, $data ) = @_;
    return $self->save(
        {   data      => $data,
            resultset => $objs,
        }
    );
}

=head2 preprocess_values

=cut

sub preprocess_values {
    return $_[1];
}

=head2 save_no_transaction

=cut

sub save_no_transaction {
    my ( $self, $conf ) = @_;

    my $c    = $self->c;
    my $data = $conf->{data};
    my $objs = $conf->{resultset};

    my $vals = {};

    foreach my $key ( @{ $self->columns } ) {
        if ( defined $data->{$key} ) {
            $vals->{$key} = $data->{$key};
        }
    }

    $self->preprocess_values($vals);

    if ($objs) {
        $objs->update($vals);
        return $objs;
    }

    return $c->model( $self->model )->create($vals);
}

=head2 save

=cut

sub save {
    my ( $self, $conf ) = @_;

    my $coderef = sub {
        return $self->save_no_transaction($conf);
    };

    if ( !$self->transactions ) {
        return $coderef->();
    }

    my $rs;
    my $c = $self->c;
    eval {    # try
        $rs = $c->model('DB')->schema->txn_do($coderef);
        1;
    } or do {    # catch
        $c->log->error( 'error saving ' . $self->type );
        $c->log->error($@);
    };

    return $rs;
}

=head2 delete_no_transaction

=cut

sub delete_no_transaction {
    my ( $self, $obj ) = @_;
    $obj->delete;
    return 1;
}

=head2 delete

=cut

sub delete {
    my ( $self, $objs ) = @_;

    my $coderef = sub {
        while ( my $obj = $objs->next ) {
            if ( !$self->delete_no_transaction($obj) ) {
                return 0;
            }
        }
        return 1;
    };

    if ( !$self->transactions ) {
        return $coderef->();
    }

    my $rs;
    my $c = $self->c;
    eval {    # try
        $rs = $c->model('DB')->schema->txn_do($coderef);
        1;
    } or do {    # catch
        $c->log->error( 'error deleting ' . $self->type );
        $c->log->error($@);
        return 0;
    };

    return 1;
}

=head2 data_conf

=cut

sub data_conf {
    return {};
}

=head2 form_data

=cut

sub form_data { }

=head2 get_cache

=cut

sub get_cache {
    my ( $self, $obj, $key ) = @_;
    my $id = $obj->get_column($key);
    if (defined $id) {
	$$self{__cache}{$key}{$id} = $obj->$key unless $$self{__cache}{$key}{$id};
	return $$self{__cache}{$key}{$id};
    }
    return undef;
}

=head2 get_data

=cut

sub get_data {
    my $self = shift;

    my ( $total, $ret ) = $self->get_data_resultset;

    my $data = [];
    while ( my $row = $ret->next ) {
        push( @$data, $self->data_prepare($row) );
    }

    $ret = {
        page  => $self->c->req->params->{page},
        total => $total,
        data  => $data,
    };

    return $ret;
}

=head2 get_data_resultset

=cut

sub get_data_resultset {
    my $self = shift;
    my $c    = $self->c;
    my $conf = $self->data_conf;

    my $model = $c->model( $self->model );

    my $params = $c->req->params;
    my $attrs = $conf->{attrs} || {};

    if ( $params->{sorton} ) {
        if ( List::Util::any { $_ eq $params->{sorton} } @{ $self->columns } )
        {
            $attrs->{order_by}
                = { ( '-' . $params->{sortby} ) => $params->{sorton}, };
        }
    }

    my $where = $conf->{where} || {};

    if ( $conf->{filter} && $params->{filter} ) {
        if ( ref( $conf->{filter} ) eq 'HASH' ) {
            my $filter = decode_json( $params->{filter} );
            foreach my $key ( keys %{ $$conf{filter} } ) {
                if ( defined $filter->{$key} ) {
                    $$where{$key} = $$conf{filter}{$key}( $$filter{$key} );
                }
            }
        }
        else {
            $where->{ $conf->{filter} }
                = { -ilike => '%' . $params->{filter} . '%', };
        }
    }

    my $total = $model->search( $where, $attrs )->count;

    if ( $params->{page} ) {
        $attrs->{page} = $params->{page};
        $attrs->{rows} = $params->{perpage};
    }

    my $ret = $model->search( $where, $attrs );

    return ( $total, $ret );
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
