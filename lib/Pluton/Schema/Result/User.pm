use utf8;
package Pluton::Schema::Result::User;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

=head1 NAME

Pluton::Schema::Result::User

=cut

use strict;
use warnings;

use Moose;
use MooseX::NonMoose;
use MooseX::MarkAsMethods autoclean => 1;
extends 'DBIx::Class::Core';

=head1 COMPONENTS LOADED

=over 4

=item * L<DBIx::Class::InflateColumn::DateTime>

=back

=cut

__PACKAGE__->load_components("InflateColumn::DateTime");

=head1 TABLE: C<users>

=cut

__PACKAGE__->table("users");

=head1 ACCESSORS

=head2 id

  data_type: 'bigint'
  is_auto_increment: 1
  is_nullable: 0
  sequence: 'users_id_seq'

=head2 created

  data_type: 'timestamp'
  default_value: current_timestamp
  is_nullable: 0
  original: {default_value => \"now()"}

=head2 updated

  data_type: 'timestamp'
  default_value: current_timestamp
  is_nullable: 0
  original: {default_value => \"now()"}

=head2 active

  data_type: 'smallint'
  default_value: 1
  is_nullable: 0

=head2 username

  data_type: 'varchar'
  is_nullable: 0
  size: 255

=head2 password

  data_type: 'varchar'
  is_nullable: 0
  size: 255

=cut

__PACKAGE__->add_columns(
  "id",
  {
    data_type         => "bigint",
    is_auto_increment => 1,
    is_nullable       => 0,
    sequence          => "users_id_seq",
  },
  "created",
  {
    data_type     => "timestamp",
    default_value => \"current_timestamp",
    is_nullable   => 0,
    original      => { default_value => \"now()" },
  },
  "updated",
  {
    data_type     => "timestamp",
    default_value => \"current_timestamp",
    is_nullable   => 0,
    original      => { default_value => \"now()" },
  },
  "active",
  { data_type => "smallint", default_value => 1, is_nullable => 0 },
  "username",
  { data_type => "varchar", is_nullable => 0, size => 255 },
  "password",
  { data_type => "varchar", is_nullable => 0, size => 255 },
);

=head1 PRIMARY KEY

=over 4

=item * L</id>

=back

=cut

__PACKAGE__->set_primary_key("id");

=head1 UNIQUE CONSTRAINTS

=head2 C<users_username_key>

=over 4

=item * L</username>

=back

=cut

__PACKAGE__->add_unique_constraint("users_username_key", ["username"]);

=head1 RELATIONS

=head2 backups

Type: has_many

Related object: L<Pluton::Schema::Result::Backup>

=cut

__PACKAGE__->has_many(
  "backups",
  "Pluton::Schema::Result::Backup",
  { "foreign.creator" => "self.id" },
  { cascade_copy => 0, cascade_delete => 0 },
);

=head2 memberships

Type: has_many

Related object: L<Pluton::Schema::Result::Membership>

=cut

__PACKAGE__->has_many(
  "memberships",
  "Pluton::Schema::Result::Membership",
  { "foreign.user" => "self.id" },
  { cascade_copy => 0, cascade_delete => 0 },
);

=head2 mounts

Type: has_many

Related object: L<Pluton::Schema::Result::Mount>

=cut

__PACKAGE__->has_many(
  "mounts",
  "Pluton::Schema::Result::Mount",
  { "foreign.creator" => "self.id" },
  { cascade_copy => 0, cascade_delete => 0 },
);

=head2 schedules

Type: has_many

Related object: L<Pluton::Schema::Result::Schedule>

=cut

__PACKAGE__->has_many(
  "schedules",
  "Pluton::Schema::Result::Schedule",
  { "foreign.creator" => "self.id" },
  { cascade_copy => 0, cascade_delete => 0 },
);

=head2 system_users

Type: has_many

Related object: L<Pluton::Schema::Result::SystemUser>

=cut

__PACKAGE__->has_many(
  "system_users",
  "Pluton::Schema::Result::SystemUser",
  { "foreign.owner" => "self.id" },
  { cascade_copy => 0, cascade_delete => 0 },
);

=head2 user_websockets

Type: has_many

Related object: L<Pluton::Schema::Result::UserWebsocket>

=cut

__PACKAGE__->has_many(
  "user_websockets",
  "Pluton::Schema::Result::UserWebsocket",
  { "foreign.user" => "self.id" },
  { cascade_copy => 0, cascade_delete => 0 },
);


# Created by DBIx::Class::Schema::Loader v0.07045 @ 2017-12-05 20:51:28
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:jM1SDs9gUfhFQ6lLMNIKpA

with 'Main::DBMethods::User';

sub TO_JSON {
    my ($self) = @_;
    my $data = {$self->get_columns};
    delete $$data{password};

    $$data{roles} = {};
    my @memberships = $self->memberships({},{prefetch => 'role'});
    foreach my $membership (@memberships) {
        my $role = $membership->role->name;
        $$data{roles}{$role} = 1;
    }

    if ($$data{roles}{user}) {
        $$data{system_user} = $self->system_users->next;
    }
    return $data;
}

# You can replace this text with custom code or comments, and it will be preserved on regeneration
__PACKAGE__->meta->make_immutable;
1;
