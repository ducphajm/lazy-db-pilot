## 1. Sidebar State Model

- [x] 1.1 Replace single database folder open state with per-database expanded state in `src/App.tsx`.
- [x] 1.2 Replace single sidebar collection list state with a collection cache keyed by database name.
- [x] 1.3 Update database open, close, reset, and connection switching paths to preserve or clear expanded state correctly.
- [x] 1.4 Ensure collection opening uses the focused sidebar collection item's database name.

## 2. Sidebar Item Generation

- [x] 2.1 Update `getMongoBrowserSidebarItems` to render children for every expanded database.
- [x] 2.2 Keep collection item keys and labels stable across multiple expanded databases.
- [x] 2.3 Update sidebar index clamping so focus remains valid after opening and closing one database folder.

## 3. Scrollable Left Sidebar Rendering

- [x] 3.1 Compute visible sidebar row capacity from the left pane height after title and feedback content.
- [x] 3.2 Render a selected-index-aware slice of sidebar items so the focused item remains visible during `j` and `k` navigation.
- [x] 3.3 Ensure long sidebar content stays inside the left pane and does not overlap the right pane or footer controls.

## 4. Tests

- [x] 4.1 Add application tests that expand multiple databases and verify each database displays its own collections.
- [x] 4.2 Add tests that closing one expanded database leaves other expanded databases open.
- [x] 4.3 Add browser layout tests for selected-item visibility when sidebar content exceeds the visible pane height.
- [x] 4.4 Run `pnpm test` and relevant type/lint checks.
