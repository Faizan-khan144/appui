const STYLE_HINTS = {
  Photorealistic: "photorealistic, 50mm, natural skin tones, shallow depth of field",
  Cinematic: "cinematic still, anamorphic lens flare, teal and orange grade",
  "3D render": "3D render, octane, soft global illumination, subsurface scattering",
  Anime: "anime key visual, cel shading, dynamic line work",
  Illustration: "editorial illustration, textured brushwork, bold shapes",
  "Oil painting": "oil on canvas, visible impasto, rich texture",
  Watercolor: "watercolor, soft bleeding edges, paper grain",
  Minimal: "minimalist, negative space, single focal subject",
  Vintage: "vintage film, halation, fine grain, faded highlights",
  Cyberpunk: "cyberpunk, neon signage, wet reflective streets",
};

const LIGHT_HINTS = {
  "Golden hour": "warm golden-hour light, long soft shadows",
  "Blue hour": "cool blue-hour ambience, magenta sky",
  "Soft studio": "softbox studio lighting, gentle falloff",
  Dramatic: "dramatic chiaroscuro, single hard key light",
  "Neon glow": "neon rim light, coloured spill",
  "Overcast": "diffused overcast daylight, even exposure",
  Backlit: "strong backlight, glowing rim, atmospheric haze",
};

const MOOD_HINTS = {
  Serene: "calm and serene",
  Bold: "bold and striking",
  Dreamy: "dreamy and ethereal",
  Melancholic: "quiet and melancholic",
  Playful: "playful and whimsical",
  Epic: "epic and cinematic",
  Mysterious: "mysterious and atmospheric",
};

const LENS_HINTS = {
  "35mm": "35mm lens, environmental context",
  "50mm": "50mm lens, natural perspective",
  "85mm": "85mm portrait lens, compressed background",
  Macro: "macro lens, extreme close detail",
  "Wide 24mm": "24mm wide angle, deep perspective",
  Telephoto: "200mm telephoto, flattening compression",
  Drone: "aerial drone view, top-down",
};

function pick(map, key) {
  return key && map[key] ? map[key] : key || "";
}

export function demoImagePrompt(idea, opts = {}) {
  const bits = [];
  bits.push(idea.trim());
  if (opts.style) bits.push(pick(STYLE_HINTS, opts.style));
  if (opts.lighting) bits.push(pick(LIGHT_HINTS, opts.lighting));
  if (opts.mood) bits.push(pick(MOOD_HINTS, opts.mood));
  if (opts.lens) bits.push(pick(LENS_HINTS, opts.lens));
  if (opts.palette) bits.push(`${opts.palette} colour palette`);
  bits.push("highly detailed, sharp focus, professional composition");

  const core = bits.filter(Boolean).join(", ");
  const target = opts.model || "Midjourney";

  if (target === "DALL·E") {
    return `${idea.trim()} Rendered as ${opts.style ? opts.style.toLowerCase() : "a detailed image"}, with ${
      opts.lighting ? opts.lighting.toLowerCase() : "natural lighting"
    } and a ${opts.mood ? opts.mood.toLowerCase() : "clear"} mood.\n\nNegative: blurry, low detail, distorted proportions, text artifacts, watermark.`;
  }

  if (target === "Flux") {
    return `A ${opts.mood ? opts.mood.toLowerCase() + " " : ""}${idea.trim()}, ${
      opts.style ? opts.style.toLowerCase() + ", " : ""
    }${opts.lighting ? opts.lighting.toLowerCase() + ", " : ""}richly detailed, professional quality.\n\nNegative: blur, artifacts, extra limbs, watermark.`;
  }

  if (target === "Stable Diffusion") {
    return `${core}, masterpiece, best quality, ultra detailed\n\nNegative: lowres, blurry, bad anatomy, extra fingers, jpeg artifacts, watermark, text.`;
  }

  const ar = opts.aspect && opts.aspect !== "1:1" ? ` --ar ${opts.aspect}` : " --ar 1:1";
  return `${core}${ar} --style raw --v 6 --no text, watermark, logo, distorted hands`;
}

