{   name                     => 'Pluton',
    port                     => 5007,
    using_frontend_proxy     => 1,
    uploadtmp                => Pluton->path_to('data/uploads')->stringify,
    uploadfiles              => Pluton->path_to('data/files')->stringify,
    max_user_tags            => 10,

    'Plugin::Session' => {
        storage => Pluton->path_to('data/sessions')->stringify,
    },

    'View::Web' => {
        ENCODING => 'utf8',
	INCLUDE_PATH => [
	    Pluton->path_to( 'root' )->stringify,
        ],
    },

    'Plugin::Static::Simple' => {
        include_path => [
            Pluton->path_to('root')->stringify,
        ],
        dirs => [
            'static',
        ],
    },

    'Model::DB' => {
        schema_class => 'Pluton::Schema',
        connect_info => {
            dsn => 'dbi:Pg:dbname=pluton;host=/var/run/postgresql',
            user => '*****',
            password => '*****',
            quote_names => 1,
        }
    },

    system_users_blacklist => {
      root => 1,
      perl => 1,
      pluton => 1,
    },

    # CSS goes in it's own all.css file
    # JS and Mustache goes in all.js
    resources => {
        destination    => '/static/minified',
        js => [qw(
               /static/js/meta.debug.js
               /static/js/mustache.js
               /static/js/site/_.js
               /static/js/site/log.js
               /static/js/site/obj/mode.js
               /static/js/site/obj/method.js
               /static/js/site/mounts/swift.js
               /static/js/site/mounts/swiftks.js
               /static/js/site/mounts/gs.js
               /static/js/site/mounts/s3.js
               /static/js/site/mounts/s3c.js
               /static/js/site/mounts/b2.js
               /static/js/site/mounts/rackspace.js
               /static/js/site/mounts/local.js
               /static/js/site/mounts/generic.js
               /static/js/site/mode/admin/home.js
               /static/js/site/mode/admin/home/main.js
               /static/js/site/mode/admin/system_user.js
               /static/js/site/mode/admin/system_user/main.js
               /static/js/site/mode/admin/system_user/configuration.js
               /static/js/site/mode/admin/system_user/mount-add.js
               /static/js/site/mode/admin/system_user/mount-rm.js
               /static/js/site/mode/admin/system_user/mount-edit.js
               /static/js/site/mode/admin/system_user/mount-view.js
               /static/js/site/mode/admin/system_user/add.js
               /static/js/site/mode/admin/system_user/rm.js
               /static/js/site/mode/admin/system_user/list.js
               /static/js/site/mode/admin/schedule.js
               /static/js/site/mode/admin/schedule/main.js
               /static/js/site/mode/admin/schedule/edit.js
               /static/js/site/mode/admin/schedule/add.js
               /static/js/site/mode/admin/schedule/list.js
               /static/js/site/mode/admin/backup.js
               /static/js/site/mode/admin/backup/main.js
               /static/js/site/mode/admin/backup/edit.js
               /static/js/site/mode/admin/backup/add.js
               /static/js/site/mode/admin/backup/list.js
               /static/js/site/mode/admin/restore.js
               /static/js/site/mode/admin/restore/main.js
               /static/js/site/mode/admin/restore/process.js
               /static/js/site/mode/user/home.js
               /static/js/site/mode/user/home/main.js
               /static/js/site/mode/user/system_user.js
               /static/js/site/mode/user/system_user/main.js
               /static/js/site/mode/user/system_user/configuration.js
               /static/js/site/mode/user/system_user/mount-add.js
               /static/js/site/mode/user/system_user/mount-rm.js
               /static/js/site/mode/user/system_user/mount-edit.js
               /static/js/site/mode/user/system_user/mount-view.js
               /static/js/site/mode/user/system_user/list.js
               /static/js/site/mode/user/schedule.js
               /static/js/site/mode/user/schedule/main.js
               /static/js/site/mode/user/schedule/edit.js
               /static/js/site/mode/user/schedule/add.js
               /static/js/site/mode/user/schedule/list.js
               /static/js/site/mode/user/backup.js
               /static/js/site/mode/user/backup/main.js
               /static/js/site/mode/user/backup/edit.js
               /static/js/site/mode/user/backup/add.js
               /static/js/site/mode/user/backup/list.js
               /static/js/site/mode/user/restore.js
               /static/js/site/mode/user/restore/main.js
               /static/js/site/mode/user/restore/process.js
               /static/js/site/init.js
               /static/js/site/mustache.js
               /static/js/site/login.js
               /static/js/site/logout.js
               /static/js/site/websocket.js
               /static/js/site/users.js
               /static/js/pluton.js
             )],
        css => [],
        mustache => {
            login => '/static/mustache/login.mustache',
            menu => '/static/mustache/menu.mustache',
            log => '/static/mustache/log.mustache',
            error => '/static/mustache/error.mustache',
            system_user => '/static/mustache/system_user.mustache',
            'system_user-add-form' => '/static/mustache/system_user-add-form.mustache',
            'system_user-configuration-list' => '/static/mustache/system_user-configuration-list.mustache',
            'system_user-mount-form' => '/static/mustache/system_user-mount-form.mustache',
            'system_user-mount-view' => '/static/mustache/system_user-mount-view.mustache',

            'system_user-mount-generic-fields' => '/static/mustache/system_user-mount-generic-fields.mustache',
            'system_user-mount-b2-fields' => '/static/mustache/system_user-mount-b2-fields.mustache',
            'system_user-mount-gs-fields' => '/static/mustache/system_user-mount-gs-fields.mustache',
            'system_user-mount-swift-fields' => '/static/mustache/system_user-mount-swift-fields.mustache',
            'system_user-mount-swiftks-fields' => '/static/mustache/system_user-mount-swiftks-fields.mustache',
            'system_user-mount-local-fields' => '/static/mustache/system_user-mount-local-fields.mustache',
            'system_user-mount-rackspace-fields' => '/static/mustache/system_user-mount-rackspace-fields.mustache',
            'system_user-mount-s3-fields' => '/static/mustache/system_user-mount-s3-fields.mustache',
            'system_user-mount-s3c-fields' => '/static/mustache/system_user-mount-s3c-fields.mustache',

            'system_user-mount-generic-fields_view' => '/static/mustache/system_user-mount-generic-fields_view.mustache',
            'system_user-mount-b2-fields_view' => '/static/mustache/system_user-mount-b2-fields_view.mustache',
            'system_user-mount-gs-fields_view' => '/static/mustache/system_user-mount-gs-fields_view.mustache',
            'system_user-mount-swift-fields_view' => '/static/mustache/system_user-mount-swift-fields_view.mustache',
            'system_user-mount-swiftks-fields_view' => '/static/mustache/system_user-mount-swiftks-fields_view.mustache',
            'system_user-mount-local-fields_view' => '/static/mustache/system_user-mount-local-fields_view.mustache',
            'system_user-mount-rackspace-fields_view' => '/static/mustache/system_user-mount-rackspace-fields_view.mustache',
            'system_user-mount-s3-fields_view' => '/static/mustache/system_user-mount-s3-fields_view.mustache',
            'system_user-mount-s3c-fields_view' => '/static/mustache/system_user-mount-s3c-fields_view.mustache',

            'system_user-list' => '/static/mustache/system_user-list.mustache',
            schedule => '/static/mustache/schedule.mustache',
            'schedule-form' => '/static/mustache/schedule-form.mustache',
            backup => '/static/mustache/backup.mustache',
            'backup-form' => '/static/mustache/backup-form.mustache',
            'backup-form-mounts' => '/static/mustache/backup-form-mounts.mustache',
            restore => '/static/mustache/restore.mustache',
            'restore-form' => '/static/mustache/restore-form.mustache',
            folders => '/static/mustache/folders.mustache',
            folder => '/static/mustache/folder.mustache',
        },
    }
}
