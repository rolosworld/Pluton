site.users = {
    getUsers: function() {
        var users = site.data.users;
        if (!users) {
            users = site.data.users = {};
        }

        return users;
    },
    append: function(users) {
        var u = site.users.getUsers();
        for (var i = 0; i < users.length; i++) {
            site.users.set(users[i]);
        }
    },
    set: function(user) {
        var u = site.users.getUsers();
        u[user.id] = user;
    },
    get: function(id, cb) {
        if (id) {
            var u = site.users.getUsers();
            if (u[id]) {
                cb(u[id]);
                return;
            }
        }

        Meta.jsonrpc.push({
            method:'users.get',
            params:{
                id: id ? Meta.string.$(id).toInt() : id
            },
            callback:function(v){
                var err = v.error;
                if (err) {
                    site.log.errors(err);
                    return;
                }

                if (v.result) {
                    if (id) {
                        site.data.users[v.result.id] = v.result;
                    }
                    else {
                        site.data.user = v.result;
                    }
                    cb(v.result);
                }
            }
        }).execute();
    }
};
