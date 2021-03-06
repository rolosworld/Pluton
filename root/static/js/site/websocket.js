site.websocket = Meta(Meta.websocket).extend({
    init: function() {
        site.websocket.reconnect();
    },
    log: function(event) {
        event = {
            type: event && event.type ? event.type : '',
            data: event && event.data ? event.data : '',
        };
        console.log('site.websocket[' + event.type + ']: ' + event.data);
        if (event.type == 'error' || event.type == 'close') {
            location.href = '/';
        }
    },
    reconnect: function() {
        var me = this;
        var ws = site.websocket.get();
        if (!ws || ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING) {
            me.set();
            var protocol = location.protocol == 'http:' ? 'ws' : 'wss';
            me.connect(protocol + '://' + window.location.host + '/ws');
        }
    }
});

site.websocket.on('connect',function(){
    var me = this;
    me.log( {type:'connected', data:''} );
    me.on('open', site.websocket.log).
        on('message', site.websocket.log).
        on('error', site.websocket.log).
        on('close', site.websocket.log).
        on('send', site.websocket.log)
    ;

    me.on('open',function(){
        Meta.jsonrpc.send = site.websocket.jsonrpc.ourSend;
    });

    me.on('message', function(event){
        me.fire('json', JSON.parse(event.data));
    });
});

site.websocket.jsonrpc = {
    theirSend: Meta.jsonrpc.send,
    id_counter: 0,
    callbacks: {},
    ourSend: function(data, callback) {
        var me = site.websocket;
        var ws = me.get();
        if (!ws || ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING) {
            Meta.jsonrpc.send = me.jsonrpc.theirSend;
            return Meta.jsonrpc.send(data, callback);
        }
        var json = JSON.stringify(data);
        console.log('site.websocket[sent]: ' + json);
        me.jsonrpc.callbacks[me.jsonrpc.id_counter] = callback;
        me.send({
            type: 'JSONRPCv2',
            id: me.jsonrpc.id_counter++,
            data: json
        });
    }
};

Meta.jsonrpc.on('send', function() {
    if (site.data.user) {
        site.websocket.init();
    }
});

Meta.jsonrpc.on('account.login:TRUE', function() {
    if (site.data.user) {
        site.websocket.init();
    }
});

Meta.jsonrpc.on('account.logout:TRUE', function() {
    if (!site.data.user) {
        site.websocket.close();
    }
});

site.websocket.on('json', function(json){
    if (json.type == 'JSONRPCv2') {
        var me = site.websocket.jsonrpc;
        if ('id' in json && me.callbacks[json.id]) {
            var data = json.data;
            if (data) {
                data = JSON.parse(data);
            }
            me.callbacks[json.id]({
                json: function() {
                    return data;
                }
            });
            delete me.callbacks[json.id];
        }
    } else if (json.type == 'command-stdout') {
        //site.doms.console.text(site.doms.console.text()+json.data.content);
    } else if (json.type == 'google-key') {
        if (json.data.content.search('code') > -1) {
            site.$.select('#get_google_key_code').inner(json.data.content + ' <a href="https://www.google.com/device" target="_blank">Go to google.com/devices</a>');
        }
        else {
            if (json.data.content.search('Success') > -1) {
                site.$.select('#get_google_key_code').inner('');
                var parts = json.data.content.split(' ');
                site.$.select('#get_google_key_token').val(Meta.string.$(parts[parts.length - 1]).trim().get());
            }
        }
    } else if (json.type == 'system') {
        console.log('SYSTEM: ' + json.data);
    }
});
