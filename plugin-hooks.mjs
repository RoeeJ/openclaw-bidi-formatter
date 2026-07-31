import { normaliseMixedBidi } from "./bidi-normalizer.mjs";

function rewrite(text) {
  const next = normaliseMixedBidi(text);
  return next === text ? undefined : next;
}

/** Register OpenClaw's two final-outbound delivery seams. */
export function registerBidiOutboundHooks(api) {
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
