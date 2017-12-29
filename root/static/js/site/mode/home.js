site.mode.home = Meta( site.obj.mode ).extend({
    initLeft: function() {
        if (site.data.user) {
            site.doms.left.append(site.mustache.render('menu', site.data));
            site.logout.init();

        }
        else {
            site.login.init();
        }
    }
});
