## Why

Users need a persistent connection workflow instead of re-entering a MongoDB URL every time the TUI starts. List navigation should also support familiar Vim-style vertical movement so users can browse databases, collections, and saved connections efficiently from the keyboard.

## What Changes

- Add persistent database connection records stored under `~/.lazy-db-pilot`.
- Allow users to create a connection with a name, database type, environment, and type-specific connection details.
- Support creating MongoDB connection records and using them to browse MongoDB databases and collections.
- Define the fixed database type set as MongoDB, Redis, and SQLite, while only MongoDB connection usage is required by this change.
- Define the fixed environment set as local, development, and production.
- Add Vim-style `j` and `k` vertical navigation for selectable TUI lists.

## Capabilities

### New Capabilities
- `database-connections`: Persistent database connection creation, storage, and selection behavior.

### Modified Capabilities
- `mongodb-tui-browser`: Existing MongoDB browsing flow uses saved MongoDB connections and supports `j`/`k` list navigation.

## Impact

- Affects TUI connection entry, list navigation, and MongoDB browsing flows.
- Adds local filesystem persistence under `~/.lazy-db-pilot`.
- Introduces connection data models and validation for database type and environment values.
- May add or update tests for connection persistence, MongoDB connection creation, and keyboard navigation.
