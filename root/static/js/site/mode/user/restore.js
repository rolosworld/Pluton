site.mode.user.restore = Meta( site.obj.mode ).extend({
    getSiteData: function(cb) {
        var me = site.mode.user.restore;
        var queue = Meta.queue.$(function() {
            cb(site.data);
        });

        queue.increase();
        site.mode.user.backup.getBackups(function(result){
            if (!site.data.backups) {
                site.data.backups = {};
            }
            site.data.backups.names = result;
            queue.decrease();
        });

        if (site.data.params.id) {
            queue.increase();
            site.mode.user.backup.getSources(Meta.string.$(site.data.params.id).toInt(), function(result){
                if (!site.data.backups) {
                    site.data.backups = {};
                }
                site.data.backups.sources = result;
                queue.decrease();
            });
        }

        if (!site.data.restores) {
            site.data.restores = {};
        }

        var method = site.data.params.method;
        site.data.restores.method = {};
        if (method) {
            site.data.restores.method[method] = 1;
        }
        site.data.restores.method_name = method;

        Meta.jsonrpc.execute();
        queue.start();
    },
    getBackup: function(id) {
        var backup;
        Meta.each(site.data.backups.names, function(v) {
            if (v.id == id) {
                backup = v;
                return false;
            }
        });
        return backup;
    },
    getDomData: function($form) {
        var me = site.mode.user.restore;

        // Prepare data for the request
        var s = Meta.string.$(),
            source = $form.select('select[name="source"]').val(),
            params = {
                backup: Meta.string.$(site.data.params.id).toInt()
            };


        $form.select('#folders-container').select('input[type="radio"]').forEach(function(v) {
            if (v.checked) {
                params.destination = v.value;
                return false;
            }
        });

        if (source) {
            params.source = source;
        }
        return params;
    },
    loadFolders: function(path) {
        var me = site.mode.user.restore;
        var backup = me.getBackup(site.data.params.id);
        var user = backup.system_user.id;
        
        var params = {
            user:user
        };
        if (path) {
            params.path = path;
        }
        site.mode.user.system_user.getFolders(params, function(folders){
            Meta.each(folders, function(folder, i) {
                var name = folder.split('/');
                name = name[name.length - 1];
                var path = folder.substring(2);
                folders[i] = {
                    name: name,
                    path: path,
                    id: path.replace(/[\ \.\/]/g,'_')
                };
            });

            var pid = path ? 'container-' + path.replace(/[\ \.\/]/g,'_') : 'folders-container';
            var $container = Meta.dom.$().select('#' + pid);
            if (folders.length) {
                $container.inner(site.mustache.render('folders', {
                    folders:folders,
                    type:'radio'
                }));
                $container.select('a').on('click', function() {
                    var $a = Meta.dom.$(this);
                    site.mode.user.restore.loadFolders($a.data('path'));
                    Meta.jsonrpc.execute();
                    return false;
                });
            }
            else {
                $container.inner('<div>Empty</div>');
            }
        });
    }
});
