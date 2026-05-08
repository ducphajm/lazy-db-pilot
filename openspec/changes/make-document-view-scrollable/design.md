## Context

The MongoDB browser renders a split terminal layout with a left hierarchy pane and a right Documents pane. The left sidebar already computes a visible row window to keep navigation bounded inside the pane. The right Documents pane currently renders the active tab's document cards inside a hidden-overflow container, so large documents or many stacked cards can be rendered but not fully inspected.

## Goals / Non-Goals

**Goals:**
- Keep the right Documents pane bounded by the existing split layout.
- Add vertical scrolling for the active document tab's content when rendered document cards exceed the visible pane height.
- Keep a visible active cursor on the selected document card.
- Use `j` and `k` for Neovim-like line-by-line vertical movement through rendered document content.
- Use `Ctrl+u` and `Ctrl+d` for page up and page down within the rendered document content.

**Non-Goals:**
- Add mouse scrolling or non-keyboard scrolling.
- Add pagination, filtering, query controls, or change the document load limit.
- Add card-level independent scrolling for nested JSON values.
- Change tab navigation or left sidebar navigation behavior.

## Decisions

- Track a scroll window for the active right-side document list rather than relying only on Ink overflow.
  - Rationale: hidden overflow clips content but does not define how keyboard navigation reveals off-screen cards. An explicit viewport can keep selected cards visible in the same way the left sidebar does.
  - Alternative considered: switch the container to Ink `overflowY="visible"`. That would allow content to escape the pane and collide with footer or adjacent layout.

- Scope scroll state per document tab.
  - Rationale: each tab already owns selected document, loading, empty, and error state. Keeping the visible document offset with the tab prevents switching tabs from losing the user's position in another collection.
  - Alternative considered: one shared scroll offset for the right pane. This is simpler but creates surprising jumps when moving between tabs with different document sizes.

- Use `j` and `k` to move the Documents view cursor line-by-line through rendered document content, field by field where fields render as single lines.
  - Rationale: the Documents view should behave like Neovim vertical movement. The selected document has the active cursor on it, and moving the cursor scrolls the bounded viewport as needed.
  - Alternative considered: keep `j` and `k` as document-to-document selection only. That would leave a single tall document partly inaccessible without adding a second movement mode.

- Use `Ctrl+u` and `Ctrl+d` as page up and page down for the Documents view.
  - Rationale: this matches Neovim-style document browsing and provides faster movement through large rendered documents without changing tab navigation or sidebar navigation.

## Risks / Trade-offs

- Variable-height document cards make exact row-window calculation more complex -> Prefer a small helper that measures rendered field preview line counts consistently with `DocumentCardList` and slices whole cards when possible.
- Very tall single document cards can exceed the pane height -> Keep the pane bounded and allow `j`/`k` plus `Ctrl+u`/`Ctrl+d` to reveal the full rendered card content through the tab's scroll window.
- Scroll state can become stale when a tab reloads documents -> Reset or clamp the tab's document scroll offset whenever documents, selected index, or active tab content changes.
