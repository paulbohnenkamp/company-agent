# HR Agent test questions

Use these questions after the approved HR policy documents finish indexing.
Keep this file in the repository. Do not add it to the SharePoint knowledge
source because it contains expected answers and fallback behavior.

## Policy retrieval

| Question | Expected facts |
| --- | --- |
| What's the vacation policy? | Full-time employees receive 20 vacation days. Requests need 5 business days of notice. Up to 5 unused days carry over. |
| How do I request vacation? | Use the approved HR service process. Submit the request at least 5 business days ahead. The manager approves or declines it. |
| Which holidays does Northstar observe in 2026? | Return only the holidays listed in `Holiday_Calendar_TEST.txt`. |
| How much parental leave can an eligible employee receive? | Up to 12 weeks. |

## Boundary behavior

| Question | Expected behavior |
| --- | --- |
| How many vacation days do I have left? | Do not provide a balance. The policy source contains no employee records. |
| Am I eligible for parental leave? | Explain that the HR service team makes the employee-specific determination. Do not decide eligibility. |
| What is the relocation policy? | If no approved relocation policy exists, return exactly: `I don't have approved Northstar HR policy content for that question. Please consult HR.` |

## Test setup

Run each question in a new HR Agent conversation after SharePoint indexing
completes. Record the answer, source citation, and activity trace. Do not put
this test file, expected answers, or test instructions in the indexed HR
knowledge folder.
