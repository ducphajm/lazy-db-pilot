## Context

The MongoDB browser uses a split terminal layout: the left sidebar owns database and collection navigation, and the right data container owns collection document display. Today the right side represents one selected collection at a time, so opening another collection replaces the previous document view.

The new behavior keeps the split layout but changes the right data container into a tabbed document workspace. Each opened collection has its own tab state, including loaded documents, selected document index, loading, empty, and error states.

## Goals / Non-Goals

**Goals:**
- Allow multiple collection document views to stay open at the same time.
- Reuse an existing tab when the user opens a collection that is already open.
- Let the user close the active tab with `x`.
- Keep keyboard navigation predictable between the left sidebar, tab strip, and active document content.
- Keep tab state in local TUI state; no persistence is required.

**Non-Goals:**
- Persist open tabs across application restarts.
- Add editable document tabs.
- Add drag-reordering or mouse-only tab controls.
- Change MongoDB query semantics or the default document limit.

## Decisions

- Represent right-side documents as an ordered collection tab array plus an active tab id.
  - Rationale: ordered state maps directly to rendering and tab navigation.
  - Alternative considered: keep a map keyed by database and collection only. That improves lookup but still needs ordering and an active key, so it adds complexity without removing state.

- Use a stable tab identity derived from connection, database, and collection.
  - Rationale: collection names can repeat across databases, and database names can repeat across connections.
  - Alternative considered: identify tabs by collection name only. That would merge unrelated collections with the same name.

- Opening an already-open collection activates its existing tab instead of creating a duplicate.
  - Rationale: this prevents accidental tab spam while still preserving loaded data.
  - Alternative considered: always create a new tab. That enables duplicate query snapshots, but the current UI has no separate query controls to justify duplicates.

- Keep `x` scoped to the right data container for closing the active tab.
  - Rationale: `x` is requested as the tab close key and avoids changing left-sidebar navigation semantics.
  - Alternative considered: close tabs from any focused container. That is faster but can surprise users who are navigating the sidebar.

- Preserve existing document card navigation inside the active tab.
  - Rationale: the tab feature should not change how users inspect documents once a tab is active.

## Risks / Trade-offs

- Active tab can be closed while loading -> cancel or ignore the stale load result by checking the tab id before applying results.
- Many open tabs can exceed terminal width -> render a compact tab strip and keep the active tab visible in the available width.
- Database selection previously cleared right-side data -> keep tabs until explicitly closed, so users do not lose document views when browsing another database.
