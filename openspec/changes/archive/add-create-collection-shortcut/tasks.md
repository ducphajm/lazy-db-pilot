## 1. MongoDB Service

- [x] 1.1 Add a typed MongoDB create-collection service function using the driver database `createCollection` API.
- [x] 1.2 Add a create-collection operation enum value and map failures through existing MongoDB service error handling.
- [x] 1.3 Add service tests for successful collection creation and create failure mapping.

## 2. Create Collection State

- [x] 2.1 Add create-collection draft state scoped to the selected connection URL and focused database name.
- [x] 2.2 Add collection-name validation that rejects empty or whitespace-only names.
- [x] 2.3 Add submit, cancel, success, and failure handlers that preserve the MongoDB browser context.

## 3. Left-Side Databases UI

- [x] 3.1 Handle `a` in the left sidebar only when a database item is focused and no create-collection draft is active.
- [x] 3.2 Render a create-collection editor in the Databases pane with validation and creation error feedback.
- [x] 3.3 Ensure `Escape` cancels the draft and submit creates only valid collection names.
- [x] 3.4 Refresh the draft database's collection list after successful creation so the new collection appears in the sidebar.

## 4. Verification

- [x] 4.1 Add app/input tests for starting creation with `a`, submitting a valid name, rejecting an empty name, canceling with `Escape`, and ignoring `a` from a collection row.
- [x] 4.2 Add or update rendering tests for the create-collection editor and error states.
- [x] 4.3 Run `pnpm verify`.
