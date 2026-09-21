# Owner Relations Intake Integration

## Purpose

The Owner Relations Intake form captures an owner request and routes the submission through Microsoft 365 services for storage, structured tracking, and team notification.

## Microsoft 365 Destinations

- Microsoft Forms: https://forms.office.com
- Power Automate: https://make.powerautomate.com
- OneDrive for Business: https://onedrive.com
- Microsoft Teams: https://teams.cloud.microsoft
- SharePoint: accessed through the Sample Energy Company team site and its channel files area

## Workflow

1. Create and edit the Owner Relations Intake form in Microsoft Forms.
2. Create an automated cloud flow in Power Automate using the form-submission trigger.
3. Retrieve the submitted response details.
4. Create a structured item in the Owner Relations Intake SharePoint list.
5. Save the complete submitted response as an archive file in OneDrive for Business.
6. Post a selected summary to the configured Microsoft Teams channel.

## Testing

Submit a test response through the form, then verify that:

- The SharePoint list contains a new item.
- OneDrive contains the complete-response archive.
- The Teams channel contains the expected notification.
- The Power Automate run history shows successful steps.

## Notes

The SharePoint list provides structured records for future lookup and reporting. OneDrive remains the archive location for complete submissions, while Teams provides the collaboration notification.