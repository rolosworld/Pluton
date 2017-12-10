use utf8;
package Pluton::Schema::Result::Mount;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

=head1 NAME

Pluton::Schema::Result::Mount

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

=head1 TABLE: C<mounts>

=cut

__PACKAGE__->table("mounts");

=head1 ACCESSORS

=head2 id

  data_type: 'bigint'
  is_auto_increment: 1
  is_nullable: 0
  sequence: 'mounts_id_seq'

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

=head2 creator

  data_type: 'bigint'
  is_foreign_key: 1
  is_nullable: 0

=head2 system_user

  data_type: 'bigint'
  is_foreign_key: 1
  is_nullable: 0

=head2 name

  data_type: 'varchar'
  is_nullable: 0
  size: 32

=head2 storage_url

  data_type: 'varchar'
  is_nullable: 0
  size: 255

=head2 backend_login

  data_type: 'varchar'
  default_value: null
  is_nullable: 1
  size: 255

=head2 backend_password

  data_type: 'varchar'
  default_value: null
  is_nullable: 1
  size: 255

=head2 fs_passphrase

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
    sequence          => "mounts_id_seq",
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
  "creator",
  { data_type => "bigint", is_foreign_key => 1, is_nullable => 0 },
  "system_user",
  { data_type => "bigint", is_foreign_key => 1, is_nullable => 0 },
  "name",
  { data_type => "varchar", is_nullable => 0, size => 32 },
  "storage_url",
  { data_type => "varchar", is_nullable => 0, size => 255 },
  "backend_login",
  {
    data_type => "varchar",
    default_value => \"null",
    is_nullable => 1,
    size => 255,
  },
  "backend_password",
  {
    data_type => "varchar",
    default_value => \"null",
    is_nullable => 1,
    size => 255,
  },
  "fs_passphrase",
  { data_type => "varchar", is_nullable => 0, size => 255 },
);

=head1 PRIMARY KEY

=over 4

=item * L</id>

=back

=cut

__PACKAGE__->set_primary_key("id");

=head1 UNIQUE CONSTRAINTS

=head2 C<mounts_creator_name_key>

=over 4

=item * L</creator>

=item * L</name>

=back

=cut

__PACKAGE__->add_unique_constraint("mounts_creator_name_key", ["creator", "name"]);

=head1 RELATIONS

=head2 backups

Type: has_many

Related object: L<Pluton::Schema::Result::Backup>

=cut

__PACKAGE__->has_many(
  "backups",
  "Pluton::Schema::Result::Backup",
  { "foreign.mount" => "self.id" },
  { cascade_copy => 0, cascade_delete => 0 },
);

=head2 creator

Type: belongs_to

Related object: L<Pluton::Schema::Result::User>

=cut

__PACKAGE__->belongs_to(
  "creator",
  "Pluton::Schema::Result::User",
  { id => "creator" },
  { is_deferrable => 0, on_delete => "CASCADE", on_update => "NO ACTION" },
);

=head2 system_user

Type: belongs_to

Related object: L<Pluton::Schema::Result::SystemUser>

=cut

__PACKAGE__->belongs_to(
  "system_user",
  "Pluton::Schema::Result::SystemUser",
  { id => "system_user" },
  { is_deferrable => 0, on_delete => "CASCADE", on_update => "NO ACTION" },
);


# Created by DBIx::Class::Schema::Loader v0.07045 @ 2017-12-09 20:00:33
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:TbZLaVCL+OYSNa/MNLUVgA

sub TO_JSON {
    my ($self) = @_;
    my $data = {$self->get_columns};
    return $data;
}

# You can replace this text with custom code or comments, and it will be preserved on regeneration
__PACKAGE__->meta->make_immutable;
1;
