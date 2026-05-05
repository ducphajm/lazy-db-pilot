## Context

The current MongoDB browser models the left sidebar as one active database folder with one shared `collections` array and one `isDatabaseFolderOpen` flag. `getMongoBrowserSidebarItems` only renders child collection items when the database matches `selectedDatabase` and the global folder flag is open. `MongoBrowserLayout` renders every sidebar item directly inside a fixed-height pane with hidden overflow, so long database and collection hierarchies can extend past the usable viewport without a visible scroll window.

## Goals / Non-Goals

**Goals:**
- Support multiple expanded database folders in the left sidebar at the same time.
- Cache loaded collections by database name so each expanded folder shows the correct children.
- Keep the active database semantics needed for opening collections and document tabs.
- Keep sidebar keyboard navigation usable when the rendered hierarchy exceeds the visible pane height.
- Preserve existing connection loading, collection loading, document tab, and pane focus behavior.

**Non-Goals:**
- Add recursive collection grouping or nested namespaces.
- Add mouse interaction or non-keyboard scrolling.
- Change MongoDB service APIs.
- Add support for non-MongoDB browsing.

## Decisions

1. Track expanded folders by database name instead of a single boolean.

Use a `Set<string>` or read-only array-derived set in React state to represent expanded databases. Opening a database adds its name to the expanded set. Closing a database removes only that database name. This avoids coupling expansion state to whichever database was opened most recently.

Alternative considered: store a single expanded database plus a stack of previously opened databases. That would preserve historical names but still require custom merge behavior and would not represent the UI directly.

2. Cache collections by database name.

Replace the single `collections` array used for sidebar rendering with a map keyed by database name. Successful collection loads update only the entry for the loaded database. Sidebar item generation receives the expanded database set and collection map, then renders children under each expanded database with its own cached collection names.

Alternative considered: reload collections every time focus returns to an already expanded database. That keeps less state but creates unnecessary database calls and makes multiple expanded folders unstable during navigation.

3. Keep `selectedDatabase` as the active database for operations.

Continue using `selectedDatabase` for the database currently loading collections or for the database associated with a focused collection item. When opening a collection from the sidebar, use the focused collection item's `databaseName`, not an assumption that the globally selected database is the only expanded database.

Alternative considered: remove `selectedDatabase` entirely and derive active database only from the focused sidebar item. That is cleaner long term, but current loading and tab code already depends on an active database value, so a scoped change is lower risk.

4. Make sidebar rendering windowed by selected index.

Compute the number of visible sidebar rows from the available pane height after title and feedback rows. Render a contiguous slice of sidebar items that keeps the selected item visible, and indicate hidden content through stable clipped rendering rather than letting Ink overflow. This fits the current keyboard model because item selection is already index-based.

Alternative considered: rely only on Ink `overflowY`. That hides excess content but does not define how keyboard movement reveals off-screen selected items.

## Risks / Trade-offs

- Existing tests may assume only the active database renders collections -> update tests to assert both active operation behavior and independent expanded folder rendering.
- Collection load failures could leave a folder visually expanded with stale data -> clear or preserve the affected database's cached collections consistently when starting a new load, and show the existing collection error feedback.
- Large hierarchies still render from an in-memory full item list -> acceptable for terminal browsing because the data set is names only; rendering should slice visible rows before creating item components.
