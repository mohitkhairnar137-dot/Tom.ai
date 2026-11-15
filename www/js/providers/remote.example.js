/* Example only. This file is NOT loaded by index.html.
 *
 * To connect a real AI later:
 *   1. Run your own small backend that holds the API key and calls the AI.
 *      Never put an API key inside the app. Anyone can unpack an APK.
 *   2. Copy this file to js/providers/remote.js, set the URL below.
 *   3. Add <script src="js/providers/remote.js"></script> after js/brain.js
 *      in index.html.
 *
 * If the request fails, TOM quietly falls back to his offline replies.
 */
TOM.brain.setProvider(async function (ctx) {
  var res = await fetch('https://YOUR-BACKEND.example.com/tom/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: ctx.text,
      lang: ctx.lang,                       // 'hi' | 'mr' | 'en'
      history: ctx.history.slice(-12),      // [{ role: 'user' | 'tom', text }]
      memories: ctx.memories                // stories about the real Tom
    })
  });
  if (!res.ok) throw new Error('chat failed');
  var data = await res.json();              // { text, mood }
  return { text: data.text, mood: data.mood || 'happy' };
});

/* A custom voice engine follows the same idea (see js/voice.js):
 *   TOM.voice.useEngine({ name, canListen, canSpeak, listen, stop, speak, cancelSpeech });
 */
