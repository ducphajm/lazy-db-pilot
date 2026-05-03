## Context

The TUI displays MongoDB collection documents through `DocumentTable`, which currently formats nested object values with compact `JSON.stringify(value)`. That string is then truncated to a fixed cell width, so nested values become a single unreadable line. Saved connections are loaded and saved through `src/connections/persistence.ts`; the app has creation and selection flows but no removal flow.

## Goals / Non-Goals

**Goals:**

- Make nested object and array values readable in collection data views without allowing long single-line JSON to overflow the terminal.
- Keep scalar table values compact.
- Add a keyboard-driven delete action for the focused saved connection.
- Confirm deletion before writing changes to disk.
- Refresh app state after deletion, including empty-list handling.

**Non-Goals:**

- Add document editing, filtering, pagination, or horizontal scrolling.
- Delete MongoDB databases, collections, or documents.
- Preserve deleted connections or add undo.
- Change the persisted connection record shape.

## Decisions

- Render nested document values as pretty JSON with two-space indentation.
  - Rationale: this uses the existing JSON representation while making nested values scannable in a terminal.
  - Alternative considered: keep table cells single-line and only increase truncation width. That still fails for nested values and small terminals.

- Contain multi-line values inside table rows by expanding each logical row into multiple visual lines and padding missing cell lines.
  - Rationale: table columns can stay aligned while nested values wrap vertically instead of overflowing horizontally.
  - Alternative considered: replace the table with one document-per-block rendering. That is more readable for nested objects but removes the existing datatable behavior required by the spec.

- Add a `deleteConnection(name)` persistence function that loads, filters by exact connection name, saves, and returns the next connection list.
  - Rationale: connection names are already unique, so the name is the current stable identifier.
  - Alternative considered: delete by list index. Indexes are UI state, not persisted identity, and are easier to apply to the wrong record after refresh.

- Add explicit app phases for delete confirmation and deleting progress.
  - Rationale: confirmation should be visible and testable, and persistence should reuse the app's existing async phase pattern.
  - Alternative considered: delete immediately on keypress. That is too easy to trigger accidentally in a keyboard-first TUI.

- Use `d` as the saved-connection-list delete key and show concise list help that names the delete key.
  - Rationale: `d` fits the app's Vim-style keyboard model and is more reliable in terminals than the physical Delete key.
  - Alternative considered: use the physical Delete key. That is less consistent across terminal environments and overlaps conceptually with text editing behavior.

## Risks / Trade-offs

- Multi-line table rows can consume more vertical space -> retain max cell width and only pretty-print nested object/array values.
- Exact-name deletion depends on unique connection names -> keep existing uniqueness validation and load-time duplicate filtering.
- Delete key conflicts can be confusing -> only handle `d` on the saved connection list when a saved connection item is focused and show concise help text there.
