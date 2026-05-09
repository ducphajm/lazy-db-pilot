## 1. MongoDB Service

- [x] 1.1 Add a typed MongoDB insert-document service function using the driver collection `insertOne` API.
- [x] 1.2 Map insert failures through existing MongoDB service error handling.
- [x] 1.3 Add service tests for successful insertion and insert failure mapping.

## 2. Create Document State

- [x] 2.1 Add app state for an active create-document draft scoped to a collection document tab id.
- [x] 2.2 Add JSON object parsing and validation for create-document submission.
- [x] 2.3 Add submit, cancel, success, and failure handlers that preserve the active collection tab context.

## 3. Right-Side Documents UI

- [x] 3.1 Handle `a` in the right data container when an active collection tab exists and no draft editor is active.
- [x] 3.2 Render a create-document editor in the Documents view with validation and insertion error feedback.
- [x] 3.3 Ensure `Escape` cancels the draft and submit inserts only valid JSON object content.
- [x] 3.4 Refresh the active collection tab after successful insertion so inserted documents render with server-generated fields.

## 4. Verification

- [x] 4.1 Add app/input tests for starting creation with `a`, submitting valid JSON, rejecting invalid JSON, canceling with `Escape`, and ignoring `a` with no active tab.
- [x] 4.2 Add or update rendering tests for the create-document editor and error states.
- [x] 4.3 Run `pnpm verify`.
