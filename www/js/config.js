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
      /* Photos of the real Tom, shown in Memories > Tom, in this order.
         Each entry: src (file in www/assets/tom/), date (YYYY-MM-DD, or '' if unknown),
         a caption in each language, and optionally wide:true (landscape photo, shown
         full width) or pos:'50% 40%' (which part of a tall photo the grid thumbnail shows).
         A plain string such as 'assets/tom/tom-10.jpg' also works (no caption). Dates are the ones printed on the photos. Photos 01-06
         were all taken on the same day, so their order within that day is only a
         choice; photos 07-09 carry no date. */
      realTomPhotos: [
        { src: 'assets/tom/tom-01.jpg', date: '2026-02-25',
          caption: { hi: 'वो प्यारी आँखें', mr: 'ते गोड डोळे', en: 'Those gentle eyes' } },
        { src: 'assets/tom/tom-02.jpg', date: '2026-02-25',
          caption: { hi: 'गर्म हथेली में आराम', mr: 'उबदार तळहातात विसावा', en: 'Resting in a warm hand' } },
        { src: 'assets/tom/tom-03.jpg', date: '2026-02-25',
          caption: { hi: 'हल्की-सी प्यार भरी छुअन', mr: 'हळुवार प्रेमळ स्पर्श', en: 'A soft nuzzle' } },
        { src: 'assets/tom/tom-04.jpg', date: '2026-02-25',
          caption: { hi: 'नींद में, शांत', mr: 'झोपेत, शांत', en: 'Sleepy and calm' } },
        { src: 'assets/tom/tom-05.jpg', date: '2026-02-25',
          caption: { hi: 'कंकड़ों पर एक शांत पल', mr: 'खडीवर एक शांत क्षण', en: 'A quiet moment on the gravel' } },
        { src: 'assets/tom/tom-06.jpg', date: '2026-02-25',
          caption: { hi: 'पत्थर के पास आराम', mr: 'दगडाजवळ विसावा', en: 'Resting by the rock' } },
        { src: 'assets/tom/tom-07.jpg', date: '', pos: '50% 60%',
          caption: { hi: 'बोरी पर झपकी का वक़्त', mr: 'गोणपाटावर डुलकीची वेळ', en: 'Nap time on the sack' } },
        { src: 'assets/tom/tom-08.jpg', date: '', pos: '50% 40%',
          caption: { hi: 'गले लगने का वक़्त', mr: 'मिठी मारण्याची वेळ', en: 'Cuddle time' } },
        { src: 'assets/tom/tom-09.jpg', date: '', wide: true,
          caption: { hi: 'साथ-साथ', mr: 'एकत्र', en: 'Together' } }
      ],

      /* Personal photo gallery (Memories > My photos), kept in IndexedDB on the phone. */
      gallery: {
        dbName: 'tom-ai-gallery',
        dbVersion: 1,
        maxEdge: 1920,      /* longest side in pixels; bigger photos are scaled down to save space */
        quality: 0.88,      /* JPEG quality used when a photo is scaled down */
        maxTitle: 80,
        maxDesc: 1000
      }
    }
  };
})(window);
