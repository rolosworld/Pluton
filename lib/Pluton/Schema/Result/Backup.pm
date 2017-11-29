use utf8;
package Pluton::Schema::Result::Backup;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

=head1 NAME

Pluton::Schema::Result::Backup

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

=head1 TABLE: C<backups>

=cut

__PACKAGE__->table("backups");

=head1 ACCESSORS

=head2 id

  data_type: 'bigint'
  is_auto_increment: 1
  is_nullable: 0
  sequence: 'backups_id_seq'

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

=head2 schedule

  data_type: 'bigint'
  is_foreign_key: 1
  is_nullable: 0

=head2 name

  data_type: 'varchar'
  is_nullable: 0
  size: 255

=head2 folders

  data_type: 'text'
  is_nullable: 0

=head2 keep

  data_type: 'smallint'
  default_value: 0
  is_nullable: 0

=cut

__PACKAGE__->add_columns(
  "id",
  {
    data_type         => "bigint",
    is_auto_increment => 1,
    is_nullable       => 0,
    sequence          => "backups_id_seq",
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
  "schedule",
  { data_type => "bigint", is_foreign_key => 1, is_nullable => 0 },
  "name",
  { data_type => "varchar", is_nullable => 0, size => 255 },
  "folders",
  { data_type => "text", is_nullable => 0 },
  "keep",
  { data_type => "smallint", default_value => 0, is_nullable => 0 },
);

=head1 PRIMARY KEY

=over 4

=item * L</id>

=back

=cut

__PACKAGE__->set_primary_key("id");

=head1 UNIQUE CONSTRAINTS

=head2 C<backups_creator_name_key>

=over 4

=item * L</creator>

=item * L</name>

=back

=cut

__PACKAGE__->add_unique_constraint("backups_creator_name_key", ["creator", "name"]);

=head1 RELATIONS

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

=head2 schedule

Type: belongs_to

Related object: L<Pluton::Schema::Result::Schedule>

=cut

__PACKAGE__->belongs_to(
  "schedule",
  "Pluton::Schema::Result::Schedule",
  { id => "schedule" },
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


# Created by DBIx::Class::Schema::Loader v0.07045 @ 2017-11-28 20:34:50
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:MPEGZQjrKbu17fHiWRqZOw

sub TO_JSON {
    my ($self) = @_;
    my $data = {$self->get_columns};
    $$data{system_user} = $self->system_user;
    $$data{schedule} = $self->schedule;
    return $data;
}

# You can replace this text with custom code or comments, and it will be preserved on regeneration
__PACKAGE__->meta->make_immutable;
1;
