package Main::User;

use Moose;
use namespace::autoclean;

extends 'Main::GridClass';

use Crypt::SaltedHash;

=head2 type

=cut

sub type { return 'user'; }

=head2 columns

=cut

sub columns {
    return [
        qw(
            id
            created
            updated
            active
            username
            password
            )
    ];
}

=head2 model

=cut

sub model { return 'DB::User'; }

=head2 crypt_password

=cut

sub crypt_password {
    my ( $self, $pass ) = @_;
    my $csh = Crypt::SaltedHash->new( salt_len => 4 );
    $csh->add($pass);
    return $csh->generate;
}

=head2 preprocess_values

=cut

sub preprocess_values {
    my ( $self, $vals ) = @_;
    if ( $vals->{password} ) {
        $vals->{password} = $self->crypt_password( $vals->{password} );
    }
}

=head2 data_conf

=cut

sub data_conf {
    return {};
}

=head2 js_conf

=cut

sub js_conf {
    return {
        title       => 'Users',
        uniqid      => 'admin_user',
        idname      => 'user',
        menu_url    => '/admin/user/menu',
        list_url    => '/admin/user/list',
        form_url    => '/admin/user/form',
        remove_url  => '/admin/user/remove',
        data_url    => '/admin/user/data',
        window_size => [ 400, 300 ],
        buttons =>
            [ { add => 'Add' }, { edit => 'Edit' }, { remove => 'Delete' }, ],
        grid_dblclk => 'edit',
        cmu         => [
            {   header    => "ID",
                dataIndex => 'id',
                dataType  => 'number',
                width     => 40
            },
            {   header    => "Created",
                dataIndex => 'created',
                dataType  => 'string',
                width     => 80
            },
            {   header    => "Updated",
                dataIndex => 'updated',
                dataType  => 'string',
                width     => 80
            },
            {   header    => "Active",
                dataIndex => 'active',
                dataType  => 'string',
                width     => 50
            },
            {   header    => "Username",
                dataIndex => 'username',
                dataType  => 'string',
                width     => 200
            },
            {   header    => "Password",
                dataIndex => 'password',
                dataType  => 'string',
                width     => 500
            }
        ]
    };
}

=head2 data_prepare

=cut

sub data_prepare {
    my ( $self, $row ) = @_;
    return {
        id       => $row->id,
        created  => $row->created->ymd('-'),
        updated  => $row->updated->ymd('-'),
        active   => $row->active ? 'Yes' : 'No',
        username => $row->username,
        password => $row->password,
    };
}

=head2 form_name

=cut

sub form_name {
    return 'Form::User';
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
