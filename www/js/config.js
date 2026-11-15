/* TOM AI - shared configuration and safe storage. Loaded first. */
(function (g) {
  var mem = {};
  var store = {
    get: function (k, d) {
      try {
        var v = localStorage.getItem(k);
        if (v !== null) return v;
      } catch (e) {}
      return k in mem ? mem[k] : d;
    },
    set: function (k, v) {
      mem[k] = v;
      try { localStorage.setItem(k, v); } catch (e) {}
    }
  };

  g.TOM = {
    store: store,
    config: {
      appName: 'TOM AI',
      defaultLang: 'hi',
      languages: [
        { code: 'hi', short: 'हिं', name: 'हिन्दी', speech: 'hi-IN' },
        { code: 'mr', short: 'मरा', name: 'मराठी', speech: 'mr-IN' },
        { code: 'en', short: 'EN', name: 'English', speech: 'en-IN' }
      ],
      keys: {
        lang: 'tom-ai.lang',
        memories: 'tom-ai.memories.v1',
        voiceReplies: 'tom-ai.voiceReplies'
      },
      /* Photos of the real Tom. Put files in www/assets/tom/ and list them here,
         for example: ['assets/tom/tom-1.jpg', 'assets/tom/tom-2.jpg'] */
      realTomPhotos: []
    }
  };
})(window);
