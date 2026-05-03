## 1. Document JSON Display

- [x] 1.1 Update `DocumentTable` value formatting so object and array values use indented multi-line JSON.
- [x] 1.2 Update table row rendering so multi-line cells stay aligned and do not render as one overflowing line.
- [x] 1.3 Add or update tests for nested object, array, scalar, null, undefined, Date, and ObjectId-like display values.

## 2. Connection Deletion Persistence

- [x] 2.1 Add a persistence function that deletes a connection by exact name and returns the updated connection list.
- [x] 2.2 Add persistence tests for deleting one connection, deleting the last connection, and leaving records unchanged when the name is absent.

## 3. Connection Deletion TUI

- [x] 3.1 Add app state and phases for pending deletion, delete confirmation, and deletion in progress.
- [x] 3.2 Add a saved-connection-list `d` delete key action that opens confirmation only for saved connection items and show concise delete help in the list UI.
- [x] 3.3 Implement confirm and cancel controls for the delete confirmation view.
- [x] 3.4 Refresh the saved connection list after deletion and route to connection creation when no connections remain.

## 4. Verification

- [x] 4.1 Add app-level tests for delete confirmation, cancellation, successful deletion, and deleting the last connection.
- [x] 4.2 Run `pnpm test` and `pnpm typecheck`.
