site.logout = {
    init: function() {
        var $logout = site.$.select('.pluton-logout');
        $logout.off('click');
        $logout.on('click', function() {
            site.logout.run();
        });
    },
    run: function() {
        Meta.jsonrpc.push({
            method:'account.logout',
            callback:function(){
                delete site.data.user;
                site.init();
                site.switchMode('home');
                site.processHash();
                return true;
            }
        }).execute();
    }
};
