## Context

The MongoDB browser currently loads collection documents after a collection is selected and renders them with `DocumentTable`. That table-oriented display works for compact scalar values, but it becomes harder to inspect one document at a time when fields contain nested objects, arrays, or many keys.

The app already has keyboard navigation patterns for vertical selectable lists and Vim-style back navigation. The document view should reuse those interaction expectations while keeping collection loading and persistence unchanged.

## Goals / Non-Goals

**Goals:**
- Replace the loaded-document table presentation with vertically stacked document cards.
- Show each document's fields vertically inside its card.
- Track a selected document and highlight that card with a distinct color.
- Support moving the selected document with existing vertical navigation keys.
- Preserve current loading, empty, error, and `h` back-navigation behavior.

**Non-Goals:**
- Changing MongoDB query behavior, document limit, sorting, filtering, or pagination.
- Editing, deleting, or expanding documents.
- Changing saved connection, database, or collection navigation behavior.

## Decisions

- Use a dedicated document-card list component instead of extending `DocumentTable`.
  - Rationale: the new layout is document-first rather than column-first, so a separate component keeps rendering logic focused and avoids table-specific branching.
  - Alternative considered: add a card mode to `DocumentTable`; rejected because the table component's column and cell alignment logic would no longer match the desired UI.

- Keep document selection local to the collection data view.
  - Rationale: selection is presentation state and should reset naturally when a different collection is loaded.
  - Alternative considered: store selected document index in broader app phase state; rejected because it is not needed outside the loaded-document screen.

- Reuse `j` and `k` for selected-document movement.
  - Rationale: selectable vertical lists already use these keys, and document cards form another vertical list.
  - Alternative considered: add new document-specific shortcuts; rejected because it would make navigation inconsistent.

- Continue formatting nested object and array values as indented multi-line JSON inside the card field value.
  - Rationale: this preserves existing readability improvements while removing table-width constraints.
  - Alternative considered: collapse nested values to one line; rejected because it regresses inspection of structured documents.

## Risks / Trade-offs

- Large documents may create tall cards -> Keep rendering simple and preserve the existing 25-document limit.
- Color-only selection can be ambiguous in some terminals -> Combine distinct color with a visible selected-card marker or border treatment where supported by the existing UI primitives.
- Keyboard handling could conflict with global quit/back controls -> Keep `q`, `Ctrl+C`, and `h` behavior unchanged and only handle `j`/`k` movement within the loaded-document view.
