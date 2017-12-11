site.mode.admin.system_user.methods.add = Meta( site.obj.method ).extend({
    drawUI: function() {
        site.mode.admin.system_user.methods.main.drawUI();
        var $container = Meta.dom.$().select('#system_user-container');
        $container.inner(site.mustache.render('system_user-add-form'));
    },
    postDrawUI: function() {
        var $form = Meta.dom.$().select('#system_user-add-form');
        $form.on('submit', function(){
            var username = $form.select('input[name="username"]').val();
            var password = $form.select('input[name="password"]').val();
            if (!username) {
                return false;
            }

            Meta.jsonrpc.push({
                method:'admin.systemuser.add',
                params:{
                    username:username,
                    password:password
                },
                callback:function(v){
                    var err = v.error;
                    if (err) {
                        site.log.errors(err);
                        return false;
                    }

                    if (v.result) {
                        site.data.system_users.users = v.result;
                        location.hash = '#mode=system_user';
                        return true;
                    }

                    return false;
                }
            }).execute();
            return false;
        });
    }
});
