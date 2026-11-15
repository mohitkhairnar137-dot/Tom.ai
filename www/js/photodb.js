/* TOM AI - personal photos stored in IndexedDB (not localStorage), so they survive
   app restarts and can be large. Every call returns a Promise.
   A record: { id, title, desc, createdAt, mime, w, h, blob } */
(function (g) {
  var TOM = g.TOM;
  var C = TOM.config.gallery;
  var STORE = 'photos';
  var opening = null;

  function open() {
    if (opening) return opening;
    opening = new Promise(function (resolve, reject) {
      if (!g.indexedDB) { reject(new Error('indexeddb-missing')); return; }
      var req;
      try { req = g.indexedDB.open(C.dbName, C.dbVersion); } catch (e) { reject(e); return; }
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' }).createIndex('createdAt', 'createdAt');
        }
      };
      req.onsuccess = function () {
        var db = req.result;
        db.onversionchange = function () { db.close(); opening = null; };
        resolve(db);
      };
      req.onerror = function () { reject(req.error || new Error('indexeddb-open-failed')); };
      req.onblocked = function () { reject(new Error('indexeddb-blocked')); };
    });
    opening.catch(function () { opening = null; });
    return opening;
  }

  /* Runs fn(store) in one transaction; resolves with the request's result once the
     transaction has really committed (so a "saved" message is never premature). */
  function run(mode, fn) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx, request;
        try {
          tx = db.transaction(STORE, mode);
          request = fn(tx.objectStore(STORE));
        } catch (e) { reject(e); return; }
        tx.oncomplete = function () { resolve(request ? request.result : undefined); };
        tx.onerror = function () { reject(tx.error || (request && request.error)); };
        tx.onabort = function () { reject(tx.error || new Error('transaction-aborted')); };
      });
    });
  }

  function newId() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  TOM.photoDb = {
    /* Resolves true when the database can be opened on this device. */
    ready: function () { return open().then(function () { return true; }, function () { return false; }); },
    /* Newest first. */
    list: function () {
      return run('readonly', function (s) { return s.getAll(); }).then(function (all) {
        return (all || []).sort(function (a, b) { return b.createdAt - a.createdAt; });
      });
    },
    add: function (rec) {
      var item = {
        id: newId(),
        title: String(rec.title || '').trim().slice(0, C.maxTitle),
        desc: String(rec.desc || '').trim().slice(0, C.maxDesc),
        createdAt: Date.now(),
        mime: rec.blob.type || 'image/jpeg',
        w: rec.w || 0,
        h: rec.h || 0,
        blob: rec.blob
      };
      return run('readwrite', function (s) { return s.add(item); }).then(function () { return item; });
    },
    remove: function (id) {
      return run('readwrite', function (s) { return s.delete(id); });
    }
  };
})(window);
