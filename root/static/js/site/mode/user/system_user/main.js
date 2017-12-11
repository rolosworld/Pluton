site.mode.user.system_user.methods = {};
site.mode.user.system_user.methods.main = Meta( site.obj.method ).extend({
    drawUI: function() {
        site.doms.middle.inner(site.mustache.render('system_user', site.data));
    }
});
