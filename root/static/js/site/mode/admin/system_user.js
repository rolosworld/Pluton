site.mode.admin.system_user = Meta( site.obj.mode ).extend({
    getSiteData: function(cb) {
        var queue = Meta.queue.$(function() {
            cb(site.data);
        });

        site.data.system_users = {};

        var method = site.data.params.method;
        site.data.system_users.method = {};
        if (method) {
            site.data.system_users.method[method] = 1;
        }
        site.data.system_users.method_name = method;

        queue.increase();
        this.getMounts(site.data.params.user, function(result){
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
    getMounts: function(suser, cb) {
        Meta.jsonrpc.push({
            method:'admin.systemuser.list_mounts',
            params:{system_user: suser},
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
    calculateMountType: function( storage_url ) {
        var sparts = storage_url.split('/');
        return sparts[0].split(':')[0];
    },
    getDomData: function( $form ) {
        var id = $form.select('input[name="id"]').val();
        var name = $form.select('input[name="name"]').val();
        var type = $form.select('select[name="type"]').val();
        var storage_url = $form.select('input[name="storage-url"]').val();
        var backend_login = $form.select('input[name="backend-login"]').val();
        var backend_password = $form.select('input[name="backend-password"]').val();
        var fs_passphrase = $form.select('input[name="fs-passphrase"]').val();

        var params = {
            system_user: Meta.string.$(site.data.params.user).toInt(),
            id:id,
            name:name,
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

        site.mounts[type].domToParams( $form, params );

        return params;
    },
    loadFolders: function(path, cb) {
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

            if (cb) {
                cb();
            }
        });
    },
    mountAuthinfo2: function(params) {
        Meta.jsonrpc.push({
            method:'admin.systemuser.mountauthinfo2',
            params:{
                id:params.mid,
            },
            callback:function(v){
                var err = v.error;
                if (err) {
                    site.log.errors(err);
                    return false;
                }

                if (v.result) {
                    var $log = Meta.dom.$().select('#system_user-mount_log');
                    $log.text(v.result);
                    return true;
                }

                return false;
            }
        }).execute();
    },
    mountMkfs: function(params) {
        Meta.jsonrpc.push({
            method:'admin.systemuser.mountmkfs',
            params:{
                id:params.mid,
            },
            callback:function(v){
                var err = v.error;
                if (err) {
                    site.log.errors(err);
                    return false;
                }

                if (v.result) {
                    var $log = Meta.dom.$().select('#system_user-mount_log');
                    $log.text(v.result);
                    return true;
                }

                return false;
            }
        }).execute();
    },
    rmMount: function(params) {
        Meta.jsonrpc.push({
            method:'admin.systemuser.rmmount',
            params:{
                id:params.mid,
                system_user:params.user
            },
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
    },
    mountUmount: function(params) {
        Meta.jsonrpc.push({
            method:'admin.systemuser.mountumount',
            params:{
                id:params.mid,
            },
            callback:function(v){
                var err = v.error;
                if (err) {
                    site.log.errors(err);
                    return false;
                }

                if (v.result) {
                    var $log = Meta.dom.$().select('#system_user-mount_log');
                    $log.text(v.result);
                    return true;
                }

                return false;
            }
        }).execute();
    },
    mountRemount: function(params) {
        Meta.jsonrpc.push({
            method:'admin.systemuser.mountremount',
            params:{
                id:params.mid,
            },
            callback:function(v){
                var err = v.error;
                if (err) {
                    site.log.errors(err);
                    return false;
                }

                if (v.result) {
                    var $log = Meta.dom.$().select('#system_user-mount_log');
                    $log.text(v.result);
                    return true;
                }

                return false;
            }
        }).execute();
    }
});
