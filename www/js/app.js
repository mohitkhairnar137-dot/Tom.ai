/* TOM AI - screens, navigation and wiring. */
(function (g) {
  var TOM = g.TOM, cfg = TOM.config, store = TOM.store;
  var I = TOM.i18n, D = TOM.dog, M = TOM.memories, B = TOM.brain, V = TOM.voice;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var ROUTES = ['home', 'chat', 'memories'];
  var MOODS = ['happy', 'excited', 'sleepy', 'curious', 'sad'];
  var lang = cfg.defaultLang;
  var listening = false;
  var busy = false;
  var speakReplies = store.get(cfg.keys.voiceReplies, '0') === '1';
  var chatStarted = false;
  var history = [];
  var route = 'home';
  var toastTimer = null;
  var bubbleTimer = null;
  var typingEl = null;

  /* ---------- helpers ---------- */
  function speechLang() {
    for (var i = 0; i < cfg.languages.length; i++) if (cfg.languages[i].code === lang) return cfg.languages[i].speech;
    return 'en-IN';
  }

  function dayPart() {
    var h = new Date().getHours();
    if (h >= 5 && h < 12) return 'morning';
    if (h >= 12 && h < 17) return 'afternoon';
    if (h >= 17 && h < 21) return 'evening';
    return 'night';
  }

  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2800);
  }

  function setBubble(text, revertMs) {
    $('#homeBubble').textContent = text;
    clearTimeout(bubbleTimer);
    if (revertMs) bubbleTimer = setTimeout(function () { $('#homeBubble').textContent = I.t('greet.' + dayPart()); }, revertMs);
  }

  /* ---------- language ---------- */
  function renderLangs() {
    var box = $('#langs');
    box.textContent = '';
    cfg.languages.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(l.code === lang));
      b.setAttribute('lang', l.code);
      b.setAttribute('aria-label', l.name);
      b.textContent = l.short;
      b.addEventListener('click', function () { setLang(l.code); });
      box.appendChild(b);
    });
  }

  function renderMoods() {
    var box = $('#moods');
    box.textContent = '';
    MOODS.forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = I.t('mood.' + m);
      b.addEventListener('click', function () {
        D.setMood(m, 5000);
        setBubble(I.t('say.' + m), 6000);
      });
      box.appendChild(b);
    });
  }

  function renderChips() {
    var box = $('#chips');
    box.textContent = '';
    [1, 2, 3, 4].forEach(function (n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = I.t('chips.' + n);
      b.addEventListener('click', function () { send(b.textContent); });
      box.appendChild(b);
    });
  }

  function updateStatus() {
    var key = busy ? 'chat.thinking' : listening ? 'chat.listening' : 'chat.idle';
    $('#chatStatus').textContent = I.t(key);
    var mic = $('#micBtn');
    mic.setAttribute('aria-label', I.t(listening ? 'chat.micStop' : 'chat.mic'));
  }

  function setLang(code) {
    lang = code;
    store.set(cfg.keys.lang, code);
    I.setLang(code);
    I.apply(document);
    renderLangs();
    renderMoods();
    renderChips();
    renderMemories();
    renderPhotos();
    D.setLabel(I.t('dog.alt'));
    $('#dogHome').setAttribute('aria-label', I.t('home.hint'));
    setBubble(I.t('greet.' + dayPart()));
    updateStatus();
  }

  /* ---------- navigation ---------- */
  function show(name) {
    if (ROUTES.indexOf(name) === -1) name = 'home';
    if (route === 'chat' && name !== 'chat' && listening) V.stop();
    route = name;
    $$('.screen').forEach(function (s) { s.hidden = s.getAttribute('data-route') !== name; });
    $$('.nav a').forEach(function (a) {
      if (a.getAttribute('data-route') === name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (name === 'chat') {
      ensureWelcome();
      scrollMessages();
    }
  }

  function go(name) {
    if (location.hash !== '#' + name) location.hash = name;
    show(name);
  }

  function onHash() { show(location.hash.replace('#', '') || 'home'); }

  /* ---------- chat ---------- */
  function scrollMessages() {
    var m = $('#messages');
    m.scrollTop = m.scrollHeight;
  }

  function addMessage(role, text) {
    var row = document.createElement('div');
    row.className = 'msg msg-' + role;
    var b = document.createElement('div');
    b.className = 'b';
    b.textContent = text;
    row.appendChild(b);
    $('#messages').appendChild(row);
    scrollMessages();
    return row;
  }

  function showTyping() {
    typingEl = document.createElement('div');
    typingEl.className = 'msg msg-tom';
    typingEl.innerHTML = '<div class="b typing" aria-hidden="true"><i></i><i></i><i></i></div>';
    $('#messages').appendChild(typingEl);
    scrollMessages();
  }

  function hideTyping() {
    if (typingEl) { typingEl.remove(); typingEl = null; }
  }

  function ensureWelcome() {
    if (chatStarted) return;
    chatStarted = true;
    addMessage('tom', I.t('greet.' + dayPart()));
  }

  function send(raw) {
    var text = (raw || '').trim();
    if (!text || busy) return;
    $('#chatInput').value = '';
    ensureWelcome();
    addMessage('user', text);
    history.push({ role: 'user', text: text });
    busy = true;
    D.setMood('thinking');
    showTyping();
    updateStatus();

    B.reply({ text: text, lang: lang, history: history.slice(), memories: M.list() })
      .catch(function () { return { text: I.pick('say.pet'), mood: 'curious' }; })
      .then(function (res) {
        hideTyping();
        addMessage('tom', res.text);
        history.push({ role: 'tom', text: res.text });
        busy = false;
        var talkMs = 1200;
        if (speakReplies && V.ttsSupported) {
          V.speak(res.text, speechLang());
          talkMs = Math.min(7000, 600 + res.text.length * 55);
        }
        D.setMood('talking', talkMs);
        setTimeout(function () { D.setMood(res.mood || 'happy', 3500); }, talkMs);
        updateStatus();
      });
  }

  function setListening(on) {
    listening = on;
    var mic = $('#micBtn');
    mic.classList.toggle('listening', on);
    mic.setAttribute('aria-pressed', String(on));
    if (on) D.setMood('listening');
    else if (!busy) D.rest();
    updateStatus();
  }

  function startMic() {
    if (!V.supported) { toast(I.t('toast.micUnsupported')); return; }
    if (listening) { V.stop(); return; }
    V.cancelSpeech();
    var input = $('#chatInput');
    input.value = '';
    var heard = '';
    var failed = false;
    V.listen({
      lang: speechLang(),
      onStart: function () { setListening(true); },
      onResult: function (text) { heard = text; input.value = text; },
      onError: function (code) {
        failed = true;
        setListening(false);
        toast(I.t(code === 'not-allowed' ? 'toast.micDenied' :
                  code === 'no-speech' ? 'toast.noSpeech' :
                  code === 'network' ? 'toast.micNet' : 'toast.micError'));
      },
      onEnd: function () {
        setListening(false);
        if (!failed && heard.trim()) send(heard);
      }
    });
  }

  function toggleSpeak() {
    if (!V.ttsSupported) { toast(I.t('toast.ttsUnsupported')); return; }
    speakReplies = !speakReplies;
    store.set(cfg.keys.voiceReplies, speakReplies ? '1' : '0');
    $('#speakToggle').setAttribute('aria-pressed', String(speakReplies));
    if (!speakReplies) V.cancelSpeech();
    toast(I.t(speakReplies ? 'toast.voiceOn' : 'toast.voiceOff'));
  }

  /* ---------- memories ---------- */
  function renderPhotos() {
    var box = $('#photos');
    box.textContent = '';
    if (cfg.realTomPhotos.length) {
      cfg.realTomPhotos.forEach(function (src) {
        var img = document.createElement('img');
        img.src = src;
        img.alt = 'Tom';
        img.loading = 'lazy';
        box.appendChild(img);
      });
    } else {
      var ph = document.createElement('div');
      ph.className = 'photo-ph';
      ph.innerHTML = '<svg class="paw" viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="21" rx="7.5" ry="6"/><ellipse cx="6.5" cy="14" rx="3" ry="3.8"/><ellipse cx="12" cy="8.5" rx="3" ry="4"/><ellipse cx="20" cy="8.5" rx="3" ry="4"/><ellipse cx="25.5" cy="14" rx="3" ry="3.8"/></svg><span></span>';
      ph.querySelector('span').textContent = I.t('mem.photos');
      box.appendChild(ph);
    }
  }

  function renderMemories() {
    var list = M.list();
    var ul = $('#memList');
    ul.textContent = '';
    $('#memEmpty').hidden = list.length > 0;
    list.forEach(function (m) {
      var li = document.createElement('li');
      li.className = 'mem-card';
      if (m.title) {
        var h = document.createElement('h3');
        h.textContent = m.title;
        li.appendChild(h);
      }
      if (m.when) {
        var w = document.createElement('span');
        w.className = 'when';
        w.textContent = m.when;
        li.appendChild(w);
      }
      var p = document.createElement('p');
      p.textContent = m.text;
      li.appendChild(p);
      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'mem-del';
      del.textContent = I.t('mem.delete');
      var armTimer = null;
      del.addEventListener('click', function () {
        if (del.getAttribute('data-armed') === '1') {
          M.remove(m.id);
          renderMemories();
          toast(I.t('toast.deleted'));
          return;
        }
        del.setAttribute('data-armed', '1');
        del.textContent = I.t('mem.confirm');
        clearTimeout(armTimer);
        armTimer = setTimeout(function () {
          del.removeAttribute('data-armed');
          del.textContent = I.t('mem.delete');
        }, 3000);
      });
      li.appendChild(del);
      ul.appendChild(li);
    });
  }

  function openSheet() {
    $('#memSheet').hidden = false;
    $('#memTitle').focus();
  }

  function closeSheet() {
    $('#memSheet').hidden = true;
    $('#memForm').reset();
  }

  function saveMemory(e) {
    e.preventDefault();
    var text = $('#memText').value.trim();
    if (!text) { toast(I.t('toast.needText')); $('#memText').focus(); return; }
    M.add({ title: $('#memTitle').value, when: $('#memWhen').value, text: text });
    closeSheet();
    renderMemories();
    toast(I.t('toast.saved'));
  }

  /* ---------- start ---------- */
  function init() {
    var welcome = $('#purvaWelcome');
    if (welcome) {
      var startButton = $('#purvaStart');
      if (store.get('tom-ai.purvaWelcomeSeen.v1', '0') !== '1') {
        welcome.hidden = false;
        startButton.addEventListener('click', function () {
          store.set('tom-ai.purvaWelcomeSeen.v1', '1');
          welcome.hidden = true;
        });
      } else {
        welcome.hidden = true;
      }
    }

    var saved = store.get(cfg.keys.lang, cfg.defaultLang);
    lang = cfg.languages.some(function (l) { return l.code === saved; }) ? saved : cfg.defaultLang;

    D.create($('#dogHome'));
    D.create($('#dogChat'), { crop: 'head' });
    D.setBase(dayPart() === 'night' ? 'sleepy' : 'happy');

    var home = $('#dogHome');
    function petTom() {
      D.setMood('excited', 2200);
      D.pet(home);
      setBubble(I.pick('say.pet'), 4500);
    }
    home.addEventListener('click', petTom);
    home.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); petTom(); }
    });

    $('#homeMic').addEventListener('click', function () { go('chat'); startMic(); });
    $('#micBtn').addEventListener('click', startMic);
    $('#speakToggle').setAttribute('aria-pressed', String(speakReplies));
    $('#speakToggle').addEventListener('click', toggleSpeak);
    $('#chatForm').addEventListener('submit', function (e) { e.preventDefault(); send($('#chatInput').value); });

    $('#memAdd').addEventListener('click', openSheet);
    $('#memCancel').addEventListener('click', closeSheet);
    $('#memForm').addEventListener('submit', saveMemory);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('#memSheet').hidden) closeSheet();
    });

    window.addEventListener('hashchange', onHash);
    setLang(lang);
    onHash();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
