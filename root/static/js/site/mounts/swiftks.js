site.mounts.swiftks = {
    domToParams: function( $form, params ) {
        // Storage URL
        params.storage_url = 'swiftks://' + $form.select('input[name="hostname"]').val();

        var port = $form.select('input[name="port"]').val();
        if ( port ) {
            params.storage_url += ':' + port;
        }

        var region = $form.select('input[name="region"]').val();
        var container = $form.select('input[name="container"]').val();
        params.storage_url += '/' + region + ':' + container;

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

        var rc = sparts[3].split(':');
        mount.region = rc[0];
        mount.container = rc[1];

        if ( sparts.length > 4 ) {
            mount.prefix = sparts[4];
        }

        // Backend Login
        var bl = mount.backend_login.split(':');
        mount.tenant = bl[0];
        mount.username = bl[1];
    }
};
