site.mounts.b2 = {
    domToParams: function( $form, params ) {
        params.storage_url = 'b2://' + $form.select('input[name="bucket"]').val();
        params.storage_url += '/' + $form.select('input[name="prefix"]').val();
    },
    paramsToDom: function( mount ) {
        var sparts = mount.storage_url.split('/');
        mount.bucket = sparts[2];
        mount.prefix = sparts[3];
    }
};
