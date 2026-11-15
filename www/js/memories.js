/* TOM AI - stories about the real Tom, saved on the device. */
(function (g) {
  var TOM = g.TOM;
  var KEY = TOM.config.keys.memories;

  function load() {
    try {
      var raw = TOM.store.get(KEY, '[]');
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function save(list) {
    TOM.store.set(KEY, JSON.stringify(list));
  }

  TOM.memories = {
    /* Newest first. */
    list: function () {
      return load().sort(function (a, b) { return b.createdAt - a.createdAt; });
    },
    add: function (entry) {
      var list = load();
      var item = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        title: (entry.title || '').trim(),
        when: (entry.when || '').trim(),
        text: (entry.text || '').trim(),
        createdAt: Date.now()
      };
      list.push(item);
      save(list);
      return item;
    },
    remove: function (id) {
      save(load().filter(function (m) { return m.id !== id; }));
    }
  };
})(window);
