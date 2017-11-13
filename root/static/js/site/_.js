if (!window['site']) {
    site = {};
}
site.$ = Meta.dom.$();
site.mode = {};
site.events = Meta(Meta.events).extend({
    events:{},
});
site.mergeData = function(data) {
    for(var key in data) {
        site.data[key] = data[key];
    }
};

site.parseHash = function(hash) {
    hash = hash.substr(1);
    var data = {};
    var parts = hash.split(';');
    for (var i = 0; i < parts.length; i++) {
        var key_val = parts[i].split('=');
        data[key_val[0]] = key_val[1];
    }
    return data;
};
