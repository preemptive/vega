vg.data.transpose = function() {
  var by, as, value;

  function transpose (data, db) {
    var keys = {}, ret, array = (vg.isArray(data) ? data : data.values || []);

    ret = array.map(function (values) {
      var output = vg.isArray(values) ? {} : values,
      input = vg.isArray(values) ? values : values.values || [];

      input.reduce(function (transposed, d) {
        var key = by(d), path = 'transposed>>' + key;
        transposed[key] = value(d);
        
        if( !keys[path] ) {
          keys[path] = {
            as: as(d)
          };
        }

        return transposed;
      }, output.transposed = {});
      db.meta = keys;
      return output;
    });

    return ret;
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
    value = vg.accessor(field);
    return value;
  }

  return transpose;
};