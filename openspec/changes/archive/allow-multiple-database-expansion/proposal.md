## Why

The MongoDB browser left sidebar currently behaves like a single-open-folder tree: opening one database collapses or replaces the previously opened database's collections. Users need to inspect multiple databases at once, and long database or collection lists need to remain navigable within the sidebar.

## What Changes

- Allow multiple database folders in the left sidebar to be expanded at the same time.
- Keep each expanded database's loaded collections visible under that database until the user closes that specific folder or leaves the active connection.
- Make the left sidebar scroll within the available terminal height when its content exceeds the visible pane.
- Preserve existing keyboard behavior for opening databases, closing database folders, opening collections, switching panes, and returning to saved connections.
- No breaking changes.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mongodb-tui-browser`: Expand left sidebar browsing requirements to support multiple open database folders and scrollable long sidebar content.

## Impact

- Affects MongoDB browser state management in `src/App.tsx`.
- Affects sidebar item derivation and navigation helpers in `src/app/mongodbBrowser.ts`.
- Affects left sidebar rendering and viewport behavior in `src/app/MongoBrowserLayout.tsx`.
- Requires focused tests for multiple expanded databases, per-database collection display, folder close behavior, and sidebar scrolling.
