## 1. Navigation Behavior

- [x] 1.1 Update shared selectable list movement so `j`/down from the last item focuses the first item, and `k`/up from the first item focuses the last item.
- [x] 1.2 Update collection document card movement so `j` wraps from the last document to the first document, and `k` wraps from the first document to the last document.
- [x] 1.3 Add `h` handling from the loaded database list back to the saved connection list without restarting the TUI.

## 2. UI Help

- [x] 2.1 Add database-list help text that names `h` as the key to return to saved connections.
- [x] 2.2 Keep existing connection-list, collection-list, collection-data, and quit help text intact.

## 3. Verification

- [x] 3.1 Add or update tests for circular `j`/`k` movement in selectable lists.
- [x] 3.2 Add or update tests for circular document card movement.
- [x] 3.3 Add or update tests that pressing `h` on the database list returns to saved connections and that the UI shows the instruction.
- [x] 3.4 Run the relevant pnpm test command.
