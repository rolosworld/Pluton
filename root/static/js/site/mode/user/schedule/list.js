site.mode.user.schedule.methods.list = Meta( site.obj.method ).extend({
    process: function() {
        site.mode.user.schedule.getSchedules(function(result){
            site.data.schedules.names = v.result;
            site.switchMode('schedule');
        });
        Meta.jsonrpc.execute();
    }
});
