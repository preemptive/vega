vg.parse.dataflow = function(def) {
  var tx = (def.transform || []).map(vg.parse.transform),
      df = tx.length
        ? function(data, db, group, meta, meta_db) {
       		var new_meta = meta; 
        	var data = tx.reduce(function(d,t) { 
        		var ret = t(d,db,group, new_meta, meta_db);
        		if( ret.meta ) {
        			new_meta = ret.meta;
        			return ret.data;
        		}
        		else {
        			return ret;
        		}
        	}, data);

        	if( new_meta ) return { data: data, meta: new_meta };
        	else return data;
       	}
        : vg.identity;
  df.transforms = tx;
  return df;
};