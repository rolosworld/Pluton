site.mode.restore = {
    params:{},
    getData: function(cb) {
        var me = site.mode.restore;
        var queue = Meta.queue.$(function() {
            cb(site.data);
        });

        queue.increase();
        site.mode.backup.getBackups(function(result){
            if (!site.data.backups) {
                site.data.backups = {};
            }
            site.data.backups.names = result;
            queue.decrease();
        });

        if (me.params.id) {
            queue.increase();
            site.mode.backup.getSources(Meta.string.$(me.params.id).toInt(), function(result){
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

        var method = this.params.method;
        site.data.restores.method = {};
        if (method) {
            site.data.restores.method[method] = 1;
        }
        site.data.restores.method_name = method;

        Meta.jsonrpc.execute();
        queue.tryRun();
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
    init: function(params) {
        var me = site.mode.restore;
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
        site.doms.middle.append(site.mustache.render('restore', site.data));
    },
    getParams: function($form) {
        var me = site.mode.restore;

        // Prepare data for the request
        var s = Meta.string.$(),
            source = $form.select('select[name="source"]').val(),
            params = {
                backup: Meta.string.$(me.params.id).toInt()
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
        var me = site.mode.restore;
        var backup = me.getBackup(me.params.id);
        var user = backup.system_user.id;
        
        var params = {
            user:user
        };
        if (path) {
            params.path = path;
        }
        site.mode.system_user.getFolders(params, function(folders){
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
                    site.mode.restore.loadFolders($a.data('path'));
                    Meta.jsonrpc.execute();
                    return false;
                });
            }
            else {
                $container.inner('<div>Empty</div>');
            }
        });
    },
    methods: {
        process: function() {
            var me = site.mode.restore;
            var $form = Meta.dom.$().select('#restore-form');
            $form.on('submit', function(){
                var params = me.getParams($form);
                var backup = params.backup;
                if (!backup) {
                    return false;
                }

                Meta.jsonrpc.push({
                    method:'backup.restore',
                    params:params,
                    callback:function(v){
                        var err = v.error;
                        if (err) {
                            site.log.errors(err);
                            return false;
                        }

                        if (v.result) {
                            location.hash = '#mode=restore';
                            return true;
                        }

                        return false;
                    }
                }).execute();
                return false;
            });

            // Folders loaders
            me.loadFolders();
            Meta.jsonrpc.execute();
        }
    }
};
