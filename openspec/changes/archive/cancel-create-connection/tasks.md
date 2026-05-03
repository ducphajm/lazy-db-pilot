## 1. Tests

- [x] 1.1 Add an app test for canceling connection creation with existing saved connections, asserting the saved list returns and no save occurs.
- [x] 1.2 Add an app test for canceling connection creation with no saved connections, asserting the form is cleared and no save occurs.
- [x] 1.3 Add or update form rendering assertions for concise `Escape` cancel help text.

## 2. Implementation

- [x] 2.1 Add an `onCancel` callback to `ConnectionForm` and invoke it when the form receives `Escape`.
- [x] 2.2 Pass an `onCancelConnectionForm` handler through `AppView` from `App`.
- [x] 2.3 In `App`, clear draft, pending connection, validation error, and route to the saved connection list when connections exist.
- [x] 2.4 Keep no-saved-connections cancellation on the clean connection creation path.

## 3. Verification

- [x] 3.1 Run the focused app tests for connection creation cancellation.
- [x] 3.2 Run the project test suite and typecheck with pnpm.
