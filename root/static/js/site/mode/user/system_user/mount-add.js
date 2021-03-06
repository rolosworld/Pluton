site.mode.user.system_user.methods['mount-add'] = Meta( site.obj.method ).extend({
    drawUI: function() {
        site.mode.user.system_user.methods.main.drawUI();
        var $container = this.$container = Meta.dom.$().select('#system_user-container');
        $container.inner(site.mustache.render('system_user-mount-form', {type:{generic:1}, params: site.data.params}));
    },
    postDrawUI: function() {
        var $container = this.$container;
        var $form = $container.select('#system_user-mount-form');
        var $type = $form.select('select[name="type"]');
        $type.on('change', function() {
            var $container = $form.select('#system_user-mount-fields-container');
            var type = $type.select('option:checked').val();
            $container.inner(site.mustache.render('system_user-mount-'+type+'-fields', {}));

            if ( type == 'local' ) {
                // Folders loaders
                site.mode.user.system_user.loadFolders();
            }

            site.mode.user.system_user.loadMountFolders();
            Meta.jsonrpc.execute();

            if ( type == 'gs' ) {
                $container.select('#get_google_key').on('click', function() {
                    site.mode.user.system_user.getGoogleKey( site.data.params.user );
                    Meta.jsonrpc.execute();
                    return false;
                });
            }
        });

        $form.on('submit', function() {
            var params = site.mode.user.system_user.getDomData($form);

            Meta.jsonrpc.push({
                method:'user.systemuser.addmount',
                params:params,
                callback:function(v){
                    var err = v.error;
                    if (err) {
                        site.log.errors(err);
                        return false;
                    }

                    if (v.result) {
                        site.data.system_users.mounts = v.result;
                        location.hash = '#mode=system_user;method=configuration;user=' + site.data.params.user;
                        return true;
                    }

                    return false;
                }
            }).execute();
            return false;
        });

        site.mode.user.system_user.loadMountFolders();
        Meta.jsonrpc.execute();
    }
});
