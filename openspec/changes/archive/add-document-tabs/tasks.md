## 1. State Model

- [x] 1.1 Replace the single right-side collection document state with ordered collection tab state and active tab id in the MongoDB browser app state.
- [x] 1.2 Add a stable tab identity based on selected connection, database, and collection.
- [x] 1.3 Preserve each tab's documents, selected document index, loading state, empty state, and error state independently.

## 2. Collection Opening

- [x] 2.1 Update collection selection from the left sidebar so `Enter` and `l` create a new tab when the collection is not open.
- [x] 2.2 Activate the existing tab when the selected collection already has an open tab.
- [x] 2.3 Keep existing tabs open when selecting another database or loading another collection.
- [x] 2.4 Ignore or discard stale document load results when their target tab was closed before loading completed.

## 3. Right Data Container UI

- [x] 3.1 Render a tab strip in `MongoBrowserLayout` for open collection tabs.
- [x] 3.2 Render the active tab's document cards, loading state, empty state, or error state in the right data container.
- [x] 3.3 Render an empty no-open-tabs state when all tabs are closed.
- [x] 3.4 Keep existing document card keyboard navigation scoped to the active tab.

## 4. Tab Controls

- [x] 4.1 Add `x` handling when the right data container is focused to close the active tab.
- [x] 4.2 After closing a tab, activate an adjacent tab when one remains.
- [x] 4.3 Preserve existing focus movement between left sidebar and right data container.

## 5. Tests

- [x] 5.1 Add app/browser tests that opening two collections creates two tabs and preserves the first tab's data.
- [x] 5.2 Add a test that opening an already-open collection activates the existing tab without duplicating it.
- [x] 5.3 Add tests that `x` closes the active tab and shows the no-open-tabs state after closing the last tab.
- [x] 5.4 Run `pnpm test` and fix regressions.
