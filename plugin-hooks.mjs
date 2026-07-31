import { normaliseMixedBidi } from "./bidi-normalizer.mjs";

const WHATSAPP_WRITING_GUIDANCE = `
WhatsApp writing rule: when composing prose that may mix RTL and LTR text,
prefer unordered bullets (•) over numbered lists. Keep the natural-language
context in the paragraph's base direction first; put a technical LTR term,
URL, path, identifier, or command after it. Do not manually insert Unicode
directional controls. Keep code spans and fenced code byte-for-byte intact.
`;

function rewrite(text) {
  const next = normaliseMixedBidi(text);
  return next === text ? undefined : next;
}

/** Register OpenClaw's two final-outbound delivery seams. */
export function registerBidiOutboundHooks(api) {
  // This is deliberately channel-based, not content-based: every WhatsApp
  // turn gets the same authoring guidance before it reaches the model.
  api.on("before_prompt_build", (_event, ctx) => {
    if (ctx?.messageProvider !== "whatsapp") return;
    return { appendSystemContext: WHATSAPP_WRITING_GUIDANCE };
  });

  api.on("reply_payload_sending", (event) => {
    // Runs after reply normalization and immediately before the channel adapter.
    if (event.channel !== "whatsapp" || typeof event.payload.text !== "string") return;
    const text = rewrite(event.payload.text);
    return text ? { payload: { ...event.payload, text } } : undefined;
  });

  api.on("message_sending", (event, ctx) => {
    // Covers explicit OpenClaw `message` tool sends as well as automatic replies.
    if (ctx?.channelId !== "whatsapp" || typeof event.content !== "string") return;
    const content = rewrite(event.content);
    return content ? { content } : undefined;
  });
}
