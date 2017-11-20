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
        site.mode.system_user.processMethod(method, params);
        site.showDoms();
    },
    initMiddle: function(params) {
        site.doms.middle.append(site.mustache.render('system_user', site.data));
    },
    s3ql: function(authinfo2_val) {
        var su = site.mode.system_user;
        var $form = Meta.dom.$().select('#system_user-s3ql-form');
        var $authinfo2 = $form.select('textarea[name="authinfo2"]');
        var $id = $form.select('input[name="id"]');
        var $submit = $form.select('input[type="submit"]');

        var params = {user: $id.val()};
        if (authinfo2_val) {
            params.authinfo2 = authinfo2_val;
        }

        $submit.attr('disabled','disabled');
        Meta.jsonrpc.push({
            method:'systemuser.s3ql',
            params:params,
            callback:function(v){
                $submit.attr('disabled',null);
                var err = v.error;
                if (err) {
                    site.log.errors(err);
                    return false;
                }

                if (v.result) {
                    $authinfo2.val(v.result);
                    return true;
                }

                return false;
            }
        }).execute();
    },
    s3ql_remount: function(params) {
        var su = site.mode.system_user;

        var $log = Meta.dom.$().select('#system_user-s3ql_log');
        var $form = Meta.dom.$().select('#system_user-s3ql_remount-form');
        var $id = $form.select('input[name="id"]');
        $id.val(params.user);

        $form.on('submit', function(){
            var $submit = $form.select('input[type="submit"]');
            $submit.attr('disabled','disabled');
            $log.text('');
            Meta.jsonrpc.push({
                method:'systemuser.s3ql_remount',
                params:{
                    user:$id.val()
                },
                callback:function(v){
                    $submit.attr('disabled',null);
                    var err = v.error;
                    if (err) {
                        site.log.errors(err);
                        return false;
                    }

                    if (v.result) {
                        $log.text(v.result);
                        return true;
                    }

                    return false;
                }
            }).execute();
            return false;
        });
    },
    methods: {
        s3ql: function(params) {
            var su = site.mode.system_user;

            var $form = Meta.dom.$().select('#system_user-s3ql-form');
            var $authinfo2 = $form.select('textarea[name="authinfo2"]');
            var $id = $form.select('input[name="id"]');
            $id.val(params.user);

            su.s3ql();
            $form.on('submit', function(){
                su.s3ql( $authinfo2.val() );
                return false;
            });

            su.s3ql_remount(params);
        },
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
    processMethod: function(method, params) {
        var methods = site.mode.system_user.methods;
        if (!methods[method]) {
            method = 'list';
        }

        methods[method](params);
    }
};
