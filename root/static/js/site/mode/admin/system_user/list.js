site.mode.admin.system_user.methods.rm = Meta( site.obj.method ).extend({
    process: function() {
        site.mode.admin.system_user.getSystemUsers(function(result){
            site.data.system_users.users = v.result;
            site.switchMode('system_user');
        });
        Meta.jsonrpc.execute();
    }
});
