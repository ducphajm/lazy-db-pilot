## 1. Scroll State

- [x] 1.1 Add per-document-tab scroll state, active cursor position, and selected document index for the right-side Documents view.
- [x] 1.2 Reset or clamp the scroll offset and cursor position when a document tab loads, reloads, closes, or rendered content changes.
- [x] 1.3 Keep scroll and cursor state scoped so switching tabs preserves each tab's document position.

## 2. Right Pane Rendering

- [x] 2.1 Compute the visible Documents view height inside `MongoBrowserLayout` after pane title and tab strip rows.
- [x] 2.2 Render a bounded visible subset of active tab document card content inside the right data container.
- [x] 2.3 Update document card rendering helpers as needed so scroll calculations can account for document card height without using `any`.
- [x] 2.4 Ensure overflowing right-side document content does not render into the left sidebar or footer controls.

## 3. Keyboard Behavior

- [x] 3.1 Update `j` and `k` to move the active Documents cursor line-by-line through rendered document content.
- [x] 3.2 Adjust the Documents view scroll window after `j` or `k` so the active cursor remains visible and the containing document is selected.
- [x] 3.3 Add `Ctrl+u` and `Ctrl+d` page movement for the focused right data container.
- [x] 3.4 Clamp cursor movement at the first and last rendered content lines.

## 4. Verification

- [x] 4.1 Add or update tests for documents exceeding the visible right pane height.
- [x] 4.2 Add or update tests proving `j`, `k`, `Ctrl+u`, and `Ctrl+d` scroll the Documents view to keep the active cursor visible.
- [x] 4.3 Add or update tests proving right-side document content stays contained within the Documents view container.
- [x] 4.4 Run `pnpm test` and the relevant type/lint checks available in `package.json`.
