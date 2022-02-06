// Forcing IndexedDB here.
  localforage.setDriver(localforage.INDEXEDDB).then(function() {
    var key = 'STORE_KEY';
    var value = new Uint8Array(8);
    value[0] = 65
    var UNKNOWN_KEY = 'unknown_key';

    localforage.setItem(key, value, function() {
      console.log('Saved: ' + value);

      // causes InvalidState erros
      localforage._dbInfo.db.close();

      localforage.getItem(key).then(function(readValue) {
        console.log('Read: ', readValue);
      }).catch(function(err) {
        console.error('Read: ', err);
      });

      // Since this key hasn't been set yet, we'll get a null value
      localforage.getItem(UNKNOWN_KEY).then(function(err, readValue) {
        console.log('Result of reading ' + UNKNOWN_KEY, readValue);
      });
    });
  });

/*
billboardsDAO keys:

billboards_count (=> uint) number of billboards in database syncronized

1 
2
3 
... (=> billboard hash)

-------------------

lat;long 



*/

