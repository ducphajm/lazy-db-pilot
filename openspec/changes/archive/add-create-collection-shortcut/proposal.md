## Why

Users can browse databases and collections from the left sidebar, but they do not have a keyboard path to create a new collection for the selected database. Adding a single-key shortcut keeps collection creation close to the database selection workflow.

## What Changes

- Add an `a` shortcut in the left-side database browser to start creating a collection for the selected database.
- Scope the new collection to the selected connection and database represented by the focused database row.
- Provide clear create-collection state handling so users can submit or cancel the collection name without losing the browser context.
- Keep existing database expansion, collection opening, focus movement, and back-navigation keys intact.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mongodb-tui-browser`: Add left-side database browser keyboard behavior for creating a collection in the selected database.

## Impact

- Affects TUI keyboard input handling for the left sidebar.
- Affects MongoDB service behavior by adding collection creation for a selected database.
- Affects database hierarchy state and left sidebar rendering for create-collection draft, submit, cancel, success, and failure states.
- Affects tests covering MongoDB service operations, application input handling, and database browser rendering.
