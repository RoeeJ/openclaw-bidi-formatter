# Prompt for an agent to install the plugin

Give this to an agent that is authorized to install OpenClaw plugins on its
host:

```text
Install the latest public npm release of OpenClaw BiDi Formatter for outbound
WhatsApp messages:

openclaw plugins install npm:@roeej/openclaw-bidi-formatter

Do not modify the package source or add directional Unicode markers manually.
Report whether the install completed and restart the OpenClaw Gateway if the
runtime requires it to load the plugin.
```

This prompt installs the package; it does not ask the agent to test or modify
the formatter. Installation downloads third-party code, so the recipient's
normal installation-approval policy should still apply.
