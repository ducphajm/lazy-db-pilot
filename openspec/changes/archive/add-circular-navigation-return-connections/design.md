## Context

The TUI uses shared selectable list rendering for saved connections, recovery choices, databases, and collections. It also has a separate document card selection state for loaded collection data. Existing `j`/`k` behavior clamps at the first and last item, while `h` already moves back from collection views to parent views.

## Goals / Non-Goals

**Goals:**

- Wrap `j`/`k` navigation at list boundaries.
- Keep document card selection consistent with list navigation when documents are displayed.
- Let users return from the loaded database list to the saved connection list.
- Show concise in-UI help for the database-list back key.

**Non-Goals:**

- Changing persisted connection data.
- Adding browser support for Redis or SQLite.
- Adding multi-level history beyond the existing parent-view navigation model.

## Decisions

- Reuse existing Vim-style `h` semantics for returning from databases to saved connections. This matches the current `h` behavior from collections to databases and from documents to collections.
- Implement circular movement in shared list-selection logic so all selectable vertical lists receive the same boundary behavior.
- Update document card movement separately because document selection is managed outside the shared list component.
- Add help text directly in the database-list view so the return path is visible at the point where it applies.

## Risks / Trade-offs

- Users accustomed to clamped list behavior may overshoot and wrap unexpectedly. Mitigation: circular navigation is consistent across list views and matches the requested Vim-style browsing behavior.
- Adding `h` at the database list must not discard saved connections. Mitigation: return to the existing saved connection list state instead of reloading or clearing persisted records.
