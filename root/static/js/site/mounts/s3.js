site.mounts.s3 = {
    domToParams: function( $form, params ) {
        params.storage_url = 's3://' + $form.select('input[name="region"]').val();
        params.storage_url += '/' + $form.select('input[name="bucket"]').val();
        params.storage_url += '/' + $form.select('input[name="prefix"]').val();
    },
    paramsToDom: function( mount ) {
        var sparts = mount.storage_url.split('/');
        mount.region = sparts[2];
        mount.bucket = sparts[3];
        mount.prefix = sparts[4];
    }
};
