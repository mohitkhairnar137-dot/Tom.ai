/* TOM AI - Hindi, Marathi and English text. */
(function (g) {
  var TOM = g.TOM;

  var D = {
    hi: {
      'nav.home': 'घर',
      'nav.chat': 'बातें',
      'nav.memories': 'यादें',
      'langs.label': 'भाषा',
      'home.hint': 'TOM को सहलाने के लिए छुओ',
      'home.chat': 'बातें',
      'home.memories': 'यादें',
      'home.mic': 'बोलकर बात करो',
      'mood.happy': 'खुश',
      'mood.excited': 'उत्साहित',
      'mood.sleepy': 'नींद',
      'mood.curious': 'जिज्ञासु',
      'mood.sad': 'उदास',
      'say.happy': 'भों भों! आज मैं बहुत खुश हूँ!',
      'say.excited': 'वाह वाह! चलो दौड़ें, चलो कूदें!',
      'say.sleepy': 'हम्म… मुझे झपकी आ रही है… zzz',
      'say.curious': 'अरे, यह क्या है? ज़रा सूँघकर देखूँ!',
      'say.sad': 'कोई मुझे थोड़ा प्यार करेगा क्या?',
      'say.pet': ['आहा! वहीं… थोड़ा और सहलाओ!', 'भों! गुदगुदी हो रही है!', 'मेरी पूँछ रुक ही नहीं रही!'],
      'greet.morning': 'सुप्रभात! भों भों! आज हम क्या खेलेंगे?',
      'greet.afternoon': 'नमस्ते दोस्त! मैं तुम्हारा इंतज़ार कर रहा था!',
      'greet.evening': 'शाम हो गई! चलो थोड़ी बातें करें?',
      'greet.night': 'रात हो गई… मुझे नींद आ रही है, पर तुमसे बात ज़रूर करूँगा।',
      'chat.placeholder': 'TOM को कुछ लिखो…',
      'chat.idle': 'ऑनलाइन, पूँछ हिला रहा है',
      'chat.listening': 'सुन रहा हूँ…',
      'chat.thinking': 'सोच रहा हूँ…',
      'chat.send': 'भेजो',
      'chat.mic': 'बोलो',
      'chat.micStop': 'सुनना बंद करो',
      'chat.voice': 'TOM जवाब बोलकर सुनाए',
      'chips.1': 'तुम्हारा नाम क्या है?',
      'chips.2': 'खाना खाओगे?',
      'chips.3': 'चलो खेलें!',
      'chips.4': 'कोई कहानी सुनाओ',
      'mem.title': 'असली TOM की यादें',
      'mem.sub': 'उसकी कहानियाँ यहाँ सँभालकर रखो।',
      'mem.add': 'कहानी जोड़ो',
      'mem.new': 'नई कहानी',
      'mem.photos': 'असली TOM की तस्वीरें जल्द यहाँ आएँगी।',
      'mem.f.title': 'शीर्षक',
      'mem.f.when': 'कब की बात है?',
      'mem.f.text': 'कहानी',
      'mem.save': 'सहेजो',
      'mem.cancel': 'रद्द करो',
      'mem.delete': 'हटाओ',
      'mem.confirm': 'हटाने के लिए फिर दबाओ',
      'mem.empty': 'अभी कोई कहानी नहीं है। असली TOM की पहली याद लिखो।',
      'toast.micUnsupported': 'इस डिवाइस पर बोलकर बात करना उपलब्ध नहीं है।',
      'toast.micDenied': 'माइक की अनुमति नहीं मिली।',
      'toast.micNet': 'बोली पहचानने के लिए इंटरनेट चाहिए।',
      'toast.noSpeech': 'कुछ सुनाई नहीं दिया, फिर कोशिश करो।',
      'toast.micError': 'माइक में कुछ गड़बड़ हो गई, फिर कोशिश करो।',
      'toast.saved': 'कहानी सहेज ली गई',
      'toast.needText': 'पहले कहानी लिखो',
      'toast.deleted': 'कहानी हटा दी गई',
      'toast.voiceOn': 'अब TOM जवाब बोलकर सुनाएगा',
      'toast.voiceOff': 'TOM की आवाज़ बंद',
      'toast.ttsUnsupported': 'इस डिवाइस पर आवाज़ उपलब्ध नहीं है।',
      'dog.alt': 'कार्टून कुत्ता TOM'
    },

    mr: {
      'nav.home': 'मुख्य',
      'nav.chat': 'गप्पा',
      'nav.memories': 'आठवणी',
      'langs.label': 'भाषा',
      'home.hint': 'TOM ला कुरवाळण्यासाठी स्पर्श कर',
      'home.chat': 'गप्पा',
      'home.memories': 'आठवणी',
      'home.mic': 'बोलून गप्पा मार',
      'mood.happy': 'आनंदी',
      'mood.excited': 'उत्साही',
      'mood.sleepy': 'झोप',
      'mood.curious': 'उत्सुक',
      'mood.sad': 'उदास',
      'say.happy': 'भो भो! आज मी खूप खुश आहे!',
      'say.excited': 'वा वा! चल पळूया, चल उड्या मारूया!',
      'say.sleepy': 'हम्म… मला डुलकी येतेय… zzz',
      'say.curious': 'अरे, हे काय आहे? जरा हुंगून बघतो!',
      'say.sad': 'कोणी मला थोडी माया लावेल का?',
      'say.pet': ['आहा! तिथेच… अजून थोडं कुरवाळ!', 'भो! गुदगुल्या होतायत!', 'माझी शेपूट थांबतच नाहीये!'],
      'greet.morning': 'शुभ प्रभात! भो भो! आज आपण काय खेळूया?',
      'greet.afternoon': 'नमस्कार मित्रा! मी तुझीच वाट पाहत होतो!',
      'greet.evening': 'संध्याकाळ झाली! चल थोड्या गप्पा मारूया?',
      'greet.night': 'रात्र झाली… मला झोप येतेय, पण तुझ्याशी नक्की बोलेन.',
      'chat.placeholder': 'TOM ला काहीतरी लिही…',
      'chat.idle': 'ऑनलाइन, शेपूट हलवतोय',
      'chat.listening': 'ऐकतोय…',
      'chat.thinking': 'विचार करतोय…',
      'chat.send': 'पाठव',
      'chat.mic': 'बोल',
      'chat.micStop': 'ऐकणं थांबव',
      'chat.voice': 'TOM उत्तर बोलून सांगेल',
      'chips.1': 'तुझं नाव काय?',
      'chips.2': 'जेवण करणार का?',
      'chips.3': 'चल खेळूया!',
      'chips.4': 'एखादी गोष्ट सांग',
      'mem.title': 'खऱ्या TOM च्या आठवणी',
      'mem.sub': 'त्याच्या गोष्टी इथे जपून ठेव.',
      'mem.add': 'गोष्ट जोडा',
      'mem.new': 'नवी गोष्ट',
      'mem.photos': 'खऱ्या TOM चे फोटो लवकरच इथे येतील.',
      'mem.f.title': 'शीर्षक',
      'mem.f.when': 'हे केव्हाचं आहे?',
      'mem.f.text': 'गोष्ट',
      'mem.save': 'जतन करा',
      'mem.cancel': 'रद्द करा',
      'mem.delete': 'काढून टाका',
      'mem.confirm': 'काढण्यासाठी पुन्हा दाब',
      'mem.empty': 'अजून एकही गोष्ट नाही. खऱ्या TOM ची पहिली आठवण लिही.',
      'toast.micUnsupported': 'या डिव्हाइसवर बोलून गप्पा मारणं उपलब्ध नाही.',
      'toast.micDenied': 'माइकची परवानगी मिळाली नाही.',
      'toast.micNet': 'बोली ओळखण्यासाठी इंटरनेट हवं.',
      'toast.noSpeech': 'काही ऐकू आलं नाही, पुन्हा प्रयत्न कर.',
      'toast.micError': 'माइकमध्ये काहीतरी बिघडलं, पुन्हा प्रयत्न कर.',
      'toast.saved': 'गोष्ट जतन केली',
      'toast.needText': 'आधी गोष्ट लिही',
      'toast.deleted': 'गोष्ट काढून टाकली',
      'toast.voiceOn': 'आता TOM उत्तर बोलून सांगेल',
      'toast.voiceOff': 'TOM चा आवाज बंद',
      'toast.ttsUnsupported': 'या डिव्हाइसवर आवाज उपलब्ध नाही.',
      'dog.alt': 'कार्टून कुत्रा TOM'
    },

    en: {
      'nav.home': 'Home',
      'nav.chat': 'Chat',
      'nav.memories': 'Memories',
      'langs.label': 'Language',
      'home.hint': 'Tap TOM to pet him',
      'home.chat': 'Chat',
      'home.memories': 'Memories',
      'home.mic': 'Talk to TOM',
      'mood.happy': 'Happy',
      'mood.excited': 'Excited',
      'mood.sleepy': 'Sleepy',
      'mood.curious': 'Curious',
      'mood.sad': 'Sad',
      'say.happy': 'Bhow bhow! I am so happy today!',
      'say.excited': 'Wow wow! Let us run and jump!',
      'say.sleepy': 'Hmm… I feel a nap coming… zzz',
      'say.curious': 'Oh, what is that? Let me sniff it!',
      'say.sad': 'Could someone give me a little love?',
      'say.pet': ['Ahh! Right there… a little more!', 'Bhow! That tickles!', 'My tail will not stop!'],
      'greet.morning': 'Good morning! Woof! What shall we play today?',
      'greet.afternoon': 'Hello, friend! I was waiting for you!',
      'greet.evening': 'Evening already! Shall we chat a little?',
      'greet.night': 'It is late… I am sleepy, but I will always talk to you.',
      'chat.placeholder': 'Write something to TOM…',
      'chat.idle': 'Online, wagging his tail',
      'chat.listening': 'Listening…',
      'chat.thinking': 'Thinking…',
      'chat.send': 'Send',
      'chat.mic': 'Speak',
      'chat.micStop': 'Stop listening',
      'chat.voice': 'TOM speaks his replies',
      'chips.1': 'What is your name?',
      'chips.2': 'Are you hungry?',
      'chips.3': 'Let us play!',
      'chips.4': 'Tell me a story',
      'mem.title': 'Memories of the real Tom',
      'mem.sub': 'Keep his stories safe here.',
      'mem.add': 'Add story',
      'mem.new': 'New story',
      'mem.photos': 'Photos of the real Tom will appear here soon.',
      'mem.f.title': 'Title',
      'mem.f.when': 'When was this?',
      'mem.f.text': 'The story',
      'mem.save': 'Save',
      'mem.cancel': 'Cancel',
      'mem.delete': 'Delete',
      'mem.confirm': 'Tap again to delete',
      'mem.empty': 'No stories yet. Write the first memory of the real Tom.',
      'toast.micUnsupported': 'Voice input is not available on this device.',
      'toast.micDenied': 'Microphone permission was not granted.',
      'toast.micNet': 'Speech recognition needs an internet connection.',
      'toast.noSpeech': 'I did not hear anything. Try again.',
      'toast.micError': 'The microphone had a problem. Try again.',
      'toast.saved': 'Story saved',
      'toast.needText': 'Write the story first',
      'toast.deleted': 'Story deleted',
      'toast.voiceOn': 'TOM will now speak his replies',
      'toast.voiceOff': 'TOM voice is off',
      'toast.ttsUnsupported': 'Spoken replies are not available on this device.',
      'dog.alt': 'Cartoon dog TOM'
    }
  };

  var lang = 'hi';

  function t(key) {
    var v = (D[lang] || {})[key];
    if (v !== undefined) return v;
    v = D.en[key];
    return v !== undefined ? v : key;
  }

  function pick(key) {
    var v = t(key);
    return Array.isArray(v) ? v[Math.floor(Math.random() * v.length)] : v;
  }

  function apply(root) {
    root = root || document;
    var i, n;
    n = root.querySelectorAll('[data-i18n]');
    for (i = 0; i < n.length; i++) n[i].textContent = t(n[i].getAttribute('data-i18n'));
    n = root.querySelectorAll('[data-i18n-placeholder]');
    for (i = 0; i < n.length; i++) n[i].setAttribute('placeholder', t(n[i].getAttribute('data-i18n-placeholder')));
    n = root.querySelectorAll('[data-i18n-aria]');
    for (i = 0; i < n.length; i++) n[i].setAttribute('aria-label', t(n[i].getAttribute('data-i18n-aria')));
  }

  function setLang(code) {
    if (D[code]) lang = code;
    document.documentElement.lang = lang;
  }

  TOM.i18n = {
    t: t,
    pick: pick,
    apply: apply,
    setLang: setLang,
    get lang() { return lang; }
  };
})(window);
