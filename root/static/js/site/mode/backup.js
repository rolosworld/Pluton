site.mode.backup = {
    params:{},
    getData: function(cb) {
        if (!site.data.system_users) {
            site.mode.system_user.getSystemUsers(function(result){
                site.data.system_users = {names:result};
            });
        }

        if (!site.data.schedule) {
            site.mode.schedule.getSchedules(function(result){
                site.data.schedules = {names:result};
            });
        }

        if (!site.data.backups) {
            site.data.backups = {};
        }

        var method = this.params.method;
        site.data.backups.method = {};
        if (method) {
            site.data.backups.method[method] = 1;
        }
        site.data.backups.method_name = method;

        if (!site.data.backups.names) {
            this.getBackups(function(result){
                site.data.backups.names = result;
                cb(site.data);
            });
            Meta.jsonrpc.execute();
            return;
        }

        cb(site.data);
    },
    getBackups: function(cb) {
        Meta.jsonrpc.push({
            method:'backup.list',
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
        }).execute();
    },
    init: function(params) {
        var me = site.mode.backup;
        site.emptyDoms();
        me.params = params;

        site.mode.home.initLeft();
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
            schedule = $form.select('select[name="schedule"]').val(),
            folders = $form.select('textarea[name="folders"]').val(),
            params = {name: name};

        if (s.set(id).hasInt()) {
            params.id = s.toInt();
        }

        if (s.set(system_user).hasInt()) {
            params.system_user = s.toInt();
        }

        if (s.set(schedule).hasInt()) {
            params.schedule = s.toInt();
        }

        if (folders) {
            params.folders = folders.split("\n");
        }

        return params;
    },
    methods: {
        edit: function(params) {
            var backups = site.data.backups.names, backup;
            for (var i = 0; i < backups.length; i++) {
                if (backups[i].id == params.id) {
                    backup = backups[i];
                }
            }

            var data = [];
            Meta.each(site.data.system_users.names, function(v, i){
                delete v.selected;
                if (backup.system_user.id == v.id) {
                    v.selected = 1;
                }

                data.push(v);
            });
            backup.system_users = {names:data};


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
                var params = site.mode.backup.getParams($form);
                var id = params.id,
                    name = params.name;
                if (!id || !name) {
                    return false;
                }

                Meta.jsonrpc.push({
                    method:'backup.edit',
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
        },
        add: function() {
            var $form = Meta.dom.$().select('#backup-form');
            $form.on('submit', function(){
                var params = site.mode.backup.getParams($form);
                var name = params.name;
                if (!name) {
                    return false;
                }

                Meta.jsonrpc.push({
                    method:'backup.add',
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
        },
        list: function() {
            site.mode.backup.getBackups(function(result){
                site.data.backups.names = v.result;
                site.switchMode('backup');
            });
            Meta.jsonrpc.execute();
        }
    },
    processMethod: function(method, params) {
        var methods = site.mode.backup.methods;
        if (methods[method]) {
            methods[method](params);
        }
    }
};
