site.mode.user.backup.methods.list = Meta( site.obj.method ).extend({
    process: function() {
        site.mode.user.backup.getBackups(function(result){
            site.data.backups.names = v.result;
            site.switchMode('backup');
        });
        Meta.jsonrpc.execute();
    }
});
