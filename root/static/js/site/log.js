site.log = {
    init: function() {
        site.doms.right.inner(site.mustache.render('log',{}));
        site.log.$dom = Meta.dom.$().select('#content-log');
    },
    errors: function(errors) {
        var msg = [];
        var log = site.log.$dom;
        Meta.array.$(errors).forEach(function(v){
            log.prepend(site.mustache.render('error',v));
        });
    },
    clear: function() {
        site.log.$dom.inner('');
    }
};

