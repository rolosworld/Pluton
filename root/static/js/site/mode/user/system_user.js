site.mode.user.system_user = Meta( site.mode.system_user ).extend({
    getDefaultMode: function() {
        return 'configuration';
    },
    getSiteData: function(cb) {
        site.data.params.user = site.data.user.system_user.id;

        this.$super('getSiteData', cb);
    }
});
