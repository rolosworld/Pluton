site.mounts.rackspace = {
    domToParams: function( $form, params ) {
        params.storage_url = 'rackspace://' + $form.select('input[name="region"]').val();
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
        mount.region = sparts[2];
        mount.container = sparts[3];

        if ( sparts.length > 4 ) {
            mount.prefix = sparts[4];
        }

        // Backend Login
        var bl = mount.backend_login.split(':');
        mount.tenant = bl[0];
        mount.username = bl[1];
    }
};
