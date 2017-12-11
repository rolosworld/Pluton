site.mode.user.schedule.methods = {};
site.mode.user.schedule.methods.main = Meta( site.obj.method ).extend({
    drawUI: function() {
        site.doms.middle.append(site.mustache.render('schedule', site.data));
    }
});
