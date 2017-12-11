site.mode.admin.system_user.methods.rm = Meta( site.obj.method ).extend({
    process: function() {
        var params = site.data.params;
        Meta.jsonrpc.push({
            method:'admin.systemuser.rm',
            params:{
                id:Meta.string.$(params.user).toInt()
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
    }
});
