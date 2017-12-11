site.mode.admin.backup.methods.list = Meta( site.obj.method ).extend({
    process: function() {
        site.mode.admin.backup.getBackups(function(result){
            site.data.backups.names = v.result;
            site.switchMode('backup');
        });
        Meta.jsonrpc.execute();
    }
});
