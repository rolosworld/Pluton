site.mounts.swift = {
    domToParams: function( $form, params ) {
        // Storage URL
        params.storage_url = 'swift://' + $form.select('input[name="hostname"]').val();

        var port = $form.select('input[name="port"]').val();
        if ( port ) {
            params.storage_url += ':' + port;
        }

        params.storage_url += '/' + $form.select('input[name="container"]').val();

        var prefix = $form.select('input[name="prefix"]').val();
        if ( prefix ) {
            params.storage_url += '/' + prefix;
        }

        // Backend Login
        var tenant = $form.select('input[name="tenant"]').val();
        var username = $form.select('input[name="username"]').val();
        params.backend_login = tenant + ':' + username;
    },
    paramsToDom: function( mount ) {
        var sparts = mount.storage_url.split('/');

        // Storage URL
        var hp = sparts[2].split(':');
        mount.hostname = hp[0];

        if ( hp.length > 1 ) {
            mount.port = hp[1];
        }

        mount.container = sparts[3];

        if ( sparts.length > 4 ) {
            mount.prefix = sparts[4];
        }

        // Backend Login
        if ( mount.backend_login ) {
            var bl = mount.backend_login.split(':');
            mount.tenant = bl[0];
            mount.username = bl[1];
        }
    }
};
