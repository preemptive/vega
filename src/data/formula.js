vg.data.formula = (function() {
  
  return function() {
    var field = null,
        as = null,
        data_type = undefined,
        expr = vg.identity;
  
    var formula = function(data, db, group, meta) {
      meta[field] = vg.meta.update(null,as || field, data_type);
      data.forEach(function(d, i, list) {
        if (field) d[field] = expr.call(null, d, i, list);
        return d;
      });

      return { data: data, meta: meta };
    };

    formula.field = function(d) {
      field = d;
      return formula;
    };

    formula.data_type = function(d) {
      data_type = d;
      return formula;
    };

    formula.as = function(d) {
      as = d;
      return formula;
    };
  
    formula.expr = function(func) {
      expr = vg.isFunction(func) ? func : vg.parse.expr(func);
      return formula;
    };

    return formula;
  };
})();