site.mode.backup = {
    init: function(params) {
        site.emptyDoms();

        var method = params.method;
        if (!site.data.backups) {
            site.data.backups = {};
        }
        site.data.backups.method = {};
        if (method) {
            site.data.backups.method[method] = 1;
        }
        site.data.backups.method_name = method;

        site.mode.home.initLeft();
        site.log.init();
        site.mode.backup.initMiddle(params);
        site.mode.backup.processMethod(method, params);
        site.showDoms();
    },
    initMiddle: function(params) {
        site.doms.middle.append(site.mustache.render('backup', site.data));
    },
    methods: {
        add: function() {
            var $form = Meta.dom.$().select('#backup-add-form');
            $form.on('submit', function(){
                var name = $form.select('input[name="name"]').val();
                if (!name) {
                    return false;
                }

                Meta.jsonrpc.push({
                    method:'backup.add',
                    params:{
                        name:name,
                    },
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
            if (!site.data.backups.names) {
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
                            site.data.backups.names = v.result;
                            site.switchMode('backup');
                            return true;
                        }

                        return false;
                    }
                }).execute();
            }
        }
    },
    processMethod: function(method, params) {
        var methods = site.mode.backup.methods;
        if (!methods[method]) {
            method = 'list';
        }

        methods[method](params);
    }
};
