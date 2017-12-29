site.mode.schedule = Meta( site.obj.mode ).extend({
    getSiteData: function(cb) {
        if (!site.data.schedules) {
            site.data.schedules = {};
        }

        var method = site.data.params.method;
        site.data.schedules.method = {};
        if (method) {
            site.data.schedules.method[method] = 1;
        }
        site.data.schedules.method_name = method;

        if (!site.data.schedules.names) {
            this.getSchedules(function(result){
                site.data.schedules.names = result;
                cb(site.data);
            });
            Meta.jsonrpc.execute();
            return;
        }

        cb(site.data);
    },
    getSchedules: function(cb) {
        Meta.jsonrpc.push({
            method: site.getRole() + '.schedule.list',
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
    getDomData: function($form) {
        var params = {
            name: $form.select('input[name="name"]').val()
        };

        var id = Meta.string.$($form.select('input[name="id"]').val());
        if ( id.isInt() ) {
            params.id = id.toInt();
        }

        var keys = 'minute hour day_of_month month day_of_week'.split(' ');
        for ( var i = 0; i < keys.length; i++ ) {
            var val = $form.select('input[name="' + keys[i] + '"]').val();
            if (val !== null) {
                params[keys[i]] = val;
            }
        }

        return params;
    }
});
