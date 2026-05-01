## Why

Users can currently browse MongoDB databases and collections, but selecting a collection does not expose the documents inside it. Showing collection data immediately after entering a collection name makes the TUI useful for inspecting data without leaving the terminal.

## What Changes

- Add a collection data view that loads documents for an entered or selected collection name.
- Render loaded documents in a terminal datatable format.
- Apply a default query limit of 25 documents when loading collection data.
- Show loading, empty, and error states for collection data loading.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mongodb-tui-browser`: Add collection data loading and datatable display behavior after collection name entry or collection selection.

## Impact

- MongoDB data access layer will need a collection document query with a default limit.
- TUI state and rendering will need a collection data view and datatable component or formatting path.
- Existing collection browsing navigation and feedback behavior will need to include document loading states.
