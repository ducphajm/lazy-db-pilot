## Context

The MongoDB browser uses a split terminal layout. The left sidebar owns database and collection selection, while the right Documents view owns opened collection tabs, document navigation, tab switching, and close-tab behavior.

Document tabs already carry the active connection, database, collection, loading, empty, error, selected document, and scroll state needed to identify where a new document should be inserted. The MongoDB service currently supports listing databases, listing collections, and loading documents, but it does not expose collection document insertion.

## Goals / Non-Goals

**Goals:**
- Let users press `a` from the right-side Documents view to create a document in the active collection tab.
- Keep the draft scoped to the active tab's connection, database, and collection.
- Validate that the submitted draft is valid JSON object content before insertion.
- Insert the document through a MongoDB service function and refresh or update the active tab after success.
- Preserve existing right-side keys for navigation, tab switching, closing, and left-sidebar focus.

**Non-Goals:**
- Add schema inference, generated forms, or field-level editors.
- Add update, duplicate, or delete-document behavior.
- Add bulk insert behavior.
- Change collection opening semantics from the left sidebar.

## Decisions

- Add document creation as a right-container mode rather than a global app phase.
  - Rationale: creation depends on the active document tab and should not replace the broader MongoDB browser context.
  - Alternative considered: use a new top-level app phase. That would make routing simple but would separate the draft from tab state and increase focus-restoration work.

- Represent the draft as editable JSON text and require it to parse to a plain object before submit.
  - Rationale: MongoDB documents are object-like records and the current UI already displays raw document structure, so JSON keeps the first version compact and predictable.
  - Alternative considered: add field-by-field form controls. That adds substantial UI complexity and schema assumptions outside this change.

- Add a MongoDB service function for `insertOne` instead of performing insertion inside React state handlers.
  - Rationale: existing database operations are isolated behind service functions and tested there.
  - Alternative considered: call the MongoDB driver directly from the app component. That would bypass existing error mapping and make the UI harder to test.

- After successful insert, reload the active collection tab using the existing document loading path.
  - Rationale: reloading keeps ordering and server-generated `_id` behavior consistent with the collection query.
  - Alternative considered: append the inserted document locally. That is faster but can show an order that does not match a subsequent reload.

- Do not guarantee that the inserted document remains visible after the successful post-insert reload if the collection query does not return it.
  - Rationale: the first implementation should preserve the existing document loading behavior rather than changing query ordering or locally prepending inserted content.

## Risks / Trade-offs

- Invalid JSON or non-object JSON can trap users in the draft state -> Show concise validation feedback and keep `Escape` available to cancel.
- Reloading after insert can be slower than local append -> Reuse existing loading/error states so the UI remains consistent.
- The active tab can change while a create draft exists -> Scope the draft to the active tab id and cancel or ignore stale submissions when the active tab no longer exists.
- The `a` key may conflict with future right-side commands -> Handle it only in the right data container when an active collection tab exists and no text editor is currently focused.
