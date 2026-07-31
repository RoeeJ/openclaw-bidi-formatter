import assert from "node:assert/strict";
import { LRI, RLI, PDI, RLM, normaliseMixedBidi } from "./bidi-normalizer.mjs";

const cases = [
  ["התקנתי OpenClaw Gateway בהצלחה.", `${RLM}התקנתי ${LRI}OpenClaw Gateway${PDI} בהצלחה.`],
  ["הגרסה היא v2026.7.1 והקובץ ב-/Users/roee/app.js.", `${RLM}הגרסה היא ${LRI}v2026.7.1${PDI} והקובץ ב${LRI}-/Users/roee/app.js${PDI}.`],
  ["קרא את https://example.com/a?x=1 ואז חזור.", `${RLM}קרא את ${LRI}https://example.com/a?x=1${PDI} ואז חזור.`],
  ["תפעיל `npm run test` ואז כתוב done.", `${RLM}תפעיל \`npm run test\` ואז כתוב ${LRI}done${PDI}.`],
  ["Only English text and 123.", "Only English text and 123."],
  ["```sh\nnpm run test\n```\nואז שלח status OK.", `\`\`\`sh\nnpm run test\n\`\`\`\n${RLM}ואז שלח ${LRI}status OK${PDI}.`],
  ["בדיקה Γειά σου κόσμε ואז חזור.", `${RLM}בדיקה ${LRI}Γειά σου κόσμε${PDI} ואז חזור.`],
  ["בדיקה Привет мир ואז חזור.", `${RLM}בדיקה ${LRI}Привет мир${PDI} ואז חזור.`],
  ["Hello world שלום.", `Hello world ${RLI}שלום${PDI}.`],
  ["日本語 مرحبا بالعالم。", `${RLM}${LRI}日本語${PDI} مرحبا بالعالم。`],
  ["הגרסה 2026.7.31 זמינה.", `${RLM}הגרסה ${LRI}2026.7.31${PDI} זמינה.`],
  ["*BiDi גנרי:* הכותרת מתחילה באנגלית אבל ההודעה עברית.", `${RLM}${LRI}*BiDi${PDI} גנרי:* הכותרת מתחילה באנגלית אבל ההודעה עברית.`]
];

for (const [input, expected] of cases) {
  const actual = normaliseMixedBidi(input);
  assert.equal(actual, expected, `Unexpected result for: ${input}`);
  assert.equal(normaliseMixedBidi(actual), actual, "must be idempotent");
}

console.log(`PASS normalizer: ${cases.length} cases`);
