(function () {
    site.init();

    // Handle mode changes when the URL hash changes
    Meta.dom.$(window).on('hashchange', function(){site.processHash();});

    site.processHash();
})();
