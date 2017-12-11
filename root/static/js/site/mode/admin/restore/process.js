site.mode.admin.restore.methods.process = Meta( site.obj.method ).extend({
    drawUI: function() {
        site.mode.admin.restore.methods.main.drawUI();
    },
    postDrawUI: function() {
        var me = site.mode.admin.restore;
        var $form = Meta.dom.$().select('#restore-form');
        $form.on('submit', function(){
            var params = me.getDomData($form);
            var backup = params.backup;
            if (!backup) {
                return false;
            }

            Meta.jsonrpc.push({
                method:'admin.backup.restore',
                params:params,
                callback:function(v){
                    var err = v.error;
                    if (err) {
                        site.log.errors(err);
                        return false;
                    }

                    if (v.result) {
                        location.hash = '#mode=restore';
                        return true;
                    }

                    return false;
                }
            }).execute();
            return false;
        });

        // Folders loaders
        me.loadFolders();
        Meta.jsonrpc.execute();
    }
});
