site.init = function () {
    if (!site.data) {
        site.data = {};
    }
    site.data.templates = MUSTACHE_TEMPLATES;
    Meta.jsonrpc.url('/jsonrpcv2');
    site.getDoms();
    if (site.data.user) {
        site.websocket.init();
    }
};

site.getDoms = function() {
    site.doms = {
        left: site.$.select('div.pluton-left'),
        middle: site.$.select('div.pluton-middle_content'),
        console: site.$.select('pre.pluton-middle_console'),
        right: site.$.select('div.pluton-right'),
    };
};

site.emptyDoms = function() {
    var doms = site.doms;
    for (var $ in doms) {
        doms[$].empty();
    }
};

site.hideDoms = function() {
    var doms = site.doms;
    for (var $ in doms) {
        doms[$].hide();
    }
};

site.showDoms = function() {
    var doms = site.doms;
    for (var $ in doms) {
        doms[$].show();
    }
};

site.processHash = function(hash) {
    var data = site.data.params = site.parseHash(hash || location.hash);
    if (!site.data.user || !data.mode || !site.getMode(data.mode)) {
        data.mode = 'home';
    }

    site.getMode(data.mode).init( data );
    site.data.mode = data.mode;
    window.scrollTo(0, site.doms.middle.get(0).offsetTop);
};

site.switchMode = function(mode) {
    delete site.data.mode;
    site.processHash('#mode=' + mode);
};

site.getRole = function() {
    if (site.data.user && site.data.user.roles.admin) {
        return 'admin';
    }

    return 'user';
};

site.getMode = function(mode) {
    return site.mode[ site.getRole() ][mode];
};
