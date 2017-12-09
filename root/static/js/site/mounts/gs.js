site.mounts.gs = {
    domToParams: function( $form, params ) {
        params.storage_url = 'gs://' + $form.select('input[name="bucketname"]').val();
        params.storage_url += '/' + $form.select('input[name="prefix"]').val();
    },
    paramsToDom: function( mount ) {
        var sparts = mount.storage_url.split('/');
        mount.bucketname = sparts[2];
        mount.prefix = sparts[3];
    }
};
