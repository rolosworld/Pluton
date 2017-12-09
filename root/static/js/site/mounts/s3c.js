site.mounts.s3c = {
    domToParams: function( $form, params ) {
        params.storage_url = 's3c://' + $form.select('input[name="hostname"]').val();
        params.storage_url += ':' + $form.select('input[name="port"]').val();
        params.storage_url += '/' + $form.select('input[name="bucketname"]').val();
        params.storage_url += '/' + $form.select('input[name="prefix"]').val();
    },
    paramsToDom: function( mount ) {
        var sparts = mount.storage_url.split('/');
        var hp = sparts[2].split(':');
        mount.hostname = hp[0];
        mount.port = hp[1];
        mount.bucketname = sparts[3];
        mount.prefix = sparts[4];
    }
};
