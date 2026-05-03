## Context

The existing Ink app models MongoDB browsing as a sequence of phases: database list, collection list, document loading, and document display. That keeps state simple, but it hides parent context once the user enters a collection and makes document browsing feel disconnected from the database and collection hierarchy.

The redesigned browser should keep MongoDB hierarchy and document data visible together after databases are loaded. The app already has state for selected connection, databases, selected database, collections, selected collection, documents, and selected document index, so the implementation can reuse the existing data-loading operations and evolve the rendering/navigation model.

## Goals / Non-Goals

**Goals:**

- Render a split MongoDB browser with a left hierarchy container and a right document container.
- Show database names and collection names in a folder-like hierarchy in the left sidebar.
- Load and show documents for the selected collection in the right container.
- Support `Ctrl+h`, `Ctrl+j`, `Ctrl+k`, and `Ctrl+l` as container-level navigation.
- Preserve existing `j`/`k` item navigation, `Enter`/`l` collection selection, `q`/`Ctrl+C` quit behavior, and credential-safe display.

**Non-Goals:**

- Add write operations, filtering, pagination, query editing, or document mutation.
- Add support for non-MongoDB browsers.
- Change connection persistence or MongoDB service APIs.
- Preserve old separate database, collection, and document screens as a compatibility mode.

## Decisions

- Introduce an explicit browser focus enum for major containers.
  - Rationale: fixed container names are a closed set and should be represented with an enum rather than strings. This keeps `Ctrl+h/j/k/l` behavior centralized and testable.
  - Alternative considered: infer focus from phase. That becomes fragile because the split browser keeps multiple regions visible in the same browsing phase.

- Render the hierarchy and documents from shared browser state instead of duplicating fetched data.
  - Rationale: databases, collections, selected database, selected collection, and documents already exist in `App`. Reusing that state avoids new caches and keeps loading/error paths small.
  - Alternative considered: introduce a nested tree data model. That is unnecessary while collections are loaded for one selected database at a time.

- Keep MongoDB service functions unchanged.
  - Rationale: the redesign is a UI and navigation change. Existing `loadDatabases`, `loadCollections`, and `loadCollectionDocuments` already supply the needed data.
  - Alternative considered: add a combined hierarchy-loading API. That would broaden the change and fetch more data than the current interaction requires.

- Use the left sidebar as the source of database and collection selection.
  - Rationale: this matches the folder-like mental model and keeps database context visible while documents render on the right.
  - Alternative considered: keep separate database and collection screens. That does not satisfy the split browser requirement.

- Treat plain `h` and `l` in the left sidebar as folder close/open controls.
  - Rationale: the redesigned sidebar is a hierarchy, so lateral Vim keys should collapse and expand the active database folder instead of leaving the browser.
  - The user returns to the saved connection list by focusing the left sidebar and pressing Backspace.

- Move focus to the right data container after a collection is selected with `Enter` or `l`.
  - Rationale: loaded, empty, loading, and error document states belong to the right container, and document navigation should be immediately available there when applicable.

## Risks / Trade-offs

- Terminal width may be narrow -> constrain the left sidebar width and allow document content to wrap or truncate consistently.
- Ink input handlers may conflict between global and focused containers -> route `Ctrl+h/j/k/l` globally, keep `j`/`k`/`Enter` scoped to the active container, use plain `h`/`l` for left-sidebar folder close/open, and use Backspace from the focused left sidebar to return to saved connections.
- Empty/error states may lose context inside the split layout -> render loading, empty, and error feedback in the right container when a collection is selected and in the overall screen when database loading fails.
- App files may exceed the 500-line limit while adding layout logic -> extract browser layout and navigation helpers into smaller modules.
