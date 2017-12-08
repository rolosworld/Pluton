site.mode.admin.system_user = {
    params:{},
    getData: function(cb) {
        var queue = Meta.queue.$(function() {
            cb(site.data);
        });

        site.data.system_users = {};

        var method = this.params.method;
        site.data.system_users.method = {};
        if (method) {
            site.data.system_users.method[method] = 1;
        }
        site.data.system_users.method_name = method;

        queue.increase();
        this.getMounts(function(result){
            site.data.system_users.mounts = result;
            queue.decrease();
        });

        queue.increase();
        this.getSystemUsers(function(result){
            site.data.system_users.users = result;
            queue.decrease();
        });
        Meta.jsonrpc.execute();
        queue.start();
    },
    getMounts: function(cb) {
        Meta.jsonrpc.push({
            method:'admin.systemuser.list_mounts',
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
    getSystemUsers: function(cb) {
        Meta.jsonrpc.push({
            method:'admin.systemuser.list',
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
    getFolders: function(params, cb) {
        Meta.jsonrpc.push({
            method:'admin.systemuser.folders',
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
    getParams: function($form) {
        var name = $form.select('input[name="name"]').val();
        var type = $form.select('select[name="type"]').val();
        var storage_url = $form.select('input[name="storage-url"]').val();
        var backend_login = $form.select('input[name="backend-login"]').val();
        var backend_password = $form.select('input[name="backend-password"]').val();
        var fs_passphrase = $form.select('input[name="fs-passphrase"]').val();

        var params = {
            name:name,
            type:type,
            storage_url: storage_url,
            backend_login: backend_login,
            backend_password: backend_password,
            fs_passphrase: fs_passphrase
        };
        if (!backend_password) {
            delete params.backend_password;
        }
        if (!backend_login) {
            delete params.backend_login;
        }

        return params;
    },
    init: function(params) {
        var me = site.mode.admin.system_user;
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
        site.doms.middle.inner(site.mustache.render('system_user', site.data));
    },
    s3ql: function(authinfo2_val) {
        var su = site.mode.admin.system_user;
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
            method:'admin.systemuser.s3ql',
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
        var su = site.mode.admin.system_user;

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
                method:'admin.systemuser.s3ql_remount',
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
    loadFolders: function(path) {
        var me = site.mode.admin.system_user;
        var user = Meta.string.$(site.data.params.user).toInt();

        var params = {
            user:user
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
                    type:'radio'
                }));
                $container.select('a').on('click', function() {
                    var $a = Meta.dom.$(this);
                    site.mode.admin.system_user.loadFolders($a.data('path'));
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
        configuration: function(params) {
            var $container = Meta.dom.$().select('#system_user-container');
            $container.inner(site.mustache.render('system_user-configuration-list', site.data));
        },
        'mount-add': function(params) {
            var $container = Meta.dom.$().select('#system_user-container');
            $container.inner(site.mustache.render('system_user-mount-form', {type:{generic:1}}));

            var $form = $container.select('#system_user-mount-form');
            var $type = $form.select('select[name="type"]');
            $type.on('change', function() {
                var $container = $form.select('#system_user-mount-fields-container');
                var type = $type.select('option:checked').val();
                $container.inner(site.mustache.render('system_user-mount-'+type+'-fields', {}));

                if (type == 'local') {
                    // Folders loaders
                    site.mode.admin.system_user.loadFolders();
                    Meta.jsonrpc.execute();
                }
            });

            $form.on('submit', function() {
                var params = site.mode.admin.system_user.getParams($form);

                Meta.jsonrpc.push({
                    method:'admin.systemuser.addmount',
                    params:params,
                    callback:function(v){
                        var err = v.error;
                        if (err) {
                            site.log.errors(err);
                            return false;
                        }

                        if (v.result) {
                            site.data.system_users.mounts = v.result;
                            location.hash = '#mode=system_user;method=configuration;user=' + site.data.params.user;
                            return true;
                        }

                        return false;
                    }
                }).execute();
                return false;
            });
        },
        'mount-edit': function(params) {
            var mounts = site.data.system_users.mounts, mount;
            for (var i = 0; i < mounts.length; i++) {
                if (mounts[i].id == params.mid) {
                    mount = mounts[i];
                    break;
                }
            }

            var t = mount.type;
            mount.type = {};
            mount.type[t] = 1;
            var $container = Meta.dom.$().select('#system_user-container');
            $container.inner(site.mustache.render('system_user-mount-form', mount));

            var $form = $container.select('#system_user-mount-form');
            var $type = $form.select('select[name="type"]');
            $type.on('change', function() {
                var $container = $form.select('#system_user-mount-fields-container');
                var type = $type.select('option:checked').val();
                $container.inner(site.mustache.render('system_user-mount-'+type+'-fields', site.data));

                if (type == 'local') {
                    // Folders loaders
                    site.mode.admin.system_user.loadFolders();
                    Meta.jsonrpc.execute();
                }
            });

            $form.on('submit', function() {
                var params = site.mode.admin.system_user.getParams($form);

                Meta.jsonrpc.push({
                    method:'admin.systemuser.editmount',
                    params:params,
                    callback:function(v){
                        var err = v.error;
                        if (err) {
                            site.log.errors(err);
                            return false;
                        }

                        if (v.result) {
                            site.data.system_users.mounts = v.result;
                            location.hash = '#mode=system_user;method=configuration;user=' + site.data.params.user;
                            return true;
                        }

                        return false;
                    }
                }).execute();
                return false;
            });

            if (mount.type.local) {
                // Folders loaders
                site.mode.admin.system_user.loadFolders();
                Meta.jsonrpc.execute();
            }
        },
        s3ql: function(params) {
            var $container = Meta.dom.$().select('#system_user-container');
            $container.inner(site.mustache.render('system_user-configuration-raw', site.data));

            var su = site.mode.admin.system_user;

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
            var $container = Meta.dom.$().select('#system_user-container');
            $container.inner(site.mustache.render('system_user-add-form'));

            var $form = Meta.dom.$().select('#system_user-add-form');
            $form.on('submit', function(){
                var username = $form.select('input[name="username"]').val();
                var password = $form.select('input[name="password"]').val();
                if (!username) {
                    return false;
                }

                Meta.jsonrpc.push({
                    method:'admin.systemuser.add',
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
            site.mode.admin.system_user.getSystemUsers(function(result){
                site.data.system_users.users = v.result;
                site.switchMode('system_user');
            });
            Meta.jsonrpc.execute();
        }
    }
};
