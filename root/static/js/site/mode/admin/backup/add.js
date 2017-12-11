site.mode.admin.backup.methods.add = Meta( site.obj.method ).extend({
    drawUI: function() {
        site.mode.admin.backup.methods.main.drawUI();
    },
    postDrawUI: function() {
        var $form = Meta.dom.$().select('#backup-form');
        $form.on('submit', function(){
            var params = site.mode.admin.backup.getDomData($form);
            var name = params.name;
            if (!name) {
                return false;
            }

            Meta.jsonrpc.push({
                method:'admin.backup.add',
                params:params,
                callback:function(v){
                    var err = v.error;
                    if (err) {
                        site.log.errors(err);
                        return false;
                    }

                    if (v.result) {
                        site.data.backups.names = v.result;
                        location.hash = '#mode=backup';
                        return true;
                    }

                    return false;
                }
            }).execute();
            return false;
        });

        // Folders loaders
        var $system_user = Meta.dom.$().select('select[name="system_user"]');
        var suser = $system_user.val();
        site.mode.admin.backup.loadFolders( suser );
        site.mode.admin.system_user.getMounts( suser, function(result){
            site.data.system_users.mounts = result;
            var $container = Meta.dom.$().select('#backup-form-mounts');
            $container.inner(site.mustache.render('backup-form-mounts', site.data));
        });
        Meta.jsonrpc.execute();

        $system_user.on('change', function() {
            var suser = $system_user.val();
            site.mode.admin.backup.loadFolders( suser );
            site.mode.admin.system_user.getMounts( suser, function(result){
                site.data.system_users.mounts = result;
                var $container = Meta.dom.$().select('#backup-form-mounts');
                $container.inner(site.mustache.render('backup-form-mounts', site.data));
            });
            Meta.jsonrpc.execute();
        });
    }
});
