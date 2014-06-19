vg.parse.data = function(spec, callback) {
  var model = {
    defs: spec,
    load: {},
    flow: {},
    source: {}
  };

  var count = 0;
  var i;
  
  function load(d) {
    return function(error, data) {
      if (error) {
        vg.error("LOADING FAILED: " + d.url);
      } else {
        model.load[d.name] = vg.data.read(data.toString(), d.format);
      }
      if (--count === 0) callback();
    }
  }

  (spec || []).forEach(function(d) {
    if (d.url) {
      count += 1;
      vg.data.load(d.url, load(d)); 
    }
     
    if (d.values) {
      if (d.format && d.format.parse) {
        // run specified value parsers
        vg.data.read.parse(d.values, d.format.parse);
      }
      model.load[d.name] = d.values;
    }
    
    // source -> add zip inputs here.
    // check if a zip transform is used
    
    var dependencies = [];
    if (d.source) {
      dependencies.push(d.source);
    }
    if( vg.isArray(d.transform) ) {
      for(i=0; i<d.transform.length; i++) {
        if( d.transform[i].type === "zip" ) {
          if( dependencies.length === 0 ) dependencies.push("");
          dependencies.push(d.transform[i].with);
        }
      }
    }
    dependencies = vg.unique(dependencies, undefined, []);
    if( dependencies.length > 0) {
      dependencies = dependencies.join("|");
      list = model.source[dependencies] || (model.source[dependencies] = []);
      list.push(d.name);
    }

    if (d.transform) {
      model.flow[d.name] = vg.parse.dataflow(d);
    }
  });
  
  if (count === 0) setTimeout(callback, 1);
  return model;
};