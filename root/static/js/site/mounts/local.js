site.mounts.local = {
    domToParams: function( $form, params ) {
        params.storage_url = 'local:///' + $form.select('#folders-container').select('input:checked').val();
;
    },
    paramsToDom: function( mount ) {
        mount.path = mount.storage_url.substring(9);
    }
};
