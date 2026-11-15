/* TOM AI - TOM's personality and replies.
 *
 * This version is a small offline "brain": keyword rules with playful replies in
 * Hindi, Marathi and English. No network, no paid API.
 *
 * To plug in a real AI later, call TOM.brain.setProvider(fn) once at start-up
 * (see js/providers/remote.example.js). The provider receives
 *   { text, lang, history, memories }
 * and returns (or resolves to) { text, mood }.
 * If the provider throws, TOM falls back to these offline replies.
 */
(function (g) {
  var TOM = g.TOM;

  var KEYWORDS = [
    ['story', ['kahani', 'kahaani', 'story', 'gosht', 'goshta', 'yaad', 'yaadein', 'memory', 'memories', 'कहानी', 'कथा', 'गोष्ट', 'याद', 'आठवण']],
    ['bye', ['bye', 'alvida', 'tata', 'good night', 'shubh ratri', 'बाय', 'अलविदा', 'टाटा', 'शुभ रात्रि', 'गुड नाइट', 'निघतो', 'जाता हूँ', 'जाता हूं']],
    ['thanks', ['shukriya', 'dhanyavad', 'thanks', 'thank', 'आभार', 'धन्यवाद', 'शुक्रिया', 'थैंक']],
    ['how', ['kaise ho', 'kaisa hai', 'kasa aahes', 'kasa ahes', 'how are you', 'कैसे हो', 'कैसा है', 'कसा आहेस', 'कसा आहे', 'कैसे']],
    ['food', ['khana', 'khaana', 'bhook', 'bhukh', 'biscuit', 'roti', 'hungry', 'food', 'jevan', 'जेवण', 'खाना', 'भूख', 'बिस्किट', 'रोटी', 'चपाती']],
    ['play', ['khel', 'khelo', 'khelu', 'play', 'ball', 'game', 'खेल', 'खेळ', 'गेंद', 'चेंडू']],
    ['walk', ['ghum', 'ghoom', 'walk', 'phir', 'firaya', 'घूम', 'घुम', 'फिर', 'फिरा']],
    ['sad', ['udas', 'dukhi', 'sad', 'rona', 'upset', 'उदास', 'दुखी', 'दुःखी', 'रडू', 'रोना', 'बुरा']],
    ['love', ['pyar', 'pyaar', 'love', 'miss', 'awadto', 'आवडतो', 'प्यार', 'प्रेम', 'माया', 'मिस']],
    ['sleep', ['sona', 'so jao', 'neend', 'sleep', 'zop', 'झोप', 'नींद', 'सो जा', 'सो जाओ', 'सोना']],
    ['name', ['naam', 'name', 'who are you', 'kaun', 'kon ', 'नाम', 'नाव', 'कौन', 'कोण']],
    ['greet', ['hi', 'hii', 'hello', 'hey', 'namaste', 'namaskar', 'नमस्ते', 'नमस्कार', 'हेलो', 'हॅलो', 'हाय']]
  ];

  var MOOD = {
    greet: 'excited', name: 'happy', how: 'happy', food: 'excited', play: 'excited',
    walk: 'excited', sad: 'sad', love: 'excited', bye: 'sad', thanks: 'happy',
    sleep: 'sleepy', story: 'happy', fallback: 'curious'
  };

  var BANK = {
    hi: {
      greet: ['भों भों! नमस्ते दोस्त! पूँछ हिल रही है मेरी!', 'अरे वाह, तुम आ गए! मैं बहुत खुश हूँ!'],
      name: ['मेरा नाम TOM है! गली का सबसे प्यारा कुत्ता। तुम्हारा नाम क्या है?'],
      how: ['मैं एकदम मस्त हूँ! अभी धूप में लेटकर आया हूँ। तुम कैसे हो?'],
      food: ['खाना? मेरे कान खड़े हो गए! रोटी और बिस्किट मेरे फेवरेट हैं।'],
      play: ['हाँ हाँ हाँ! गेंद फेंको, मैं दौड़कर लाता हूँ! भों भों!'],
      walk: ['घूमने चलें? गली के हर कोने की ख़ुशबू मुझे पता है!'],
      sad: ['अरे, उदास मत हो। आओ, मैं पास बैठ जाता हूँ।'],
      love: ['मुझे भी तुमसे बहुत प्यार है! पूँछ रुक ही नहीं रही।'],
      bye: ['अभी जा रहे हो? ठीक है, जल्दी आना! मैं यहीं इंतज़ार करूँगा।'],
      thanks: ['अरे, इसमें शुक्रिया कैसा! हम दोस्त हैं ना।'],
      sleep: ['हम्म… थोड़ी नींद आ रही है। चलो, साथ में झपकी लें।'],
      fallback: ['हम्म? मुझे पूरा समझ नहीं आया, पर पूँछ हिला रहा हूँ! भों भों!', 'यह तो नई बात है! थोड़ा और बताओ?'],
      storyIntro: 'सुनो, एक याद सुनाता हूँ: ',
      storyNone: 'अभी मेरे पास कोई कहानी नहीं है। “यादें” में असली TOM की कहानी जोड़ो, फिर मैं सुनाऊँगा!'
    },
    mr: {
      greet: ['भो भो! नमस्कार मित्रा! माझी शेपूट हलतेय!', 'अरे वा, तू आलास! मी खूप खुश आहे!'],
      name: ['माझं नाव TOM! गल्लीतला सगळ्यात गोड कुत्रा. तुझं नाव काय?'],
      how: ['मी एकदम मस्त! आत्ताच उन्हात लोळून आलो. तू कसा आहेस?'],
      food: ['जेवण? माझे कान टवकारले! चपाती आणि बिस्किट माझी आवडती.'],
      play: ['हो हो हो! चेंडू फेक, मी पळत जाऊन आणतो! भो भो!'],
      walk: ['फिरायला जायचं? गल्लीतल्या प्रत्येक कोपऱ्याचा वास मला माहितेय!'],
      sad: ['अरे, उदास होऊ नकोस. ये, मी जवळ बसतो.'],
      love: ['मलाही तुझ्यावर खूप माया आहे! शेपूट थांबतच नाहीये.'],
      bye: ['लगेच निघालास? ठीक आहे, लवकर ये! मी इथेच वाट पाहीन.'],
      thanks: ['अरे, आभार कसले! आपण दोस्त आहोत ना.'],
      sleep: ['हम्म… थोडी झोप येतेय. चल, दोघं मिळून डुलकी काढू.'],
      fallback: ['हं? मला पूर्ण कळलं नाही, पण शेपूट हलवतोय! भो भो!', 'ही तर नवीन गोष्ट! अजून सांग ना?'],
      storyIntro: 'ऐक, एक आठवण सांगतो: ',
      storyNone: 'अजून माझ्याकडे गोष्ट नाही. “आठवणी” मध्ये खऱ्या TOM ची गोष्ट जोड, मग मी सांगेन!'
    },
    en: {
      greet: ['Bhow bhow! Hello, friend! My tail is going crazy!', 'Oh wow, you came! I am so happy!'],
      name: ['My name is TOM! The sweetest dog on the street. What is your name?'],
      how: ['I am great! I just rolled around in the sunshine. How are you?'],
      food: ['Food? My ears just popped up! Roti and biscuits are my favourites.'],
      play: ['Yes yes yes! Throw the ball, I will bring it back! Bhow bhow!'],
      walk: ['A walk? I know the smell of every corner of this street!'],
      sad: ['Oh, do not be sad. Come, I will sit right next to you.'],
      love: ['I love you too! My tail will not stop wagging.'],
      bye: ['Leaving already? Okay, come back soon! I will wait right here.'],
      thanks: ['Oh, no need to thank me! We are friends, right?'],
      sleep: ['Hmm… I am a little sleepy. Let us take a nap together.'],
      fallback: ['Hm? I did not understand everything, but I am wagging my tail! Bhow bhow!', 'That is something new! Tell me more?'],
      storyIntro: 'Listen, here is a memory: ',
      storyNone: 'I have no story yet. Add one about the real Tom in Memories, and I will tell it!'
    }
  };

  var last = {};

  function has(text, words) {
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (/[a-z]/.test(w)) {
        if (new RegExp('(^|[^a-z])' + w + '($|[^a-z])').test(text)) return true;
      } else if (text.indexOf(w) !== -1) {
        return true;
      }
    }
    return false;
  }

  function choose(lang, key) {
    var arr = BANK[lang][key];
    if (arr.length === 1) return arr[0];
    var i;
    do { i = Math.floor(Math.random() * arr.length); } while (i === last[lang + key]);
    last[lang + key] = i;
    return arr[i];
  }

  function localReply(ctx) {
    var lang = BANK[ctx.lang] ? ctx.lang : 'en';
    var text = (ctx.text || '').toLowerCase();
    var intent = 'fallback';
    for (var i = 0; i < KEYWORDS.length; i++) {
      if (has(text, KEYWORDS[i][1])) { intent = KEYWORDS[i][0]; break; }
    }

    if (intent === 'story') {
      var mems = (ctx.memories || []).filter(function (m) { return m.text; });
      if (!mems.length) return { text: BANK[lang].storyNone, mood: 'curious' };
      var m = mems[Math.floor(Math.random() * mems.length)];
      var body = m.text.length > 160 ? m.text.slice(0, 157) + '…' : m.text;
      var head = m.title ? '“' + m.title + '”: ' : '';
      return { text: BANK[lang].storyIntro + head + body, mood: 'happy' };
    }

    return { text: choose(lang, intent), mood: MOOD[intent] };
  }

  var provider = null;

  TOM.brain = {
    setProvider: function (fn) { provider = fn; },
    reply: function (ctx) {
      var wait = 650 + Math.random() * 500;
      var run = provider
        ? Promise.resolve().then(function () { return provider(ctx); }).catch(function () { return null; })
        : Promise.resolve(null);
      return run.then(function (res) {
        if (res && res.text) return res;
        return new Promise(function (resolve) {
          setTimeout(function () { resolve(localReply(ctx)); }, wait);
        });
      });
    },
    _localReply: localReply
  };
})(window);
