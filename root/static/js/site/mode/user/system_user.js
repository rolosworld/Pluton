site.mode.user.system_user = {
    params:{},
    getData: function(cb) {
        site.data.system_users = {};

        site.data.system_users.method = {s3ql:1};
        site.data.system_users.method_name = 's3ql';

        this.getSystemUsers(function(result){
            site.data.system_users.users = result;
            cb(site.data);
        });
        Meta.jsonrpc.execute();
    },
    getSystemUsers: function(cb) {
        cb([site.data.user.system_user]);
    },
    getFolders: function(params, cb) {
        Meta.jsonrpc.push({
            method:'user.systemuser.folders',
            params:params,
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
        var me = site.mode.user.system_user;
        site.emptyDoms();
        me.params = params;

        site.mode.user.home.initLeft();
        site.log.init();

        me.getData(function() {
            me.initMiddle();
            params.user = site.data.user.system_user.id;
            me.methods.s3ql(params);
            site.showDoms();
        });
    },
    initMiddle: function() {
        site.doms.middle.append(site.mustache.render('system_user', site.data));
    },
    s3ql: function(authinfo2_val) {
        var su = site.mode.user.system_user;
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
            method:'user.systemuser.s3ql',
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
        var su = site.mode.user.system_user;

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
                method:'user.systemuser.s3ql_remount',
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
            var su = site.mode.user.system_user;

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
        list: function() {
            site.mode.user.system_user.getSystemUsers(function(result){
                site.data.system_users.users = v.result;
                site.switchMode('system_user');
            });
            Meta.jsonrpc.execute();
        }
    }
};
