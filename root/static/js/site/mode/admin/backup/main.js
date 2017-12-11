site.mode.admin.backup.methods = {};
site.mode.admin.backup.methods.main = Meta( site.obj.method ).extend({
    drawUI: function() {
        site.doms.middle.append(site.mustache.render('backup', site.data));
    }
});
