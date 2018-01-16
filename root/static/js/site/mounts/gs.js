site.mounts.gs = {
    domToParams: function( $form, params ) {
        params.storage_url = 'gs://' + $form.select('input[name="bucketname"]').val();
        var prefix = $form.select('input[name="prefix"]').val();
        if ( prefix !== null ) {
            params.storage_url += '/' + prefix;
        }
    },
    paramsToDom: function( mount ) {
        var sparts = mount.storage_url.split('/');
        mount.bucketname = sparts[2];
        mount.prefix = sparts[3];
    }
};
