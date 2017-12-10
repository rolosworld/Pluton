site.mode.admin.backup = {
    params:{},
    getData: function(cb) {
        var queue = Meta.queue.$(function() {
            cb(site.data);
        });

        site.data.system_users = {};

        queue.increase();
        site.mode.admin.system_user.getSystemUsers(function(result){
            site.data.system_users.users = result;
            queue.decrease();
        });

        queue.increase();
        site.mode.admin.schedule.getSchedules(function(result){
            site.data.schedules = {names:result};
            queue.decrease();
        });

        if (!site.data.backups) {
            site.data.backups = {};
        }

        var method = this.params.method;
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
            method:'admin.backup.list',
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
    init: function(params) {
        var me = site.mode.admin.backup;
        site.emptyDoms();
        me.params = params;

        site.mode.admin.home.initLeft();
        site.log.init();

        me.getData(function() {
            me.initMiddle();

            var methods = me.methods;
            if (methods[params.method]) {
                methods[params.method](params);
            }

            site.showDoms();
        });
    },
    initMiddle: function() {
        site.doms.middle.append(site.mustache.render('backup', site.data));
    },
    getParams: function($form) {
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
    getSources: function(backup, cb) {
        Meta.jsonrpc.push({
            method:'admin.backup.sources',
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
        site.mode.admin.system_user.getFolders(params, function(folders){
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
                        site.mode.admin.backup.loadFolders(user, $a.data('path'));
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
    },
    methods: {
        edit: function(params) {
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

            var $container = Meta.dom.$().select('#backup-form-container');
            $container.append(site.mustache.render('backup-form', backup));

            var $form = Meta.dom.$().select('#backup-form');
            $form.on('submit', function(){
                var params = site.mode.admin.backup.getParams($form);
                var id = params.id,
                    name = params.name;
                if (!id || !name) {
                    return false;
                }

                Meta.jsonrpc.push({
                    method:'admin.backup.edit',
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
            site.mode.admin.backup.loadFolders( backup.system_user.id );

            queue.increase();
            site.mode.admin.system_user.getMounts( backup.system_user.id, function(result){
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
                site.mode.admin.backup.loadFolders( suser );
                site.mode.admin.system_user.getMounts( suser, function(result){
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
                        site.mode.admin.backup.loadFolders(backup.system_user.id, path, function() {
                            queue.decrease();
                        });
                        pending[path] = 1;
                    }
                    path += '/';
                }
            });
            Meta.jsonrpc.execute();
            queue.start();
        },
        add: function() {
            var $form = Meta.dom.$().select('#backup-form');
            $form.on('submit', function(){
                var params = site.mode.admin.backup.getParams($form);
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
            site.mode.admin.backup.loadFolders($system_user.val());
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
        },
        list: function() {
            site.mode.admin.backup.getBackups(function(result){
                site.data.backups.names = v.result;
                site.switchMode('backup');
            });
            Meta.jsonrpc.execute();
        }
    }
};
