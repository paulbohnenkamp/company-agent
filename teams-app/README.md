# Business Agent Teams app package

This directory contains the source template for the minimal Business Agent Teams bot
package. The package builder renders deployment values and creates the ZIP that
Teams accepts.

The package does not host the bot and does not contain business logic. Teams
delivers activities to the HTTPS adapter endpoint. The adapter calls the
ASP.NET Core agent request API.

## Build a package

Supply the real bot application ID, a separate Teams app ID, the public web
URL, the HTTPS adapter endpoint, and two PNG icon files:

```sh
npm run teams:package -- \
  --app-id <teams-app-guid> \
  --bot-app-id <bot-app-guid> \
  --endpoint https://example.test/api/messages \
  --web-url https://example.test \
  --color-icon path/to/color.png \
  --outline-icon path/to/outline.png
```

Use `--validate-only` to validate the rendered manifest and icon inputs without
creating a ZIP. Do not upload the package until the bot registration and public
adapter endpoint work.

The generated ZIP is written to `dist/landops-teams-app.zip`, which is ignored
by Git.

The current template is version 1.0.1 and displays Business Agent. Preserve app
and bot IDs when updating an existing installation. A generated ZIP is not proof
of tenant installation; follow [tenant adoption](../docs/tenant-naming-adoption.md).
