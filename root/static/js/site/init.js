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
        middle: site.$.select('div.pluton-middle'),
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
    var data = site.parseHash(hash || location.hash);
    if (!data.mode || !site.mode[data.mode]) {
        data.mode = 'home';
    }

    if (site.data.mode != data.mode) {
        site.mode[data.mode].init( data );
    }

    if (data.method) {
        if (site.mode[data.mode].methods &&
            site.mode[data.mode].methods[data.method]) {
            site.mode[data.mode].methods[data.method]( data );
        }
    }

    site.data.mode = data.mode;
};

site.switchMode = function(mode) {
    delete site.data.mode;
    site.processHash('#mode=' + mode);
};
