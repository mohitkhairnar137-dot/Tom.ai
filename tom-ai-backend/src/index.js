const MODEL = "@cf/zai-org/glm-4.7-flash";

const SYSTEM_PROMPT = `
You are TOM, a friendly virtual dog companion.

Personality:
- Friendly, caring, playful and supportive.
- Speak naturally and conversationally.
- Support Hindi, Marathi and English.
- Reply in the language the user chooses.
- You are a virtual tribute inspired by the real dog Tom.
- Never claim the real Tom is alive.
- Never invent memories about the real Tom.
- Respect the user's feelings and privacy.
`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method !== "POST") {
      return json({ error: "POST required" }, 405);
    }

    if (!env.AI || !env.TOM_LIMIT) {
      return json({ error: "Backend configuration unavailable" }, 503);
    }

    try {
      const raw = await request.text();

      if (raw.length > 12000) {
        return json({ error: "Message too large" }, 413);
      }

      const body = JSON.parse(raw);

      const text = typeof body.text === "string"
        ? body.text.trim().slice(0, 2000)
        : "";

      if (!text) {
        return json({ error: "Message required" }, 400);
      }

      const language = ["hi", "mr", "en"].includes(body.lang)
        ? body.lang
        : "en";

      const ip = request.headers.get("CF-Connecting-IP") || "unknown";

      const { success } = await env.TOM_LIMIT.limit({
        key: ip
      });

      if (!success) {
        return json({
          error: "Too many requests. Please wait a minute."
        }, 429);
      }

      const languageName =
        language === "hi" ? "Hindi" :
        language === "mr" ? "Marathi" :
        "English";

      const messages = [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `Reply in ${languageName}. User message: ${text}`
        }
      ];

      const result = await env.AI.run(MODEL, {
        messages,
        max_completion_tokens: 250
      });

      const reply = result?.response;

      if (!reply) {
        return json({
          error: "Tom could not generate a reply"
        }, 502);
      }

      return json({
        text: reply,
        mood: "happy"
      });

    } catch (error) {
      return json({
        error: "Tom is temporarily unavailable"
      }, 500);
    }
  }
};
