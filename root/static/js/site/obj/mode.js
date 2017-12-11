site.obj.mode = Meta({
    getDefaultMode: function() {
        return 'main';
    },
    init: function() {
        var me = this;
        me.resetUI();
        me.initBasicUI();
        me.getSiteData(function() {
            var methods = me.methods,
                method = site.data.params.method || me.getDefaultMode();

            if (methods[method]) {
                methods[method].process();
            }

            site.showDoms();
        });
    },
    resetUI: function() {
        var me = this;
        site.emptyDoms();
    },
    initBasicUI: function() {
        site.mode.admin.home.initLeft();
        site.log.init();
    },
    getSiteData: function() {},
    getDomData: function() {}
});
