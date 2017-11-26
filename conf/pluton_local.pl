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
               /static/js/site/mode/home.js
               /static/js/site/mode/system_user.js
               /static/js/site/mode/schedule.js
               /static/js/site/mode/backup.js
               /static/js/site/mode/restore.js
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
            schedule => '/static/mustache/schedule.mustache',
            'schedule-form' => '/static/mustache/schedule-form.mustache',
            backup => '/static/mustache/backup.mustache',
            'backup-form' => '/static/mustache/backup-form.mustache',
            restore => '/static/mustache/restore.mustache',
            'restore-form' => '/static/mustache/restore-form.mustache',
            folders => '/static/mustache/folders.mustache',
            folder => '/static/mustache/folder.mustache',
        },
    }
}