const RE_GREET = /\b(hi|hello|helo+|helloo+|hey+|hii+|yo|sup|hlo|salam|assalam|aoa)\b/i;
const RE_THANKS = /\b(thanks|thank you|shukriya|thx|ty|shukria)\b/i;
const RE_WHO = /\b(who (made|built|created|developed|owns) (you|this)|who are you|what are you|your (maker|creator|developer)|kisne banaya|kis ne banaya|tumhe kisne|kaun banaya)\b/i;
const RE_IMAGE = /\b(image|prompt|midjourney|dall-?e|stable diffusion|flux|art|render|portrait|photo)\b/i;
const RE_CODE = /\b(code|function|javascript|js|react|python|css|html|api|bug|error|async|await|array|loop|regex)\b/i;
const RE_HOWTO = /\b(how (to|do|can|does)|what is|kaise|steps|guide|plan|help me|explain)\b/i;

export function demoReply(messages) {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const q = (last?.content || "").trim();

  if (/^Idea:/m.test(q)) {
    const idea = q.match(/Idea:\s*(.+)/)?.[1] || "";
    const grab = (label) => q.match(new RegExp(`^${label}:\\s*(.+)`, "m"))?.[1];
    return demoImagePrompt(idea, {
      style: grab("Style"),
      lighting: grab("Lighting"),
      lens: grab("Camera / lens"),
      mood: grab("Mood"),
      palette: grab("Colour palette"),
      aspect: grab("Aspect ratio"),
      model: grab("Target model"),
    });
  }

  if (RE_WHO.test(q)) {
    return `I'm **Appui** — an AI assistant built by **Faizan**. 👋\n\nI can chat, reason, write and debug code, and turn ideas into polished image prompts. What would you like to do?`;
  }

  if (RE_GREET.test(q) && q.length < 24) {
    return `Hey! 👋 Good to see you.\n\nI'm **Appui**, built by **Faizan**. Right now I'm offline (no connection to the backend), but everything around me works: streaming, markdown, code blocks and chat history.\n\nI'll connect automatically as soon as the backend is reachable. What do you want to try meanwhile?`;
  }

  if (RE_THANKS.test(q) && q.length < 30) {
    return `Anytime! 🙂 That's what I'm here for.`;
  }

  if (RE_IMAGE.test(q)) {
    const idea = q.replace(/^(write|make|create|generate|give me|a|an)\s+/i, "").slice(0, 120);
    return `Here's a ready-to-paste prompt:\n\n${
      demoImagePrompt(idea || "your idea", { style: "Cinematic", lighting: "Golden hour", mood: "Epic", aspect: "16:9" })
    }\n\n_This one is composed locally — with a live key I'd tailor it to your exact wording._`;
  }

  if (RE_CODE.test(q)) {
    return `Here's how that kind of code looks in Appui:\n\n\`\`\`js\n// a tiny example\nconst greet = (name) => \`Hello, \${name}!\`;\nconsole.log(greet("Appui"));\n\`\`\`\n\nI'm offline at the moment, so this is a sample rather than a tailored answer. I'll give you the real thing the moment I'm back online.`;
  }

  if (RE_HOWTO.test(q)) {
    return `Quick answer to **“${q.slice(0, 90)}”**:\n\n1. **Do the simplest thing that works** first — no clever detours.\n2. **Check it** as soon as you can so problems surface early.\n3. **Improve** only what needs improving.\n\nI'm offline right now, so that's a general skeleton. Reconnect and I'll tailor it to your exact question.`;
  }

  return `Here's my take on **“${q.slice(0, 90) || "that"}”**.\n\nI'm **Appui**, built by **Faizan**. I'm offline at the moment, so this is a placeholder — but streaming, markdown, code blocks and history are all working.\n\n**Meanwhile, try:**\n- \`/studio\` — build an image prompt offline\n- Switching models in the composer\n- Image prompt mode: “a lighthouse in a storm”`;
}

export async function* demoStream(text, signal) {
  const tokens = text.match(/\S+\s*/g) || [text];
  for (const t of tokens) {
    if (signal?.aborted) return;
    await new Promise((r) => setTimeout(r, 18 + Math.random() * 34));
    yield t;
  }
}
