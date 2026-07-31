import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { registerBidiOutboundHooks } from "./plugin-hooks.mjs";

export default definePluginEntry({
  id: "openclaw-bidi-formatter",
  name: "OpenClaw BiDi Formatter",
  description: "Formats mixed RTL/LTR WhatsApp messages using Unicode isolates.",
  register: registerBidiOutboundHooks,
});
