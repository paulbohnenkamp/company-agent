# Adopt the Business Agent names in Microsoft 365

Status on 2026-09-08: pending tenant access. Repository names are updated by
spec 048. Azure CLI has a session for the Azure subscription tenant, but that
credential returns AADSTS50020 in the Microsoft 365 tenant. No signed-in browser
is available to this session. None of the target changes below is claimed live.

## Existing objects and target names

| Object | Last recorded state | Target |
| --- | --- | --- |
| Tenant domain | landopsdemo.onmicrosoft.com | Retain this domain; no new slug selected |
| Organization display name | Original signup name | Sample Energy Company |
| Team | LandOps Demo | Sample Energy Company |
| Team description | LandOps demo collaboration | Sample Energy Company collaboration |
| Standard channel | landops-demo | Land |
| Other channels | General | Keep General; add Legal, Compliance, Accounting, Operations |
| Licensed Legal user | legal.demo@landopsdemo.onmicrosoft.com | Taylor Kim (Legal), taylor.kim@landopsdemo.onmicrosoft.com |
| Licensed Land user | land.demo@landopsdemo.onmicrosoft.com | Jordan Lee (Land), jordan.lee@landopsdemo.onmicrosoft.com |
| Compliance persona | Repository only | Casey Morgan (Compliance); no extra account/license in this pass |
| Teams application | Installation incomplete | Business Agent, package version 1.0.1 |

The tenant's administrator retains their existing account. Rename the two
existing licensed user objects rather than creating replacements. Their object
IDs, licenses, memberships, and existing data must remain intact. The fictional
names are display context and do not establish authorization.

## Apply after tenant access is available

1. Sign in to the existing Microsoft 365 tenant as its administrator. Verify
   the directory ID against the local deployment configuration.
2. Record the two user's object IDs, UPNs, primary email addresses, display
   names, department values, assigned licenses, and Team memberships in a private
   administrative record. Record the Team and channel IDs too.
3. Update the organization display name. Keep the domain and tenant ID.
4. Rename the existing Legal and Land user display names and departments. Set
   their usernames to the target UPNs and verify primary email/aliases separately.
   Retain their previous addresses as mail aliases where supported. An old mail
   alias is not a promise that the old sign-in will continue to work.
5. Rename the existing Team and channel, then add the department channels as
   standard channels if absent. Standard channels share Team membership; a
   department label does not create a security boundary. Keep existing privacy
   and membership settings in this naming change.
6. Finish the bot-home-tenant and API consent work in
   [live activation](teams-live-activation.md). Build the versioned package using
   the same Teams app ID and bot ID for an update, not a new identity per agent.
7. Upload/install Business Agent into the existing Team after package and
   endpoint checks pass. The visible sender is Business Agent. Agent names
   inside responses identify contributions, not separate signed-in users.

Do not run the full `provision:entra-personas --apply` command to rename these
users. That command creates a catalog of users and groups for a fresh environment;
it is not an account migration and would create additional objects.

## Verify and record

Verify sign-in with both named users. Confirm unchanged object IDs, licenses,
memberships, and access to old files/messages. Check both target email addresses
and preserved aliases in the admin center, independently of sign-in.

Confirm the Team and Land channel retain their original IDs. Verify all target
channel names, the installed package version, and the Business Agent mention
picker. Run a Legal request and a Land request, inspect the contribution names,
record a human action, and repeat an activity to test duplicate handling. Retain
the result and update project state only after these checks pass.

To roll back names, restore the recorded display names, UPNs, email settings,
Team description, and channel name on the same objects. Do not delete users,
the Team, channels with messages, or the tenant. Package rollback must use the
previous verified artifact and the installation mechanism's version rules.

## Domain limits

Microsoft permits adding another `onmicrosoft.com` fallback domain. Existing
domains cannot be renamed or deleted, and a fallback-domain change does not
rename SharePoint URLs. No new domain is part of this naming pass.
See [Microsoft's fallback-domain documentation](https://learn.microsoft.com/en-us/microsoft-365/admin/setup/add-or-replace-your-onmicrosoftcom-domain).
