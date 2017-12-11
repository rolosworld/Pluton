site.mode.user.system_user.methods['mount-rm'] = Meta( site.obj.method ).extend({
    process: function() {
        var params = site.data.params;
        Meta.jsonrpc.push({
            method:'user.systemuser.rmmount',
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
    }
});
