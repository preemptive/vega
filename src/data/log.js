vg.data.log = function() {
  var log_meta = false;
  var label;

  var log = function(data, db, group, meta) {
  	  if( !console || !console.log ) return { data: data, meta: meta };
      if( label ) console.log(label);
      
      console.log(data);
      if( log_meta ) console.log(meta);
      return { data: data, meta: meta };
    };
  
  log.meta = function(bool) {
    log_meta = bool;
    return log;
  };

  log.label = function(str) {
    label = str;
    return log;
  };

  return log;
};
