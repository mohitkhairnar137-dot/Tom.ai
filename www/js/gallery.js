/* TOM AI - photo galleries inside Memories.
   Tom tab:        the built-in photos listed in TOM.config.realTomPhotos (offline, in the APK).
   My photos tab:  Purva's own photos from the phone gallery, kept in IndexedDB (see photodb.js).
   Both open in the same full-screen viewer. Started from app.js with TOM.gallery.init(). */
(function (g) {
  var TOM = g.TOM, cfg = TOM.config, C = cfg.gallery;
  var doc = g.document;

  function $(s) { return doc.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); }
  function t(k) { return TOM.i18n.t(k); }
  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  var PAW = '<svg viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="21" rx="7.5" ry="6"/><ellipse cx="6.5" cy="14" rx="3" ry="3.8"/><ellipse cx="12" cy="8.5" rx="3" ry="4"/><ellipse cx="20" cy="8.5" rx="3" ry="4"/><ellipse cx="25.5" cy="14" rx="3" ry="3.8"/></svg>';
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-8.6-9C2.3 7.6 4.3 5 7 5c1.8 0 3.2.9 5 3 1.8-2.1 3.2-3 5-3 2.7 0 4.7 2.6 3.6 6-1.6 4.6-8.6 9-8.6 9z"/></svg>';

  var toast = function () {};
  var tab = 'tom';
  var storageOk = null;            /* null = still checking, true / false afterwards */
  var mine = [];                   /* records from IndexedDB, each with a temporary _url */
  var mineUrls = [];
  var viewer = { open: false, items: [], index: 0, kind: '', pushed: false, opener: null };
  var queue = [];                  /* files waiting to get a title and be saved */
  var queueTotal = 0;
  var previewUrl = null;
  var saving = false;
  var delTimer = null;
  var quiet = false;               /* true while redrawing after a language change: no entrance animation */
  var drawn = false;

  /* ---------- dates ---------- */
  function fmtDate(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    var tag = { hi: 'hi-IN', mr: 'mr-IN', en: 'en-IN' }[TOM.i18n.lang] || 'en-IN';
    try { return d.toLocaleDateString(tag, { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return d.toDateString(); }
  }

  function fmtIso(iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    return fmtDate(new Date(+p[0], +p[1] - 1, +p[2]));
  }

  /* ---------- items ---------- */
  function tomItems() {
    var lang = TOM.i18n.lang;
    return (cfg.realTomPhotos || []).map(function (p) {
      if (typeof p === 'string') p = { src: p };
      var cap = p.caption;
      var text = !cap ? '' : (typeof cap === 'string' ? cap : (cap[lang] || cap.en || ''));
      return { src: p.src, title: text, date: fmtIso(p.date), text: '', wide: !!p.wide, pos: p.pos || '' };
    });
  }

  function mineItems() {
    return mine.map(function (r) {
      return {
        id: r.id, src: r._url, title: r.title, text: r.desc,
        date: fmtDate(new Date(r.createdAt)),
        wide: r.w > 0 && r.h > 0 && r.w / r.h > 1.3, pos: ''
      };
    });
  }

  /* ---------- grids ---------- */
  function buildCard(item, index, items, kind) {
    var b = el('button', 'photo-card' + (item.wide ? ' wide' : ''));
    b.type = 'button';
    b.style.setProperty('--i', String(Math.min(index, 12)));
    var label = item.title || t(kind === 'mine' ? 'gal.altMine' : 'gal.altTom');
    b.setAttribute('aria-label', label);
    var img = el('img');
    img.src = item.src;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    if (item.pos) img.style.objectPosition = item.pos;
    b.appendChild(img);
    var heart = el('span', 'photo-heart');
    heart.innerHTML = HEART;
    b.appendChild(heart);
    if (item.title) {
      var cap = el('span', 'photo-cap');
      var paw = el('i', 'photo-paw');
      paw.innerHTML = PAW;
      cap.appendChild(paw);
      cap.appendChild(el('span', '', item.title));
      b.appendChild(cap);
    }
    b.addEventListener('click', function () { openViewer(items, index, kind, b); });
    return b;
  }

  function fillGrid(box, items, kind) {
    box.classList.toggle('settled', quiet);
    box.textContent = '';
    items.forEach(function (it, i) { box.appendChild(buildCard(it, i, items, kind)); });
  }

  function renderTom() {
    var items = tomItems();
    fillGrid($('#tomGrid'), items, 'tom');
    $('#tomEmpty').hidden = items.length > 0;
  }

  function renderMine() {
    var items = mineItems();
    fillGrid($('#mineGrid'), items, 'mine');
    $('#mineEmpty').hidden = !(storageOk === true && items.length === 0);
    var note = $('#mineNote');
    var key = storageOk === false ? 'gal.noStorage' : 'gal.mineNote';
    note.setAttribute('data-i18n', key);
    note.textContent = t(key);
    $('#photoAdd').hidden = tab !== 'mine' || storageOk === false;
  }

  function render() {
    quiet = drawn;
    renderTom();
    renderMine();
    quiet = false;
    drawn = true;
    if (viewer.open) paintViewer();
  }

  function loadMine() {
    return TOM.photoDb.list().then(function (list) {
      mineUrls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} });
      mineUrls = [];
      mine = list.map(function (r) {
        r._url = URL.createObjectURL(r.blob);
        mineUrls.push(r._url);
        return r;
      });
      renderMine();
    });
  }

  /* ---------- tabs ---------- */
  function setTab(name) {
    tab = name;
    $$('#memTabs [role="tab"]').forEach(function (b) {
      var on = b.getAttribute('data-tab') === name;
      b.setAttribute('aria-selected', String(on));
      b.setAttribute('tabindex', on ? '0' : '-1');
    });
    $$('.tab-panel').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== name; });
    $('#memAdd').hidden = name !== 'stories';
    $('#photoAdd').hidden = name !== 'mine' || storageOk === false;
  }

  function onTabKey(e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var tabs = $$('#memTabs [role="tab"]');
    var i = tabs.indexOf(doc.activeElement);
    if (i < 0) return;
    var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    n.focus();
    setTab(n.getAttribute('data-tab'));
    e.preventDefault();
  }

  /* ---------- viewer ---------- */
  function paintViewer() {
    var it = viewer.items[viewer.index];
    if (!it) return;
    var img = $('#viewerImg');
    img.classList.remove('in');
    img.src = it.src;
    img.alt = it.title || t(viewer.kind === 'mine' ? 'gal.altMine' : 'gal.altTom');
    void img.offsetWidth;
    img.classList.add('in');
    $('#viewerTitle').textContent = it.title || (viewer.kind === 'mine' ? t('gal.untitled') : '');
    $('#viewerTitle').hidden = !$('#viewerTitle').textContent;
    $('#viewerDate').textContent = it.date || '';
    $('#viewerText').textContent = it.text || '';
    $('#viewerText').hidden = !it.text;
    var many = viewer.items.length > 1;
    $('#viewerPrev').hidden = !many;
    $('#viewerNext').hidden = !many;
    $('#viewerCount').textContent = many ? (viewer.index + 1) + ' / ' + viewer.items.length : '';
    var del = $('#viewerDel');
    del.hidden = viewer.kind !== 'mine';
    del.removeAttribute('data-armed');
    del.textContent = t('mem.delete');
    clearTimeout(delTimer);
  }

  function openViewer(items, index, kind, opener) {
    if (!items.length) return;
    viewer.items = items;
    viewer.index = index;
    viewer.kind = kind;
    viewer.opener = opener || null;
    viewer.open = true;
    $('#viewer').hidden = false;
    paintViewer();
    $('#viewerClose').focus();
    /* One history entry, so the Android back button closes the viewer instead of leaving Memories. */
    try { g.history.pushState({ tomViewer: 1 }, ''); viewer.pushed = true; } catch (e) { viewer.pushed = false; }
  }

  function hideViewer() {
    viewer.open = false;
    clearTimeout(delTimer);
    $('#viewer').hidden = true;
    $('#viewerImg').removeAttribute('src');
    var o = viewer.opener;
    viewer.opener = null;
    if (o && doc.contains(o)) { try { o.focus(); } catch (e) {} }
  }

  function closeViewer() {
    if (!viewer.open) return;
    if (viewer.pushed) {
      viewer.pushed = false;
      try { g.history.back(); } catch (e) {}
    }
    hideViewer();
  }

  function step(d) {
    if (!viewer.open || viewer.items.length < 2) return;
    viewer.index = (viewer.index + d + viewer.items.length) % viewer.items.length;
    paintViewer();
  }

  function deleteCurrent() {
    var del = $('#viewerDel');
    if (del.getAttribute('data-armed') !== '1') {
      del.setAttribute('data-armed', '1');
      del.textContent = t('mem.confirm');
      clearTimeout(delTimer);
      delTimer = setTimeout(function () {
        del.removeAttribute('data-armed');
        del.textContent = t('mem.delete');
      }, 3000);
      return;
    }
    var it = viewer.items[viewer.index];
    if (!it || !it.id) return;
    TOM.photoDb.remove(it.id).then(loadMine).then(function () {
      toast(t('gal.toast.deleted'));
      var items = mineItems();
      if (!items.length) { closeViewer(); return; }
      viewer.items = items;
      viewer.index = Math.min(viewer.index, items.length - 1);
      paintViewer();
    }).catch(function () { toast(t('gal.toast.fail')); });
  }

  /* ---------- adding personal photos ---------- */
  function decode(file) {
    function viaImg() {
      return new Promise(function (resolve, reject) {
        var u = URL.createObjectURL(file);
        var im = new Image();
        im.onload = function () { URL.revokeObjectURL(u); resolve({ src: im, w: im.naturalWidth, h: im.naturalHeight }); };
        im.onerror = function () { URL.revokeObjectURL(u); reject(new Error('decode')); };
        im.src = u;
      });
    }
    if (g.createImageBitmap) {
      return g.createImageBitmap(file).then(
        function (bm) { return { src: bm, w: bm.width, h: bm.height, bm: bm }; },
        viaImg
      );
    }
    return viaImg();
  }

  /* Scales big photos down (to save phone storage); smaller ones are stored exactly as picked. */
  function prepare(file) {
    return decode(file).then(function (d) {
      if (!d.w || !d.h) throw new Error('decode');
      var scale = Math.min(1, C.maxEdge / Math.max(d.w, d.h));
      var keepOriginal = scale === 1 && file.size <= 3 * 1024 * 1024 &&
        /^image\/(jpeg|png|webp)$/.test(file.type);
      if (keepOriginal) {
        if (d.bm) d.bm.close();
        return file.arrayBuffer().then(function (buf) {
          return { blob: new Blob([buf], { type: file.type }), w: d.w, h: d.h };
        });
      }
      var w = Math.max(1, Math.round(d.w * scale)), h = Math.max(1, Math.round(d.h * scale));
      var cv = doc.createElement('canvas');
      cv.width = w; cv.height = h;
      var cx = cv.getContext('2d');
      cx.fillStyle = '#fff';
      cx.fillRect(0, 0, w, h);
      cx.drawImage(d.src, 0, 0, w, h);
      if (d.bm) d.bm.close();
      return new Promise(function (resolve, reject) {
        cv.toBlob(function (blob) {
          if (blob) resolve({ blob: blob, w: w, h: h }); else reject(new Error('encode'));
        }, 'image/jpeg', C.quality);
      });
    });
  }

  function showSheet() {
    var file = queue[0];
    if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
    previewUrl = URL.createObjectURL(file);
    $('#photoPreview').src = previewUrl;
    $('#photoForm').reset();
    var prog = $('#photoProgress');
    prog.hidden = queueTotal < 2;
    prog.textContent = t('gal.progress').replace('{n}', String(queueTotal - queue.length + 1)).replace('{total}', String(queueTotal));
    var sheet = $('#photoSheet');
    sheet.hidden = false;
    $('#photoSave').disabled = false;
    try { sheet.scrollIntoView({ block: 'nearest' }); } catch (e) {}
  }

  function closeSheet() {
    queue = [];
    queueTotal = 0;
    saving = false;
    $('#photoSheet').hidden = true;
    $('#photoForm').reset();
    $('#photoPreview').removeAttribute('src');
    if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
  }

  function nextInQueue() {
    queue.shift();
    if (queue.length) showSheet(); else closeSheet();
  }

  function onFilesChosen(e) {
    var input = e.target;
    var files = Array.prototype.slice.call(input.files || []).filter(function (f) {
      return !f.type || /^image\//.test(f.type);
    });
    input.value = '';
    if (!files.length) return;
    queue = files;
    queueTotal = files.length;
    showSheet();
  }

  function onSave(e) {
    e.preventDefault();
    if (saving || !queue.length) return;
    saving = true;
    $('#photoSave').disabled = true;
    var file = queue[0];
    var title = $('#photoTitle').value, desc = $('#photoDesc').value;
    prepare(file).then(function (p) {
      return TOM.photoDb.add({ title: title, desc: desc, blob: p.blob, w: p.w, h: p.h });
    }).then(function () {
      saving = false;
      toast(t('gal.toast.saved'));
      nextInQueue();
      loadMine().catch(function () { toast(t('gal.toast.loadFail')); });
    }, function (err) {
      saving = false;
      $('#photoSave').disabled = false;
      var msg = err && (err.message === 'decode' || err.message === 'encode') ? 'gal.toast.badFile' :
                err && err.name === 'QuotaExceededError' ? 'gal.toast.full' : 'gal.toast.fail';
      toast(t(msg));
      if (msg === 'gal.toast.badFile') nextInQueue();      /* skip the unusable file */
    });
  }

  function startAdd() {
    if (storageOk === false) { toast(t('gal.noStorage')); return; }
    $('#photoFile').click();
  }

  /* ---------- start ---------- */
  function init(opts) {
    if (opts && opts.toast) toast = opts.toast;

    $$('#memTabs [role="tab"]').forEach(function (b) {
      b.addEventListener('click', function () { setTab(b.getAttribute('data-tab')); });
    });
    $('#memTabs').addEventListener('keydown', onTabKey);

    $('#photoAdd').addEventListener('click', startAdd);
    $('#photoFile').addEventListener('change', onFilesChosen);
    $('#photoForm').addEventListener('submit', onSave);
    $('#photoCancel').addEventListener('click', closeSheet);

    $('#viewerClose').addEventListener('click', closeViewer);
    $('#viewerPrev').addEventListener('click', function () { step(-1); });
    $('#viewerNext').addEventListener('click', function () { step(1); });
    $('#viewerDel').addEventListener('click', deleteCurrent);
    /* Tapping the dark area around the photo closes it. */
    $('#viewer').addEventListener('click', function (e) {
      if (e.target === $('#viewer') || e.target === $('#viewerStage')) closeViewer();
    });

    var sx = null, sy = 0;
    var stage = $('#viewerStage');
    stage.addEventListener('touchstart', function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
    }, { passive: true });

    doc.addEventListener('keydown', function (e) {
      if (viewer.open) {
        if (e.key === 'Escape') closeViewer();
        else if (e.key === 'ArrowLeft') step(-1);
        else if (e.key === 'ArrowRight') step(1);
      } else if (e.key === 'Escape' && !$('#photoSheet').hidden) {
        closeSheet();
      }
    });

    /* Android back button (WebView history) or browser back: close the viewer. */
    g.addEventListener('popstate', function () {
      if (viewer.open) { viewer.pushed = false; hideViewer(); }
    });

    setTab('tom');
    renderTom();
    TOM.photoDb.ready().then(function (ok) {
      storageOk = ok;
      setTab(tab);
      if (!ok) { renderMine(); return; }
      if (g.navigator && navigator.storage && navigator.storage.persist) {
        try { navigator.storage.persist(); } catch (e) {}
      }
      return loadMine().catch(function () { toast(t('gal.toast.loadFail')); });
    });
  }

  TOM.gallery = { init: init, render: render, setTab: setTab };
})(window);
