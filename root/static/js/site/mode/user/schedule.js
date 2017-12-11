site.mode.user.schedule = Meta( site.obj.mode ).extend({
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
            method:'user.schedule.list',
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
        // Prepare data for the request
        var s = Meta.string.$(),
            id = $form.select('input[name="id"]').val(),
            name = $form.select('input[name="name"]').val(),
            minute = $form.select('input[name="minute"]').val(),
            hour = $form.select('input[name="hour"]').val(),
            day_of_month = $form.select('input[name="day_of_month"]').val(),
            month = $form.select('select[name="month"]').val(),
            day_of_week = $form.select('select[name="day_of_week"]').val(),
            params = {name: name};

        if (s.set(id).hasInt()) {
            params.id = s.toInt();
        }

        if (s.set(minute).hasInt()) {
            params.minute = s.toInt();
        }

        if (s.set(hour).hasInt()) {
            params.hour = s.toInt();
        }

        if (s.set(day_of_month).hasInt()) {
            params.day_of_month = s.toInt();
        }

        if (s.set(month).hasInt()) {
            params.month = s.toInt();
        }

        if (s.set(day_of_week).hasInt()) {
            params.day_of_week = s.toInt();
        }

        return params;
    }
});
