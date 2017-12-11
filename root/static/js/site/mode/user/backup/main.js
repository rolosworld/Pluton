site.mode.user.backup.methods = {};
site.mode.user.backup.methods.main = Meta( site.obj.method ).extend({
    drawUI: function() {
        site.doms.middle.append(site.mustache.render('backup', site.data));
    }
});
