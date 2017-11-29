site.mode.user.schedule = {
    params:{},
    getData: function(cb) {
        site.data.schedules = {};

        var method = this.params.method;
        site.data.schedules.method = {};
        if (method) {
            site.data.schedules.method[method] = 1;
        }
        site.data.schedules.method_name = method;

        this.getSchedules(function(result){
            site.data.schedules.names = result;
            cb(site.data);
        });
        Meta.jsonrpc.execute();
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
    init: function(params) {
        var me = site.mode.user.schedule;
        site.emptyDoms();
        me.params = params;

        site.mode.user.home.initLeft();
        site.log.init();

        me.getData(function() {
            me.initMiddle();

            var methods = me.methods;
            if (methods[params.method]) {
                methods[params.method](params);
            }

            site.showDoms();
        });

    },
    initMiddle: function() {
        site.doms.middle.append(site.mustache.render('schedule', site.data));
    },
    getParams: function($form) {
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
    },
    methods: {
        edit: function(params) {
            // Get form data
            var schedules = site.data.schedules.names, schedule;
            for (var i = 0; i < schedules.length; i++) {
                if (schedules[i].id == params.id) {
                    schedule = schedules[i];
                }
            }

            // Load form with the data
            var $container = Meta.dom.$().select('#schedule-form-container');
            $container.append(site.mustache.render('schedule-form', schedule));

            // Set the form callback
            var $form = Meta.dom.$().select('#schedule-form');
            $form.on('submit', function(){
                // Don't submit if the required fields aren't set
                var params = site.mode.user.schedule.getParams($form);
                var id = params['id'],
                    name = params.name;
                if (!id || !name) {
                    return false;
                }

                // Do the request
                Meta.jsonrpc.push({
                    method:'user.schedule.edit',
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
        },
        add: function() {
            var $form = Meta.dom.$().select('#schedule-form');
            $form.on('submit', function(){
                var params = site.mode.user.schedule.getParams($form);
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
        },
        list: function() {
            site.mode.user.schedule.getSchedules(function(result){
                site.data.schedules.names = v.result;
                site.switchMode('schedule');
            });
            Meta.jsonrpc.execute();
        }
    }
};
