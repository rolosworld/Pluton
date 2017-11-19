site.mode.system_user = {
    init: function(params) {
        site.emptyDoms();

        var method = params.method;
        if (!site.data.system_users) {
            site.data.system_users = {};
        }
        site.data.system_users.method = {};
        if (method) {
            site.data.system_users.method[method] = 1;
        }
        site.data.system_users.method_name = method;

        site.mode.home.initLeft();
        site.log.init();
        site.mode.system_user.initMiddle(params);
        site.mode.system_user.processMethod(method);
        site.showDoms();
    },
    initMiddle: function(params) {
        site.doms.middle.append(site.mustache.render('system_user', site.data));
    },
    methods: {
        add: function() {
            var $form = Meta.dom.$().select('#system_user-add-form');
            $form.on('submit', function(){
                var username = $form.select('input[name="username"]').val();
                var password = $form.select('input[name="password"]').val();
                if (!username) {
                    return false;
                }

                Meta.jsonrpc.push({
                    method:'systemuser.add',
                    params:{
                        username:username,
                        password:password
                    },
                    callback:function(v){
                        var err = v.error;
                        if (err) {
                            site.log.errors(err);
                            return false;
                        }

                        // Since it's a new login we want to reset all data
                        if (v.result) {
                            site.data.system_users.users = v.result;
                            location.hash = '#mode=system_user';
                            return true;
                        }

                        return false;
                    }
                }).execute();
                return false;
            });
        },
        list: function() {
            if (!site.data.system_users.users) {
                Meta.jsonrpc.push({
                    method:'systemuser.list',
                    params:{},
                    callback:function(v){
                        var err = v.error;
                        if (err) {
                            site.log.errors(err);
                            return false;
                        }

                        if (v.result) {
                            site.data.system_users.users = v.result;
                            site.switchMode('system_user');
                            return true;
                        }

                        return false;
                    }
                }).execute();
            }
        }
    },
    processMethod: function(method) {
        var methods = site.mode.system_user.methods;
        if (!methods[method]) {
            method = 'list';
        }

        methods[method]();
    }
};
