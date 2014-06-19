vg.data.transpose = function() {
  var by, as, value, kvalue;

  function transpose (data, db, group, meta) {
    var ret,
      array = (vg.isArray(data) ? data : data.values || []),
      new_meta = vg.duplicate(meta),
      type = meta[kvalue];

    ret = array.map(function (values) {
      var output = vg.isArray(values) ? {} : values,
      input = vg.isArray(values) ? values : values.values || [];

      input.reduce(function (transposed, d) {
        var key = by(d),
          path = key.replace(/\./g, '-');

        transposed[path] = value(d);
        
        if( !new_meta["transposed." + path] ) {
          new_meta["transposed." + path] = {
            as: as ? as(d) : key,
            type: type
          };
        }

        return transposed;
      }, output.transposed = {});

      return output;
    });

    return { data: ret, meta: new_meta };
  }

  transpose.by = function (field) {
    by = vg.accessor(field);
    return transpose;
  };

  transpose.as = function (field) {
    as = vg.accessor(field);
    return transpose;
  };

  transpose.value = function (field) {
    kvalue = field;
    value = vg.accessor(field);
    return transpose;
  }

  return transpose;
};