/* TOM AI - voice layer.
 *
 * The app only talks to TOM.voice. Behind it sits an "engine":
 *   - android : the native Android speech recogniser and text-to-speech (inside the APK)
 *   - browser : the Web Speech API (Chrome on Android, when opened as a web page)
 * A later engine (a cloud speech-to-text or a custom TOM voice) only has to
 * implement the same five members and be passed to TOM.voice.useEngine().
 *
 * Engine shape:
 *   { name, canListen, canSpeak,
 *     listen({ lang, onStart, onResult(text, isFinal), onError(code), onEnd }),
 *     stop(), speak(text, lang), cancelSpeech() }
 * Error codes: 'not-allowed', 'no-speech', 'network', 'busy', 'error'.
 */
(function (g) {
  var TOM = g.TOM;

  /* ---------- Browser engine ---------- */
  var SR = g.SpeechRecognition || g.webkitSpeechRecognition;
  var rec = null;

  var browserEngine = {
    name: 'browser',
    canListen: !!SR,
    canSpeak: 'speechSynthesis' in g,
    listen: function (o) {
      try {
        rec = new SR();
        rec.lang = o.lang;
        rec.interimResults = true;
        rec.continuous = false;
        rec.maxAlternatives = 1;
        rec.onstart = function () { o.onStart && o.onStart(); };
        rec.onresult = function (e) {
          var text = '', fin = false;
          for (var i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
            if (e.results[i].isFinal) fin = true;
          }
          o.onResult && o.onResult(text, fin);
        };
        rec.onerror = function (e) {
          var c = e.error;
          if (c === 'not-allowed' || c === 'service-not-allowed') c = 'not-allowed';
          else if (c !== 'no-speech' && c !== 'network') c = 'error';
          o.onError && o.onError(c);
        };
        rec.onend = function () { o.onEnd && o.onEnd(); };
        rec.start();
      } catch (err) {
        o.onError && o.onError('error');
        o.onEnd && o.onEnd();
      }
    },
    stop: function () { try { rec && rec.stop(); } catch (e) {} },
    speak: function (text, lang) {
      try {
        g.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.pitch = 1.2;
        g.speechSynthesis.speak(u);
      } catch (e) {}
    },
    cancelSpeech: function () { try { g.speechSynthesis.cancel(); } catch (e) {} }
  };

  /* ---------- Android engine (bridge defined in MainActivity.java) ---------- */
  var handlers = null;

  var androidEngine = {
    name: 'android',
    canListen: false,
    canSpeak: true,
    listen: function (o) {
      handlers = o;
      g.TomAndroid.listen(o.lang);
    },
    stop: function () { try { g.TomAndroid.stopListening(); } catch (e) {} },
    speak: function (text, lang) { try { g.TomAndroid.speak(text, lang); } catch (e) {} },
    cancelSpeech: function () { try { g.TomAndroid.cancelSpeech(); } catch (e) {} }
  };

  var native = !!g.TomAndroid;
  if (native) {
    try { androidEngine.canListen = !!g.TomAndroid.isAvailable(); } catch (e) {}
  }

  /* Called by MainActivity through evaluateJavascript. */
  function onNative(type, payload) {
    var h = handlers;
    if (!h) return;
    if (type === 'start') h.onStart && h.onStart();
    else if (type === 'partial') h.onResult && h.onResult(payload, false);
    else if (type === 'final') h.onResult && h.onResult(payload, true);
    else if (type === 'error') h.onError && h.onError(payload);
    else if (type === 'end') { handlers = null; h.onEnd && h.onEnd(); }
  }

  var engine = native ? androidEngine : browserEngine;

  TOM.voice = {
    get supported() { return engine.canListen; },
    get ttsSupported() { return engine.canSpeak; },
    get engineName() { return engine.name; },
    listen: function (o) { engine.listen(o); },
    stop: function () { engine.stop(); },
    speak: function (text, lang) { engine.speak(text, lang); },
    cancelSpeech: function () { engine.cancelSpeech && engine.cancelSpeech(); },
    useEngine: function (e) { engine = e; },
    _onNative: onNative
  };
})(window);
