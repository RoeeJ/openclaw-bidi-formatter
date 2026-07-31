// Unicode BiDi display normalizer for OpenClaw's WhatsApp outbound path.
// It preserves logical text; its only additions are invisible isolate controls.
import { RTL_STRONG_RANGES } from "./rtl-strong-ranges.generated.mjs";

export const LRI = "\u2066"; // LEFT-TO-RIGHT ISOLATE
export const RLI = "\u2067"; // RIGHT-TO-LEFT ISOLATE
export const FSI = "\u2068"; // FIRST-STRONG ISOLATE
export const PDI = "\u2069"; // POP DIRECTIONAL ISOLATE
export const RLM = "\u200F"; // RIGHT-TO-LEFT MARK

const EXISTING_ISOLATE = /[\u2066\u2067\u2068\u2069]/;
const LETTER = /\p{Letter}/u;
const NUMBER = /\p{Number}/u;
const TRAILING_NEUTRAL = /[\p{White_Space}\p{Punctuation}]/u;
const PUNCTUATION = /\p{Punctuation}/u;

function isRtlStrong(codePoint) {
  let low = 0;
  let high = RTL_STRONG_RANGES.length - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    const [start, end] = RTL_STRONG_RANGES[middle];
    if (codePoint < start) high = middle - 1;
    else if (codePoint > end) low = middle + 1;
    else return true;
  }
  return false;
}

// Unicode's DerivedBidiClass data guarantees every Letter is strong L, R or
// AL. The generated table supplies R/AL; all remaining Unicode letters are L.
function strongDirection(character) {
  if (isRtlStrong(character.codePointAt(0))) return "rtl";
  if (LETTER.test(character)) return "ltr";
  return null;
}

function dominantDirection(parts) {
  let rtl = 0;
  let ltr = 0;
  let first = null;
  for (const part of parts) {
    // Count directional *tokens*, not individual letters. Otherwise a single
    // technical term such as "OpenClaw Gateway" outweighs the surrounding
    // Hebrew just because it contains more characters; a URL is also one
    // token rather than three words split by punctuation.
    for (const token of part.split(/\s+/u)) {
      for (const character of token) {
        const direction = strongDirection(character);
        if (!direction) continue;
        first ??= direction;
        if (direction === "rtl") rtl += 1;
        else ltr += 1;
        break;
      }
    }
  }
  if (rtl === ltr) return first;
  return rtl > ltr ? "rtl" : "ltr";
}

function oppositeRunDirection(baseDirection, character) {
  const direction = strongDirection(character);
  if (direction && direction !== baseDirection) return direction;
  // Digits are weak (not paragraph-defining) but render as an LTR run in an
  // RTL paragraph, so they need the same isolation as a version or date.
  if (baseDirection === "rtl" && NUMBER.test(character)) return "ltr";
  return null;
}

function oppositeRunDirectionAt(characters, index, baseDirection) {
  const direct = oppositeRunDirection(baseDirection, characters[index]);
  if (direct) return direct;

  // Keep immediately attached Markdown delimiters, path separators and
  // brackets with the following opposite-direction phrase. Whitespace is not
  // absorbed, so ordinary word spacing remains part of the base paragraph.
  let lookahead = index;
  while (lookahead < characters.length && PUNCTUATION.test(characters[lookahead])) lookahead += 1;
  return lookahead > index && lookahead < characters.length
    ? oppositeRunDirection(baseDirection, characters[lookahead])
    : null;
}

function isolateOppositeRuns(line, baseDirection) {
  const characters = Array.from(line);
  if (!baseDirection || EXISTING_ISOLATE.test(line)) return line;

  let output = "";
  for (let index = 0; index < characters.length;) {
    const runDirection = oppositeRunDirectionAt(characters, index, baseDirection);
    if (!runDirection) {
      output += characters[index++];
      continue;
    }

    const start = index;
    index += 1;
    while (index < characters.length && strongDirection(characters[index]) !== baseDirection) index += 1;

    let isolatedEnd = index;
    while (isolatedEnd > start && TRAILING_NEUTRAL.test(characters[isolatedEnd - 1])) isolatedEnd -= 1;
    const isolate = runDirection === "rtl" ? RLI : LRI;
    output += isolate + characters.slice(start, isolatedEnd).join("") + PDI;
    output += characters.slice(isolatedEnd, index).join("");
  }
  return output;
}

function splitFencedCode(text) {
  return text.split(/(```[\s\S]*?```)/g);
}

function normaliseProse(part, baseDirection) {
  return part.split("\n").map((line) => {
    if (!line) return line;
    const normalised = line.split(/(`[^`\n]*`)/g).map((segment) => {
      if (segment.startsWith("`")) return segment;
      return isolateOppositeRuns(segment, baseDirection);
    }).join("");
      // In plain-text WhatsApp there is no dir="rtl" container. A leading RLM
      // establishes the base level for each display paragraph, including a
      // Markdown heading that happens to begin with an English word.
    return baseDirection === "rtl" && !normalised.startsWith(RLM)
      ? RLM + normalised
      : normalised;
  }).join("\n");
}

/**
 * Isolates opposite-direction runs using Unicode BiDi strong classes, rather
 * than language or script regexes. Code spans/fences stay byte-for-byte
 * identical. The function is idempotent across delivery retries.
 */
export function normaliseMixedBidi(text) {
  if (typeof text !== "string" || text.length === 0) return text;
  const parts = splitFencedCode(text);
  const prose = parts.filter((part) => !part.startsWith("```")).map((part) =>
    part.replace(/`[^`\n]*`/g, ""));
  const baseDirection = dominantDirection(prose);
  return parts.map((part) => {
    if (part.startsWith("```")) return part;
    return normaliseProse(part, baseDirection);
  }).join("");
}

export function visualiseControls(text) {
  return text
    .replaceAll(LRI, "<LRI>")
    .replaceAll(RLI, "<RLI>")
    .replaceAll(FSI, "<FSI>")
    .replaceAll(PDI, "<PDI>")
    .replaceAll(RLM, "<RLM>");
}
