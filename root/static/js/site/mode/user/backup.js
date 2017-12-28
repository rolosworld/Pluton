site.mode.user.backup = Meta( site.obj.mode ).extend({
    getSiteData: function(cb) {
        var queue = Meta.queue.$(function() {
            cb(site.data);
        });

        site.data.system_users = {};

        queue.increase();
        site.mode.user.system_user.getSystemUsers(function(result){
            site.data.system_users.users = result;
            queue.decrease();
        });

        queue.increase();
        site.mode.user.schedule.getSchedules(function(result){
            site.data.schedules = {names:result};
            queue.decrease();
        });

        if (!site.data.backups) {
            site.data.backups = {};
        }

        var method = site.data.params.method;
        site.data.backups.method = {};
        if (method) {
            site.data.backups.method[method] = 1;
        }
        site.data.backups.method_name = method;

        queue.increase();
        this.getBackups(function(result){
            site.data.backups.names = result;
            queue.decrease();
        });

        Meta.jsonrpc.execute();
        queue.start();
    },
    getBackups: function(cb) {
        Meta.jsonrpc.push({
            method:'user.backup.list',
            params:{},
            callback:function(v){
                var err = v.error;
                if (err) {
                    site.log.errors(err);
                    return false;
                }

                if (v.result) {
                    cb(v.result);
                    return true;
                }

                return false;
            }
        });
    },
    getDomData: function($form) {
        // Prepare data for the request
        var s = Meta.string.$(),
            id = $form.select('input[name="id"]').val(),
            name = $form.select('input[name="name"]').val(),
            system_user = $form.select('select[name="system_user"]').val(),
            mount = $form.select('select[name="mount"]').val(),
            schedule = $form.select('select[name="schedule"]').val(),
            keep = $form.select('input[name="keep"]').val(),
            params = {name: name};

        if (s.set(id).hasInt()) {
            params.id = s.toInt();
        }

        if (s.set(system_user).hasInt()) {
            params.system_user = s.toInt();
        }

        if (s.set(mount).hasInt()) {
            params.mount = s.toInt();
        }

        if (s.set(schedule).hasInt()) {
            params.schedule = s.toInt();
        }

        if (s.set(keep).hasInt()) {
            params.keep = s.toInt();
        }

        var $folders = $form.select('#folders-container').select('input:checked');
        var folders_val = $folders.val();
        params.folders = $folders.len() == 1 ? [folders_val] : folders_val;

        return params;
    },
    backupNow: function(backup, cb) {
        Meta.jsonrpc.push({
            method:'user.backup.now',
            params:{backup:backup},
            callback:function(v){
                var err = v.error;
                if (err) {
                    site.log.errors(err);
                    return false;
                }

                if (v.result) {
                    //cb(v.result);
                    return true;
                }

                return false;
            }
        });
    },
    getSources: function(backup, cb) {
        Meta.jsonrpc.push({
            method:'user.backup.sources',
            params:{backup:backup},
            callback:function(v){
                var err = v.error;
                if (err) {
                    site.log.errors(err);
                    return false;
                }

                if (v.result) {
                    cb(v.result);
                    return true;
                }

                return false;
            }
        });
    },
    loadFolders: function(user, path, cb) {
        var params = {
            user:Meta.string.$(user).toInt()
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
                    type:'checkbox'
                }));
                $container.select('input[type="checkbox"]').on('change', function() {
                    if (this.checked) {
                        Meta.dom.$().select('#container-' + this.value.replace(/[\ \.\/]/g,'_')).empty();
                    }
                    return true;
                });
                $container.select('a').on('click', function() {
                    var $a = Meta.dom.$(this);
                    var checkbox = $a.parent().parent().select('input[type="checkbox"]').get(0);
                    if (!checkbox || !checkbox.checked) {
                        site.mode.user.backup.loadFolders(user, $a.data('path'));
                        Meta.jsonrpc.execute();
                    }
                    return false;
                });
            }
            else {
                $container.inner('<div>Empty</div>');
            }

            if (cb) {
                cb();
            }
        });
    }
});
