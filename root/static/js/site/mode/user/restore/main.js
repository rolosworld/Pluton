site.mode.user.restore.methods = {};
site.mode.user.restore.methods.main = Meta( site.obj.method ).extend({
    drawUI: function() {
        site.doms.middle.append(site.mustache.render('restore', site.data));
    }
});
