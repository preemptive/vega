vg.meta = {};
vg.meta.ingest = function (meta) {
  return vg.meta.extend(meta, 'data.', { index : { as: 'index', type: 'number'} });
};

vg.meta.extend = function (meta, extend, base) {
  return vg.keys(meta).reduce(function (d,k) {
    return (d[extend + k] = meta[k], d);
  }, base ? base : {});
};

vg.meta.replace = function (meta, match, replace, base) {
  return vg.keys(meta).reduce(function (d,k) {
    return (d[k.replace(match, replace)] = meta[k], d);
  }, base ? base : {});
};

vg.meta.update = function (meta, as, type) {
  meta = meta ? meta : {};
  if( as ) meta.as = as;
  if( type ) meta.type = type;
  return meta;
};

vg.meta.updateTo = function (meta, new_meta, as, type) {
  new_meta = new_meta ? new_meta : {};
  if( as || (meta && meta.as ) ) new_meta.as = as || meta.as;
  if( type || (meta && meta.type ) ) new_meta.type = type || meta.type;
  return new_meta;
};


vg.data = {};

vg.data.ingestAll = function(data) {
  return vg.isTree(data)
    ? vg_make_tree(vg.data.ingestTree(data[0], data.children))
    : data.map(vg.data.ingest);
};

vg.data.ingest = function(datum, index) {
  return {
    data: datum,
    index: index
  };
};

vg.data.ingestTree = function(node, children, index) {
  var d = vg.data.ingest(node, index || 0),
      c = node[children], n, i;
  if (c && (n = c.length)) {
    d.values = Array(n);
    for (i=0; i<n; ++i) {
      d.values[i] = vg.data.ingestTree(c[i], children, i);
    }
  }
  return d;
};

function vg_make_tree(d) {
  d.__vgtree__ = true;
  d.nodes = function() { return vg_tree_nodes(this, []); };
  return d;
}

function vg_tree_nodes(root, nodes) {
  var c = root.values,
      n = c ? c.length : 0, i;
  nodes.push(root);
  for (i=0; i<n; ++i) { vg_tree_nodes(c[i], nodes); }
  return nodes;
}

function vg_data_duplicate(d) {
  var x=d, i, n;
  if (vg.isArray(d)) {
    x = [];
    for (i=0, n=d.length; i<n; ++i) {
      x.push(vg_data_duplicate(d[i]));
    }
  } else if (vg.isObject(d)) {
    x = {};
    for (i in d) {
      x[i] = vg_data_duplicate(d[i]);
    }
  }
  return x;
}

vg.data.mapper = function(func) {
  return function(data) {
    data.forEach(func);
    return data;
  }
};

vg.data.size = function(size, group) {
  size = vg.isArray(size) ? size : [0, size];
  size = size.map(function(d) {
    return (typeof d === 'string') ? group[d] : d;
  });
  return size;
};