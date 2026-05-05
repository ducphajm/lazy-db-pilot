## 1. Sidebar Rendering

- [x] 1.1 Add a deterministic helper for ellipsizing sidebar collection labels to the rendered left-pane width while reserving space for the trailing `...` suffix.
- [x] 1.2 Update collection item rendering so long names display on one line with a trailing `...`.
- [x] 1.3 Ensure sidebar selection and document tab opening continue to use the full collection name, not the truncated display label.

## 2. Verification

- [x] 2.1 Add or update tests that render a long collection name and assert it appears as a single-line ellipsized child item.
- [x] 2.2 Add or update tests that open the long-named collection and verify document loading receives the full collection name.
- [x] 2.3 Add or update tests that verify a wider sidebar can display the full collection name without `...`.
- [x] 2.4 Run the focused test suite for MongoDB browser/sidebar behavior with `pnpm test`.
