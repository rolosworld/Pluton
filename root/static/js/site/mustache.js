site.mustache = {
  // Process an specific dom with the given template
  update: function(args) {
    var key = args.template;
    var id = args.id;
    
    var $dom = Meta.dom.$().select('#' + id);
    var templates = site.data.templates;
    if (templates[key]) {
      $dom.inner( Mustache.render( templates[key], site.data, templates ) );
    }
  },

  render: function(template, data) {
    var templates = site.data.templates;
    return Mustache.render( templates[template], data || {}, templates );
  }
};
