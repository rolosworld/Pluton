site.login = {
  init: function() {
      site.doms.middle.inner(site.mustache.render('login',{}));

      var $form = Meta.dom.$().select('#login-form');
      $form.on('submit', function(){
          var username = $form.select('input[name="email"]').val();
          var password = $form.select('input[name="password"]').val();
          if (!username) {
              return false;
          }

          Meta.jsonrpc.push({
              method:'account.login',
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

                  // Since it's a new login we want to reset all data
                  if (v.result && v.result['id']) {
                      site.data.user = v.result;
                      site.init();
                      site.switchMode('home');
                      return true;
                  }

                  return false;
              }
          }).execute();
          return false;
      });
  }
};
