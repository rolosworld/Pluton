site.mode.user.backup.methods.edit = Meta( site.obj.method ).extend({
    backup: null,
    preDrawUI: function() {
        var params = site.data.params;
        var backups = site.data.backups.names, backup;
        for (var i = 0; i < backups.length; i++) {
            if (backups[i].id == params.id) {
                backup = backups[i];
                break;
            }
        }

        var data = [];
        Meta.each(site.data.system_users.users, function(v, i){
            delete v.selected;
            if (backup.system_user.id == v.id) {
                v.selected = 1;
            }

            data.push(v);
        });
        backup.system_users = {users:data};

        data = [];
        Meta.each(site.data.schedules.names, function(v, i){
            delete v.selected;
            if (backup.schedule.id == v.id) {
                v.selected = 1;
            }

            data.push(v);
        });
        backup.schedules = {names:data};

        this.backup = backup;
    },
    drawUI: function() {
        site.mode.user.backup.methods.main.drawUI();
        var $container = this.$container = Meta.dom.$().select('#backup-form-container');
        $container.append(site.mustache.render('backup-form', this.backup));
    },
    postDrawUI: function() {
        var $container = this.$container;
        var backup = this.backup;
        var $form = Meta.dom.$().select('#backup-form');
        $form.on('submit', function(){
            var params = site.mode.user.backup.getDomData($form);
            var id = params.id,
                name = params.name;
            if (!id || !name) {
                return false;
            }

            Meta.jsonrpc.push({
                method:'user.backup.edit',
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
        var folders = backup.folders.split("\n");
        var pending = {};
        var queue = Meta.queue.$(function(){
            Meta.each(folders, function(folder) {
                $container.select('#' + folder.replace(/[\ \.\/]/g,'_')).get(0).checked = true;
            });
        });

        var $system_user = Meta.dom.$().select('select[name="system_user"]');
        site.mode.user.backup.loadFolders( backup.system_user.id );

        queue.increase();
        site.mode.user.system_user.getMounts( backup.system_user.id, function(result){
            site.data.system_users.mounts = result;
            Meta.each(result, function(v, i){
                delete v.selected;
                if (backup.mount == v.id) {
                    v.selected = 1;
                }
            });

            var $container = Meta.dom.$().select('#backup-form-mounts');
            $container.inner(site.mustache.render('backup-form-mounts', site.data));
            queue.decrease();
        });

        $system_user.on('change', function() {
            var suser = Meta.dom.$(this).val();
            site.mode.user.backup.loadFolders( suser );
            site.mode.user.system_user.getMounts( suser, function(result){
                site.data.system_users.mounts = result;
                var $container = Meta.dom.$().select('#backup-form-mounts');
                $container.inner(site.mustache.render('backup-form-mounts', site.data));
            });
            Meta.jsonrpc.execute();
        });

        Meta.each(folders, function(folder) {
            var parts = folder.split('/');
            var j = 0;
            var path = '';
            for (; j < parts.length - 1; j++) {
                path += parts[j];
                if (!pending[path]) {
                    queue.increase();
                    site.mode.user.backup.loadFolders(backup.system_user.id, path, function() {
                        queue.decrease();
                    });
                    pending[path] = 1;
                }
                path += '/';
            }
        });
        Meta.jsonrpc.execute();
        queue.start();
    }
});
