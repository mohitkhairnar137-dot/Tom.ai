/* TOM AI - the cartoon dog.
 *
 * TOM is an inline SVG. All motion is CSS, driven by the data-mood attribute,
 * so a different avatar (for example photos of the real Tom) can replace this
 * file later without touching the rest of the app.
 *
 * Public API (TOM.dog):
 *   create(host, { crop })  draw TOM into an element
 *   setMood(mood, ms)       mood: happy excited sleepy curious sad listening thinking talking
 *                           with ms the mood lasts that long, then returns to the base mood
 *   setBase(mood)           the resting mood (sleepy at night)
 *   rest()                  go back to the base mood now
 *   pet(host)               squish and spawn hearts
 *   burst(host, n)          hearts only
 *   setLabel(text)          accessible name for every TOM
 */
(function (g) {
  var TOM = g.TOM;
  var instances = [];
  var base = 'happy';
  var current = 'happy';
  var timer = null;
  var label = 'TOM';

  function markup(o) {
    var vb = o && o.crop === 'head' ? '38 58 244 244' : '0 0 320 320';
    return '' +
      '<svg class="dog" viewBox="' + vb + '" data-mood="' + current + '" role="img" aria-label="' + label + '" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
      '<g class="dog-all">' +
        '<g class="tail">' +
          '<path class="tail-stroke" d="M212 284C264 286 286 248 262 214" fill="none" stroke-width="20" stroke-linecap="round"/>' +
          '<circle class="cream" cx="262" cy="214" r="11"/>' +
        '</g>' +
        '<ellipse class="coat" cx="160" cy="250" rx="64" ry="54"/>' +
        '<ellipse class="cream" cx="160" cy="264" rx="34" ry="36"/>' +
        '<g class="legs">' +
          '<rect class="coat" x="124" y="270" width="26" height="36" rx="13"/>' +
          '<rect class="coat" x="170" y="270" width="26" height="36" rx="13"/>' +
          '<ellipse class="cream" cx="137" cy="306" rx="18" ry="9"/>' +
          '<ellipse class="cream" cx="183" cy="306" rx="18" ry="9"/>' +
        '</g>' +
        '<g class="head">' +
          '<g class="ear ear-l"><path class="ear-fill" d="M106 96C72 86 46 128 60 178C86 176 106 144 112 112Z"/></g>' +
          '<g class="ear ear-r"><path class="ear-fill" d="M214 96C248 86 274 128 260 178C234 176 214 144 208 112Z"/></g>' +
          '<ellipse class="coat" cx="160" cy="146" rx="76" ry="68"/>' +
          '<path class="cream blaze" d="M160 80C147 99 145 124 149 150L171 150C175 124 173 99 160 80Z"/>' +
          '<ellipse class="cream" cx="160" cy="178" rx="42" ry="31"/>' +
          '<circle class="blush" cx="108" cy="172" r="11"/>' +
          '<circle class="blush" cx="212" cy="172" r="11"/>' +
          '<g class="eye-open">' +
            '<g class="blink"><circle class="pupil" cx="128" cy="134" r="11"/><circle class="shine" cx="132" cy="130" r="4"/></g>' +
            '<g class="blink"><circle class="pupil" cx="192" cy="134" r="11"/><circle class="shine" cx="196" cy="130" r="4"/></g>' +
          '</g>' +
          '<g class="eye-happy"><path class="line" d="M116 140Q128 124 140 140"/><path class="line" d="M180 140Q192 124 204 140"/></g>' +
          '<g class="eye-sleepy"><path class="line" d="M116 134Q128 146 140 134"/><path class="line" d="M180 134Q192 146 204 134"/></g>' +
          '<path class="brow brow-sad" d="M114 120L140 112M180 112L206 120"/>' +
          '<path class="brow brow-curious" d="M178 112Q192 102 206 112"/>' +
          '<ellipse class="nose" cx="160" cy="161" rx="14" ry="10"/>' +
          '<ellipse class="shine nose-shine" cx="155" cy="157" rx="4" ry="2.4"/>' +
          '<g class="mouth mouth-smile"><path class="line" d="M160 171V182M160 182Q147 196 134 184M160 182Q173 196 186 184"/></g>' +
          '<g class="mouth mouth-sad"><path class="line" d="M160 171V182M160 182Q147 172 135 188M160 182Q173 172 185 188"/></g>' +
          '<g class="mouth mouth-o"><ellipse class="mouth-fill" cx="160" cy="188" rx="7" ry="6"/></g>' +
          '<g class="mouth mouth-open"><g class="jaw">' +
            '<path class="mouth-fill" d="M136 180Q160 174 184 180Q182 206 160 208Q138 206 136 180Z"/>' +
            '<path class="tongue" d="M149 197Q160 187 171 197Q169 208 160 209Q151 208 149 197Z"/>' +
          '</g></g>' +
        '</g>' +
      '</g>' +
      '<g class="zzz"><text x="232" y="86" font-size="20">z</text><text x="248" y="64" font-size="26">Z</text><text x="268" y="40" font-size="32">z</text></g>' +
      '<g class="dots"><circle cx="238" cy="92" r="5"/><circle cx="254" cy="74" r="7"/><circle cx="274" cy="56" r="9"/></g>' +
      '</svg>';
  }

  function create(host, opts) {
    host.insertAdjacentHTML('beforeend', markup(opts));
    var el = host.querySelector('svg.dog');
    instances.push({ host: host, el: el });
    return el;
  }

  function paint(m) {
    current = m;
    for (var i = 0; i < instances.length; i++) instances[i].el.setAttribute('data-mood', m);
  }

  function setMood(m, ms) {
    clearTimeout(timer);
    timer = null;
    paint(m);
    if (ms) timer = setTimeout(function () { timer = null; paint(base); }, ms);
  }

  function setBase(m) {
    var wasResting = current === base && !timer;
    base = m;
    if (wasResting) paint(m);
  }

  function rest() {
    clearTimeout(timer);
    timer = null;
    paint(base);
  }

  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.6-9.3-9C1 8.4 3 5 6.3 5c2 0 3.6 1.1 5.7 3.3C14.1 6.1 15.7 5 17.7 5 21 5 23 8.4 21.3 12c-2.3 4.4-9.3 9-9.3 9z"/></svg>';

  function burst(host, n) {
    n = n || 4;
    for (var i = 0; i < n; i++) {
      var h = document.createElement('span');
      h.className = 'heart';
      h.innerHTML = HEART;
      h.style.setProperty('--x', (35 + Math.random() * 30) + '%');
      h.style.setProperty('--y', (8 + Math.random() * 22) + '%');
      h.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
      h.style.animationDelay = (i * 110) + 'ms';
      host.appendChild(h);
      (function (node) { setTimeout(function () { node.remove(); }, 1700); })(h);
    }
  }

  function pet(host) {
    var el = host.querySelector('svg.dog');
    if (el) {
      el.classList.remove('pet');
      void el.getBoundingClientRect();
      el.classList.add('pet');
      setTimeout(function () { el.classList.remove('pet'); }, 600);
    }
    burst(host, 4);
    try { navigator.vibrate && navigator.vibrate(18); } catch (e) {}
  }

  function setLabel(text) {
    label = text;
    for (var i = 0; i < instances.length; i++) instances[i].el.setAttribute('aria-label', text);
  }

  TOM.dog = {
    create: create, setMood: setMood, setBase: setBase, rest: rest,
    pet: pet, burst: burst, setLabel: setLabel,
    get mood() { return current; }
  };
})(window);
