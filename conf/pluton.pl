{   name                     => 'Main',
    encoding                 => 'UTF-8',

    # Disable deprecated behavior needed by old applications
    disable_component_resolution_regex_fallback => 1,

    live                     => $ENV{live},
    default_view             => 'Web',

    'View::JSON'             => { expose_stash => 'json_data', },

    'Plugin::Authentication' => {
        default => {
            credential => {
                class             => 'Password',
                password_field    => 'password',
                password_type     => 'salted_hash',
                password_salt_len => 4,
            },
            store => {
                class         => 'DBIx::Class',
                user_model    => 'DB::User',
                role_column   => 'roles',
                role_relation => 'roles',
                role_field    => 'name',
            },
        },
    },
}
