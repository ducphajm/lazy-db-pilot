## Why

Users can browse documents in the right-side Documents view, but they do not have a keyboard path to create a new document for the selected collection from that context. Adding a single-key shortcut keeps document creation close to the collection being inspected.

## What Changes

- Add an `a` shortcut in the right-side Documents view to start creating a new document for the active collection tab.
- Scope the new document to the selected connection, database, and collection represented by the active collection tab.
- Keep existing document navigation, tab navigation, close-tab, and back-navigation keys intact.
- Provide clear creation state handling so users can submit or cancel the new document draft without losing the active collection context.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mongodb-tui-browser`: Add right-side Documents view keyboard behavior for creating a new document in the active collection.

## Impact

- Affects TUI keyboard input handling for the right data container.
- Affects MongoDB service behavior by adding document insertion for a selected collection.
- Affects document tab state and right-side Documents view rendering for create-document draft, submit, cancel, success, and failure states.
- Affects tests covering MongoDB service operations, application input handling, and document view rendering.
