# Teams tenant settings for a controlled Business Agent demo

These settings control who can discover the Team and what guests can do. They
are Microsoft 365 tenant configuration, not Business Agent business rules.

| Setting | Meaning | Recommended value |
| --- | --- | --- |
| Privacy: Private | Membership requires owner approval; this setting controls Team access. | **Private** |
| Privacy: Public | Any user in the tenant can discover and join the Team. It does not publish the Team on the public internet. | Avoid for controlled testing |
| Guest permissions | Controls what invited external guests can do with channels, files, and messages. | Disabled unless external guests are required |
| Mentions | Controls team/channel-wide mentions; a bot mention such as `@Business Agent` requires the installed app. | Verify bot installation separately |
| Member permissions | Controls actions such as creating channels, deleting messages, or adding apps. | Keep defaults; restrict app management to the owner |
| Fun settings | Controls stickers, GIFs, and memes. | Not relevant to the demo |

The minimal test setup is one private Team, one standard channel, one owner,
and two licensed sample users. The bot package is installed only after the
adapter endpoint, consent, and app permissions have been verified.

Do not commit tenant passwords, client secrets, recovery codes, or exported
tokens. Record tenant IDs and application IDs in the deployment result only
when they are needed to reproduce an environment; credentials belong in Key
Vault or the tenant's password manager.
