## 1. Browser State And Navigation

- [x] 1.1 Add a fixed enum for MongoDB browser containers and store the active container in app state.
- [x] 1.2 Add global handling for `Ctrl+h`, `Ctrl+j`, `Ctrl+k`, and `Ctrl+l` while the split MongoDB browser is active.
- [x] 1.3 Scope existing `j`/`k`/`Enter`/`l` item navigation so it applies only to the focused browser container.
- [x] 1.4 Update `h` behavior from the document container to move focus back to the left sidebar without clearing loaded hierarchy state.
- [x] 1.5 Add left-sidebar Backspace navigation back to the saved connection list.
- [x] 1.6 Add left-sidebar `h`/`l` handling to close and open database folders.

## 2. Split Browser UI

- [x] 2.1 Extract a MongoDB browser layout component with left sidebar and right data container regions.
- [x] 2.2 Render database names as folder-like sidebar items and render loaded collections as child items under the selected database.
- [x] 2.3 Render collection loading, empty, and error feedback without leaving the split browser layout.
- [x] 2.4 Render document loading, empty, error, and loaded document card states in the right data container.
- [x] 2.5 Add a visual focus indicator for the active browser container.

## 3. Data Flow

- [x] 3.1 Preserve existing database loading through saved MongoDB connections.
- [x] 3.2 Load collections when a database is selected from the left sidebar and clear stale document data.
- [x] 3.3 Load documents with the existing default limit when a collection child item is selected with `Enter` or `l`, then focus the right data container.
- [x] 3.4 Keep credential-safe display behavior in all new loading and error messages.

## 4. Tests

- [x] 4.1 Update app tests for database selection, expanded collection display, and split layout rendering.
- [x] 4.2 Add tests for `Ctrl+h`, `Ctrl+j`, `Ctrl+k`, and `Ctrl+l` container navigation.
- [x] 4.3 Update collection document tests so document navigation only occurs when the right data container is focused.
- [x] 4.4 Add regression tests for collection/document loading, empty states, error states, and back navigation in the split layout.
- [x] 4.5 Add tests for left-sidebar `h`/`l` folder close/open behavior and Backspace return to saved connections.

## 5. Verification

- [x] 5.1 Run `pnpm test`.
- [x] 5.2 Run the project typecheck or build command if available.
- [x] 5.3 Confirm edited TypeScript/TSX files stay under the 500-line limit.
