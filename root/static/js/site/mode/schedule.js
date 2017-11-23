site.mode.schedule = {
    init: function(params) {
        site.emptyDoms();

        // Force initialization of data
        if (!site.data.schedules) {
            site.data.schedules = {};
            site.mode.schedule.methods.list();
            location.hash = '#mode=schedule';
            return;
        }

        var method = params.method;
        site.data.schedules.method = {};
        if (method) {
            site.data.schedules.method[method] = 1;
        }
        site.data.schedules.method_name = method;

        site.mode.home.initLeft();
        site.log.init();
        site.mode.schedule.initMiddle(params);
        site.mode.schedule.processMethod(method, params);
        site.showDoms();
    },
    initMiddle: function(params) {
        site.doms.middle.append(site.mustache.render('schedule', site.data));
    },
    methods: {
        edit: function(params) {
            var schedules = site.data.schedules.names, schedule;
            for (var i = 0; i < schedules.length; i++) {
                if (schedules[i].id == params.id) {
                    schedule = schedules[i];
                }
            }

            var $container = Meta.dom.$().select('#schedule-form-container');
            $container.append(site.mustache.render('schedule-form', schedule));

            var $form = Meta.dom.$().select('#schedule-form');
            $form.on('submit', function(){
                var id = $form.select('input[name="id"]').val(),
                    name = $form.select('input[name="name"]').val();
                if (!id) {
                    return false;
                }

                var s = Meta.string.$(),
                    minute = $form.select('input[name="minute"]').val(),
                    hour = $form.select('input[name="hour"]').val(),
                    day_of_month = $form.select('input[name="day_of_month"]').val(),
                    month = $form.select('select[name="month"]').val(),
                    day_of_week = $form.select('select[name="day_of_week"]').val(),
                    params = {name: name, id: s.set(id).toInt()};

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

                Meta.jsonrpc.push({
                    method:'schedule.edit',
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
        add: function() {
            var $form = Meta.dom.$().select('#schedule-form');
            $form.on('submit', function(){
                var name = $form.select('input[name="name"]').val();
                if (!name) {
                    return false;
                }

                var s = Meta.string.$(),
                    minute = $form.select('input[name="minute"]').val(),
                    hour = $form.select('input[name="hour"]').val(),
                    day_of_month = $form.select('input[name="day_of_month"]').val(),
                    month = $form.select('select[name="month"]').val(),
                    day_of_week = $form.select('select[name="day_of_week"]').val(),
                    params = {name: name};

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

                Meta.jsonrpc.push({
                    method:'schedule.add',
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
            Meta.jsonrpc.push({
                method:'schedule.list',
                params:{},
                callback:function(v){
                    var err = v.error;
                    if (err) {
                        site.log.errors(err);
                        return false;
                    }

                    if (v.result) {
                        site.data.schedules.names = v.result;
                        site.switchMode('schedule');
                        return true;
                    }

                    return false;
                }
            }).execute();
        }
    },
    processMethod: function(method, params) {
        var methods = site.mode.schedule.methods;
        if (methods[method]) {
            methods[method](params);
        }
    }
};
