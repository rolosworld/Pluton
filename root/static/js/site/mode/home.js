site.mode.home = {
    init: function() {
        site.emptyDoms();

        site.mode.home.initLeft();
        site.log.init();
        site.showDoms();
    },
    initLeft: function() {
        if (site.data.user) {
            site.doms.left.append(site.mustache.render('menu'));
            site.logout.init();

        }
        else {
            site.login.init();
        }
    }
};
