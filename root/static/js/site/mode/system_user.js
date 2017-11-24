site.mode.system_user = {
    params:{},
    getData: function(cb) {
        if (!site.data.system_users) {
            site.data.system_users = {};
        }

        var method = this.params.method;
        site.data.system_users.method = {};
        if (method) {
            site.data.system_users.method[method] = 1;
        }
        site.data.system_users.method_name = method;

        if (!site.data.system_users.users) {
            this.getSystemUsers(function(result){
                site.data.system_users.users = result;
                cb(site.data);
            });
            Meta.jsonrpc.execute();
            return;
        }

        cb(site.data);
    },
    getSystemUsers: function(cb) {
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
                    cb(v.result);
                    return true;
                }

                return false;
            }
        });
    },
    init: function(params) {
        var me = site.mode.system_user;
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
        site.doms.middle.append(site.mustache.render('system_user', site.data));
    },
    s3ql: function(authinfo2_val) {
        var su = site.mode.system_user;
        var $form = Meta.dom.$().select('#system_user-s3ql-form');
        var $authinfo2 = $form.select('textarea[name="authinfo2"]');
        var $id = $form.select('input[name="id"]');
        var $submit = $form.select('input[type="submit"]');

        var params = {user: Meta.string.$($id.val()).toInt()};
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
        var $a = Meta.dom.$().select('#system_user-s3ql_remount');
        $a.data('user', params.user);

        var pending = 0;
        $a.on('click', function(){
            if (pending) {
                return false;
            }

            pending = 1;
            $log.text('');
            Meta.jsonrpc.push({
                method:'systemuser.s3ql_remount',
                params:{
                    user:Meta.string.$($a.data('user')).toInt()
                },
                callback:function(v){
                    pending = 0;
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
            site.mode.system_user.getSystemUsers(function(result){
                site.data.system_users.users = v.result;
                site.switchMode('system_user');
            });
            Meta.jsonrpc.execute();
        }
    }
};
