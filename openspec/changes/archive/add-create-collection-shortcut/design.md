## Context

The MongoDB browser uses a split terminal layout. The left sidebar owns database and collection selection, database folder expansion, and collection opening, while the right Documents view owns opened collection tabs and document-level commands.

The existing document creation shortcut is implemented as contextual browser state, with input handling starting a draft and service functions performing MongoDB writes. Collection creation should follow the same shape, but it belongs to the left sidebar because the target is the focused database rather than an active collection tab.

## Goals / Non-Goals

**Goals:**
- Let users press `a` from the left-side Databases view to create a collection for the focused database.
- Keep the draft scoped to the selected connection and focused database.
- Validate that the submitted collection name is non-empty before creating the collection.
- Create the collection through a MongoDB service function and refresh the selected database's collection list after success.
- Preserve existing left-sidebar keys for navigation, database expansion, collection opening, and back navigation.

**Non-Goals:**
- Add collection options, validators, indexes, capped collection settings, or time-series settings.
- Add collection rename, duplicate, or delete behavior.
- Add a global create-collection command outside the MongoDB browser left sidebar.
- Change collection opening semantics from the left sidebar.

## Decisions

- Add collection creation as a left-sidebar browser mode rather than a top-level app phase.
  - Rationale: creation depends on the focused database and should preserve the split browser context.
  - Alternative considered: use a new app phase. That would separate the draft from sidebar state and require more focus restoration.

- Only start collection creation when the left sidebar is focused and a database item is focused.
  - Rationale: the selected database is explicit in that state and avoids ambiguity when a collection row is focused.
  - Alternative considered: allow `a` on collection rows and infer the parent database. That is convenient but makes the command less clearly tied to database-level creation.

- Represent the draft as a single collection-name text input and require a non-empty trimmed name before submit.
  - Rationale: MongoDB collection creation requires a name, and advanced options are outside this change.
  - Alternative considered: add a form for createCollection options. That adds complexity without being necessary for the shortcut.

- Add a MongoDB service function for `createCollection` instead of performing creation inside React state handlers.
  - Rationale: existing database operations are isolated behind service functions and tested there.
  - Alternative considered: call the MongoDB driver directly from the app component. That would bypass existing error mapping and make UI tests more coupled to the driver.

- After successful creation, reload the focused database's collection list using the existing collection loading path.
  - Rationale: reloading keeps the sidebar consistent with server state and any MongoDB naming/order behavior.
  - Alternative considered: append the new collection name locally. That is faster but can drift from server ordering and does not prove creation succeeded through the list path.

## Risks / Trade-offs

- Invalid or duplicate collection names can leave users in the draft state -> Show concise validation or MongoDB error feedback and keep `Escape` available to cancel.
- Reloading after creation can be slower than local insertion -> Reuse existing loading/error states so the sidebar remains consistent.
- The focused database can change while a draft exists -> Scope the draft to the database name captured when the draft starts and refresh that database after success.
- The `a` key may conflict with future left-side commands -> Handle it only in the left sidebar when a database row is focused and no draft editor is active.
