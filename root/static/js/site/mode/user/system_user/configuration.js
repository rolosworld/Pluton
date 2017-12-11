site.mode.user.system_user.methods.configuration = Meta( site.obj.method ).extend({
    drawUI: function() {
        site.mode.user.system_user.methods.main.drawUI();
        var $container = Meta.dom.$().select('#system_user-container');
        $container.inner(site.mustache.render('system_user-configuration-list', site.data));
    }
});
