# OpenClaw BiDi Formatter

An OpenClaw plugin for readable mixed-direction WhatsApp messages. It fixes
the *display* of RTL/LTR text at the final outbound delivery boundary, without
reversing, translating, or otherwise changing the logical message text.

For WhatsApp-originated agent turns, it also adds a fixed, channel-specific
authoring rule before the model writes: prefer unordered bullets over numbered
lists and write the base-direction prose before any mixed-direction technical
term. This rule is unconditional for WhatsApp; it does not inspect, classify,
or rewrite message content.

> **Scope:** WhatsApp outbound text only. Other channels are deliberately not
> enabled until they have their own client-level compatibility tests.

## Quick install

The package is public on npm as
[`@roeej/openclaw-bidi-formatter`](https://www.npmjs.com/package/@roeej/openclaw-bidi-formatter).
Install the latest published release directly:

```sh
openclaw plugins install npm:@roeej/openclaw-bidi-formatter
openclaw plugins inspect openclaw-bidi-formatter --runtime --json
```

`plugins install` registers and enables the plugin. Restart the OpenClaw
Gateway if it was already running when the plugin was installed. To update a
managed install later, use `openclaw plugins update openclaw-bidi-formatter`.

For local development, use `openclaw plugins install --link /absolute/path/to/openclaw-bidi-formatter`.

See [docs/INSTALL.md](docs/INSTALL.md) for verification and troubleshooting.

## Give this prompt to an agent

Give the following to an agent that is authorized to install OpenClaw plugins:

```text
Install the latest public npm release of OpenClaw BiDi Formatter for outbound
WhatsApp messages:

openclaw plugins install npm:@roeej/openclaw-bidi-formatter

Do not modify the package source or add directional Unicode markers manually.
Report whether the install completed and restart the OpenClaw Gateway if the
runtime requires it to load the plugin.
```

This installs the package; it does not ask the agent to test or modify the
formatter. The recipient's normal approval policy for external installations
should still apply.

## Behaviour

- Determines one base direction for the whole visible prose message, not for
  each line independently. A heading beginning with `Release`, for example,
  cannot make a predominantly Hebrew message LTR.
- Uses Unicode 17.0 BiDi classes — not language/script regexes — to determine
  the dominant direction of the whole prose message. In an RTL message it adds
  an RLM (`U+200F`) at the start of every prose paragraph, establishing an RTL
  base even when a Markdown heading begins with an English label. Embedded LTR
  runs use LRI (`U+2066`) and PDI (`U+2069`); an LTR message gets the symmetric
  RLI (`U+2067`) and PDI treatment for embedded RTL. This supports every
  Unicode RTL script and LTR writing systems such as Greek, Cyrillic, CJK and
  Latin.
- Leaves inline Markdown code and fenced code untouched, preserving copied
  commands and source code exactly.
- Is idempotent: delivery retries do not stack extra control characters.
- Uses `reply_payload_sending` for normal replies and `message_sending` for
  explicit calls to the OpenClaw `message` tool.
- Uses `before_prompt_build` for WhatsApp-originated turns only, adding stable
  authoring guidance that prefers `•` bullets over ordered lists and keeps
  natural-language context before technical LTR terms. Other channels do not
  receive this prompt contribution.

The control characters are intentionally invisible. They alter only layout;
copying a normal prose message may include them. Code spans and fenced code
blocks are deliberately left byte-for-byte unchanged.

## Verify

```sh
npm test
```

## Releases and npm

GitHub Actions runs the test suite and validates the npm tarball on every push
and pull request. Every non-release commit to `main` automatically increments
the patch version, commits that bump, creates its `v<version>` tag and GitHub
Release, then publishes the package publicly to npm. For example, a commit
when the package is at `0.1.0` releases `0.1.1`.

The plugin has no runtime npm dependencies. It requires OpenClaw 2026.7.1 or
newer and is intended for a current Unicode-aware WhatsApp client.
