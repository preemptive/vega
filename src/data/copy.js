vg.data.copy = function() {
  var from = vg.accessor("data"),
      fkey = '',
      fields = [],
      as = null;
  
  var copy = function(data, db, group, meta) {
      fields.forEach(function (f, i) {
        var o = meta[fkey + "." + f];
        if( !o ) return;
        meta[( as[i] || f)] = o;
      });

      data.forEach(function(d) {
        var src = from(d), i, len,
            source = fields,
            target = as || fields;

        for (i=0, len=fields.length; i<len; ++i) {
          d[target[i]] = src[fields[i]];
        }

        return d;
      });

      return { data: data, meta: meta };
    };


  copy.from = function(field) {
    from = vg.accessor(field);
    fkey = field;
    return copy;
  };
  
  copy.fields = function(fieldList) {
    fields = vg.array(fieldList);
    return copy;
  };
  
  copy.as = function(fieldList) {
    as = vg.array(fieldList);
    return copy;
  };

  return copy;
};
