import assert from "node:assert/strict";
import { LRI, PDI, RLM } from "./bidi-normalizer.mjs";
import { registerBidiOutboundHooks } from "./plugin-hooks.mjs";

const hooks = new Map();
registerBidiOutboundHooks({ on: (name, handler) => hooks.set(name, handler) });

const reply = hooks.get("reply_payload_sending")(
  { channel: "whatsapp", payload: { text: "מצאתי OpenClaw Gateway חדש." } },
  { channelId: "whatsapp" }
);
assert.equal(reply.payload.text, `${RLM}מצאתי ${LRI}OpenClaw Gateway${PDI} חדש.`);

assert.equal(hooks.get("reply_payload_sending")(
  { channel: "telegram", payload: { text: "מצאתי OpenClaw Gateway חדש." } },
  { channelId: "telegram" }
), undefined);

const explicitSend = hooks.get("message_sending")(
  { content: "התקנתי v2026.7.1 בהצלחה." },
  { channelId: "whatsapp" }
);
assert.equal(explicitSend.content, `${RLM}התקנתי ${LRI}v2026.7.1${PDI} בהצלחה.`);

const whatsappPrompt = hooks.get("before_prompt_build")(
  { prompt: "סכם", messages: [] },
  { messageProvider: "whatsapp" }
);
assert.match(whatsappPrompt.appendSystemContext, /unordered bullets/u);
assert.match(whatsappPrompt.appendSystemContext, /Do not manually insert Unicode/u);

assert.equal(hooks.get("before_prompt_build")(
  { prompt: "Summarize", messages: [] },
  { messageProvider: "telegram" }
), undefined);

console.log("PASS hooks: WhatsApp prompt guidance, automatic reply, explicit send, WhatsApp-only scope");
