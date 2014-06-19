vg.data.aggregate = function() {
  var value = vg.accessor("data"),
      as= null,
      fields = [],
      median = false,
      output = {
        "count":    "count",
        "min":      "min",
        "max":      "max",
        "sum":      "sum",
        "mean":     "mean",
        "variance": "variance",
        "stdev":    "stdev",
        "median":   "median"
      };
  
  function reduce(value, assign_to, data) {
    var min = +Infinity,
        max = -Infinity,
        sum = 0,
        mean = 0,
        M2 = 0,
        i, len, v, delta;

    var list = (vg.isArray(data) ? data : data.values || []).map(value);
    
    // compute aggregates
    for (i=0, len=list.length; i<len; ++i) {
      v = list[i];
      if (v < min) min = v;
      if (v > max) max = v;
      sum += v;
      delta = v - mean;
      mean = mean + delta / (i+1);
      M2 = M2 + delta * (v - mean);
    }
    M2 = M2 / (len - 1);
    
    var o = {};
    if( !!assign_to ) data[assign_to] = o;

    if (median) {
      list.sort(vg.numcmp);
      i = list.length >> 1;
      o[output.median] = list.length % 2
        ? list[i]
        : (list[i-1] + list[i])/2;
    }

    o[output.count] = len;
    o[output.min] = min;
    o[output.max] = max;
    o[output.sum] = sum;
    o[output.mean] = mean;
    o[output.variance] = M2;
    o[output.stdev] = Math.sqrt(M2);
    
    if( !! assign_to ) o = data; 
    return o;
  }
  
  function addStatsMeta( meta, key, as, type) {
    meta[key + '.sum']       = vg.meta.update(null, as, type);
    meta[key + '.count']     = vg.meta.update(null, as, 'number');
    meta[key + '.min']       = vg.meta.update(null, as, type);
    meta[key + '.max']       = vg.meta.update(null, as, type);
    meta[key + '.mean']      = vg.meta.update(null, as, type);
    meta[key + '.variance']  = vg.meta.update(null, as, 'number');
    meta[key + '.stdev']     = vg.meta.update(null, as, 'number');
    meta[key + '.median']    = vg.meta.update(null, as, 'number');
  }

  function stats(data, db, group, meta) {
    var i, as_key, value, ret, m, new_meta;
    
    if( vg.isArray(data) ) {
      new_meta = {};
      base = ''
    } else {
      base = 'values.[].';
      new_meta = vg.duplicate(meta);
    }

    ret = (vg.isArray(data) ? [data] : data.values || []).map(function (d) {
        var output = {};
        for( i=0; i<fields.length; i++ ) {
          value = vg.accessor(fields[i]);
          
          m = meta[base + fields[i]];
          as_key = (m && m.as) ? m.as : as[i] || fields[i].replace('.', '_'); 
          if( m ) type = m.type;

          if( vg.isArray(d) ) { 
            output[as[i]] = reduce(value, null, d);
            addStatsMeta(new_meta, as[i], as_key, type);
          } else {
            output = reduce(value, as[i], d); 
            addStatsMeta(new_meta, as[i], as_key, type);
          }
        }
        return output;
      });

    //meta = vg.meta.replace(meta, 'data.', 'values.[].')
    return { data: ret, meta: new_meta };
  }
  
  stats.median = function(bool) {
    median = bool || false;
    return stats;
  };
  
  stats.value = function(field) {
    value = vg.accessor(field);
    return stats;
  };
  
  stats.fields = function (keys) {
    fields  = keys;
    return stats;
  };

  stats.as = function (keys) {
    as = keys;
    return stats;
  }
  
  return stats;
};