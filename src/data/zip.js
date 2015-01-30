vg.data.zip = function() {
  var z = null,
      kkey = null,
      as = "zip",
      key = vg.accessor("data"),
      defaultValue = undefined,
      withKey = null;

  function zip(data, db, group, meta, meta_db) {
    var v, d, i, len, map,
      zmeta = meta_db[z],
      zdata = db[z],
      zlen = zdata.length,
      newData = [],
      zipElem;
    if (withKey) {
      map = {};
      zdata.forEach(function(s) { map[withKey(s)] = s; });
    }
    
    for (i=0, len=data.length; i<len; ++i) {
        zipElem = map
            ? ((v=map[key(data[i])]) != null ? v : defaultValue)
        : zdata[i % zlen];
        if (zipElem) {
          data[i][as] = zipElem;
          newData.push(data[i]);
        } 
        else if(defaultValue) {
          data[i][as] = defaultValue;
          newData.push(data[i]);
        }
    }
  
    if(data.length === 0 && defaultValue) {
      newData.push(defaultValue);
    }
    
    //meta = vg.meta.extend(vg.duplicate( kkey ? zmeta[kkey] : zmeta ), as + ".", meta);
      meta = vg.meta.extend(vg.duplicate(zmeta), as  + ".", meta);

	  //meta[as] = vg.meta.updateTo(zmeta[kkey], meta[as]);
    return {data:newData,meta:meta};
  }

  zip["with"] = function(d) {
    z = d;
    return zip;
  };
  
  zip["default"] = function(d) {
    defaultValue = d;
    return zip;
  };

  zip.as = function(name) {
    as = name;
    return zip;
  };

  zip.key = function(k) {
    key = vg.accessor(k);
    kkey = k;
    return zip;
  };

  zip.withKey = function(k) {
    withKey = vg.accessor(k);
    return zip;
  };

  return zip;
};
