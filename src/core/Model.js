vg.Model = (function() {
  function model() {
    this._defs = null;
    this._meta = {};
    this._data = {};
    this._scene = null;
    this._reset = {axes: false, legends: false};
  }

  var prototype = model.prototype;

  prototype.defs = function(defs) {
    if (!arguments.length) return this._defs;
    this._defs = defs;
    return this;
  };

  prototype.meta = function(meta) {
    if (!arguments.length) return this._meta;
    this._meta = vg.duplicate(meta);
    return this;
  };

  prototype.data = function(data) {
    if (!arguments.length) return this._data;

    var tx = this._defs.data.flow || {},
        keys = this._defs.data.defs.map(vg.accessor("name")),
        len = keys.length, i, k;

    for (i=0; i<len; ++i) {
      if (!data[k=keys[i]]) continue;
      this._meta[k] = this._meta[k] ? this._meta[k] : {};
      this.ingest(k, tx, data[k], this._meta[k]);
    }

    this._reset.legends = true;
    return this;
  };

  prototype.ingest = function(name, tx, input, meta) {
    var ret = tx[name] ? tx[name](input, this._data, this._defs.marks, meta, this._meta) : input;
    this._data[name] = ret.data ? ret.data : ret;
    if( ret.meta ) this._meta[name] = ret.meta;
    this.dependencies(name, tx);
  };
  
  prototype.dependencies = function(name, tx) {
    var sources = this._defs.data.source, source,
       i, x, k, k2, data, meta, n, flag;

    for( k in sources ) {
      if( sources.hasOwnProperty(k) ) {
        // single source
        if( k === name ) {
          source = sources[k];
          n = source ? source.length : 0;
          data = this._data[k];
          meta = this._meta[k]; 
          for (i=0; i<n; ++i) {
            x = vg_data_duplicate(data);
            if (vg.isTree(data)) vg_make_tree(x);
            this.ingest(source[i], tx, x, meta);
          }
        } 
        // multiple dependencies required (due to 'zip' tx)
        else if ( k.indexOf(name) !== -1 ) {
          flag = true;
          
          // get the dependency names (and number of).
          n = (k2 = k.split('|')) ? k2.length : 0; 
          
          // check whether the dependencies are available
          for(i=0; i<n; ++i) {
            if( k2[i] === "" ) flag = false; // case of 'zip' tx but not 'source'. Make sure data that uses the zip comes after zips included data.
            if( !this._data[k2[i]] ) flag = false; // if any of the data required is not present, set flag to false and do not do transformation yet.
          }
          if( !flag ) continue;
          
          // process data
          data = this._data[k2[0]]; 
          meta = this._meta[k2[0]];
          source = sources[k];
          n = source ? source.length : 0;
          for (i=0; i<n; ++i) {
            x = vg_data_duplicate(data);
            if (vg.isTree(data)) vg_make_tree(x);
            this.ingest(source[i], tx, x, meta);
          }
        } 
      }
    }
  };

  prototype.width = function(width) {
    if (this._defs) this._defs.width = width;
    if (this._defs && this._defs.marks) this._defs.marks.width = width;
    if (this._scene) this._scene.items[0].width = width;
    this._reset.axes = true;
    return this;
  };

  prototype.height = function(height) {
    if (this._defs) this._defs.height = height;
    if (this._defs && this._defs.marks) this._defs.marks.height = height;
    if (this._scene) this._scene.items[0].height = height;
    this._reset.axes = true;
    return this;
  };

  prototype.scene = function(node) {
    if (!arguments.length) return this._scene;
    this._scene = node;
    return this;
  };

  prototype.build = function() {
    var m = this, data = m._data, marks = m._defs.marks;
    m._scene = vg.scene.build.call(m, marks, data, m._scene);
    m._scene.items[0].width = marks.width;
    m._scene.items[0].height = marks.height;
    m._scene.interactive = false;
    return this;
  };

  prototype.encode = function(trans, request, item) {
    this.reset();
    var m = this, scene = m._scene, defs = m._defs;
    vg.scene.encode.call(m, scene, defs.marks, trans, request, item);
    return this;
  };

  prototype.reset = function() {
    if (this._scene && this._reset.axes) {
      vg.scene.visit(this._scene, function(item) {
        if (item.axes) item.axes.forEach(function(axis) { axis.reset(); });
      });
      this._reset.axes = false;
    }
    if (this._scene && this._reset.legends) {
      vg.scene.visit(this._scene, function(item) {
        if (item.legends) item.legends.forEach(function(l) { l.reset(); });
      });
      this._reset.legends = false;
    }
    return this;
  };

  return model;
})();