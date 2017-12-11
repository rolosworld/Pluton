site.mode.admin.schedule.methods.edit = Meta( site.obj.method ).extend({
    schedule: null,
    preDrawUI: function() {
        // Get form data
        var schedules = site.data.schedules.names, schedule;
        for (var i = 0; i < schedules.length; i++) {
            if (schedules[i].id == site.data.params.id) {
                schedule = schedules[i];
            }
        }

        this.schedule = schedule;
    },
    drawUI: function() {
        site.mode.admin.schedule.methods.main.drawUI();
    },
    postDrawUI: function() {
        var schedule = this.schedule;
        // Load form with the data
        var $container = Meta.dom.$().select('#schedule-form-container');
        $container.append(site.mustache.render('schedule-form', schedule));

        // Set the form callback
        var $form = Meta.dom.$().select('#schedule-form');
        $form.on('submit', function(){
            // Don't submit if the required fields aren't set
            var params = site.mode.admin.schedule.getDomData($form);
            var id = params['id'],
                name = params.name;
            if (!id || !name) {
                return false;
            }

            // Do the request
            Meta.jsonrpc.push({
                method:'admin.schedule.edit',
                params:params,
                callback:function(v){
                    // Process errors
                    var err = v.error;
                    if (err) {
                        site.log.errors(err);
                        return false;
                    }

                    // Process the result
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
