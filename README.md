# TOM AI

A cartoon Indian stray dog companion for Android. Version 0.1: interface and navigation.

- Home screen with an animated cartoon TOM (tail wag, blinking, ears, 5 tappable moods, petting with hearts)
- Chat with TOM in Hindi, Marathi or English (offline playful replies for now)
- Microphone button (the phone's own speech recogniser) and optional spoken replies
- Memories: save stories about the real Tom on the device
- Light and dark theme, phone-sized layout, Android back button works
- No paid APIs, no accounts, no analytics

## Get the APK

The APK has not been built yet. This folder is a complete Android project, and these are the three ways to build it.

### A. GitHub (nothing to install)

1. Create a new GitHub repository and upload everything in this folder (keep the `.github` folder).
2. Open the repository's **Actions** tab, choose **Build APK**, press **Run workflow** (it also runs on every push).
3. When it finishes (about 5 minutes), open the run and download the **tom-ai-apk** artifact. Unzip it to get `app-debug.apk`.
4. Copy the APK to your phone and open it. Android will ask you to allow installs from this source.

### B. Android Studio

1. Open the `android` folder in Android Studio (it downloads what it needs).
2. Choose **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. The file is `android/app/build/outputs/apk/debug/app-debug.apk`.

### C. Command line

Needs JDK 17 and the Android SDK (API 34).

```
cd android
./gradlew assembleDebug
```

This is a debug-signed APK, fine for installing on your own phone. A Play Store release needs your own signing key.

## Folder map

```
www/                      the whole app (HTML, CSS, JS); packaged into the APK as assets
  index.html              screens: Home, Chat, Memories
  css/styles.css          warm theme, light and dark, TOM's animations
  js/config.js            languages, storage keys, list of real-Tom photos
  js/i18n.js              all Hindi / Marathi / English text
  js/dog.js               the cartoon dog (SVG) and his moods
  js/brain.js             TOM's personality and replies (offline for now)
  js/voice.js             microphone and speech, behind one small interface
  js/memories.js          stories about the real Tom (saved on the device)
  js/app.js               navigation and wiring
  js/providers/           example of plugging in AI later
android/                  native Android shell (a WebView plus a speech bridge)
  app/src/main/java/com/tomai/app/MainActivity.java
.github/workflows/        builds the APK on GitHub
```

You can also test the app on a computer: open `www/index.html` in Chrome. The microphone only works inside the APK or in Chrome on Android.

## Adding the real Tom's photos

1. Put the photos in `www/assets/tom/`.
2. List them in `www/js/config.js`:
   `realTomPhotos: ['assets/tom/tom-1.jpg', 'assets/tom/tom-2.jpg']`
3. They appear at the top of the Memories screen. The cartoon dog is drawn in `www/js/dog.js`; once the photos are in, that file is the one to redo so TOM looks like the real Tom.

## Adding AI voice and conversation later

The app only talks to two small interfaces, so nothing else needs to change.

- **Conversation**: `TOM.brain.setProvider(fn)`. `fn({ text, lang, history, memories })` returns `{ text, mood }`. See `www/js/providers/remote.example.js`. Keep the API key on your own server, never inside the app. If the call fails, TOM falls back to his offline replies. The `memories` argument already carries the stories saved about the real Tom.
- **Voice**: `TOM.voice.useEngine(engine)` swaps in a cloud speech-to-text or a custom TOM voice. The engine shape is documented at the top of `www/js/voice.js`.

## Notes

- Voice input uses the phone's Google speech service. It usually needs internet, and Hindi and Marathi quality depends on the phone.
- Spoken replies need a Hindi or Marathi voice installed in the phone's text-to-speech settings. If none is installed, TOM stays silent instead of reading Hindi in an English voice.
- The Baloo 2 and Mukta fonts load from Google Fonts when online. Offline, the phone's own fonts are used.
- Not yet tested on a physical phone. Test the voice button first.
