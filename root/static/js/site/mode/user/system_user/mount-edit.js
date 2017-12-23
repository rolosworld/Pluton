site.mode.user.system_user.methods['mount-edit'] = Meta( site.obj.method ).extend({
    mount: null,
    preDrawUI: function() {
        var mounts = site.data.system_users.mounts,
            mount,
            params = site.data.params;

        for (var i = 0; i < mounts.length; i++) {
            if (mounts[i].id == params.mid) {
                mount = mounts[i];
                break;
            }
        }

        var type = site.mode.user.system_user.calculateMountType( mount.storage_url );
        mount.type = {};
        mount.type[type] = 1;

        mount.params = params;

        site.mounts[type].paramsToDom( mount );
        this.mount = mount;
    },
    drawUI: function() {
        site.mode.user.system_user.methods.main.drawUI();
        var $container = this.$container = Meta.dom.$().select('#system_user-container');
        $container.inner(site.mustache.render('system_user-mount-form', this.mount));
    },
    postDrawUI: function() {
        var mount = this.mount;
        var params = site.data.params;

        var $container = this.$container;
        var $form = $container.select('#system_user-mount-form');
        var $type = $form.select('select[name="type"]');
        $type.on('change', function() {
            var $container = $form.select('#system_user-mount-fields-container');
            var type = $type.select('option:checked').val();
            site.mounts[type].paramsToDom( mount );
            $container.inner(site.mustache.render('system_user-mount-'+type+'-fields', mount));

            if (type == 'local') {
                // Folders loaders
                site.mode.user.system_user.loadFolders();
                Meta.jsonrpc.execute();
            }

            if ( type == 'gs' ) {
                $container.select('#get_google_key').on('click', function() {
                    site.mode.user.system_user.getGoogleKey( params.user );
                    Meta.jsonrpc.execute();
                    return false;
                });
            }
        });

        $form.on('submit', function() {
            var params = site.mode.user.system_user.getDomData( $form );

            Meta.jsonrpc.push({
                method:'user.systemuser.editmount',
                params: params,
                callback: function( v ){
                    var err = v.error;
                    if ( err ) {
                        site.log.errors( err );
                        return false;
                    }

                    if ( v.result ) {
                        site.data.system_users.mounts = v.result;
                        location.hash = '#mode=system_user;method=mount-view;mid=' + site.data.params.mid + ';user=' + site.data.params.user;
                        return true;
                    }

                    return false;
                }
            }).execute();
            return false;
        });

        if ( mount.type.local ) {
            // Folders loaders
            var folder = mount.path;
            var pending = {};
            var queue = Meta.queue.$(function(){
                var found = $container.select('#' + folder.replace(/[\ \.\/]/g,'_')).get(0);
                if ( found ) {
                    found.checked = true;
                }
            });

            queue.increase();
            site.mode.user.system_user.loadFolders( null, function() {
                queue.decrease();
            });

            var parts = folder.split('/');
            var j = 0;
            var path = '';
            for (; j < parts.length - 1; j++) {
                path += parts[j];
                if (!pending[path]) {
                    queue.increase();
                    site.mode.user.system_user.loadFolders( path, function() {
                        queue.decrease();
                    });
                    pending[path] = 1;
                }
                path += '/';
            }
            Meta.jsonrpc.execute();
            queue.start();
        }

        if ( mount.type.gs ) {
            $container.select('#get_google_key').on('click', function() {
                site.mode.user.system_user.getGoogleKey( params.user );
                Meta.jsonrpc.execute();
                return false;
            });
        }
    }
});
