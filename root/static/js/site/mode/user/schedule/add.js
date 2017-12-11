site.mode.user.schedule.methods.add = Meta( site.obj.method ).extend({
    drawUI: function() {
        site.mode.user.schedule.methods.main.drawUI();
    },
    postDrawUI: function() {
        var $form = Meta.dom.$().select('#schedule-form');
        $form.on('submit', function(){
            var params = site.mode.user.schedule.getDomData($form);
            var name = params.name;
            if (!name) {
                return false;
            }

            Meta.jsonrpc.push({
                method:'user.schedule.add',
                params:params,
                callback:function(v){
                    var err = v.error;
                    if (err) {
                        site.log.errors(err);
                        return false;
                    }

                    if (v.result) {
                        site.data.schedules.names = v.result;
                        location.hash = '#mode=schedule';
                        return true;
                    }

                    return false;
                }
            }).execute();
            return false;
        });
    }
});
