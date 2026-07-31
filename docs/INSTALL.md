# Installation and verification

## Prerequisites

- OpenClaw 2026.7.1 or newer.
- WhatsApp configured in that OpenClaw instance.

## Install from npm

Install the latest public release:

```sh
openclaw plugins install npm:@roeej/openclaw-bidi-formatter
openclaw plugins inspect openclaw-bidi-formatter --runtime --json
```

The inspection output should report the plugin as enabled and loaded. If the
Gateway was already running, restart it after the install so it loads the new
plugin code.

## Verify WhatsApp behavior

Send a single long, mixed-direction WhatsApp message containing a URL, a
version, parentheses, and a Markdown code span. Check that:

- Hebrew/Arabic prose keeps its expected reading order.
- URLs, versions, file paths, and English phrases do not pull surrounding
  punctuation out of place.
- The code span can be copied exactly.
- Links remain tappable in the target WhatsApp client.

The plugin is intentionally idempotent, so delivery retries do not accumulate
extra directional controls.

## Update or remove

```sh
# Update the managed package to the latest release allowed by its source.
openclaw plugins update openclaw-bidi-formatter

# Disable it without uninstalling.
openclaw plugins disable openclaw-bidi-formatter
```

Use OpenClaw's normal plugin-management commands for removal if it is no
longer needed. Do not delete plugin directories manually while the Gateway is
running.

## Troubleshooting

- **404 from npm:** check that the package name is exactly
  `@roeej/openclaw-bidi-formatter` and that the host can reach
  `registry.npmjs.org`.
- **Plugin is installed but has no effect:** check the runtime inspection,
  restart the Gateway, and confirm the message is sent through WhatsApp. The
  plugin deliberately does nothing for other channels.
- **Unexpected layout in a particular client:** retain the original logical
  text, capture a minimal example, and test it before adding a narrow rule.
  Do not solve it by reversing text or by inserting legacy override controls.
