## 1. Connection Model and Persistence

- [x] 1.1 Add connection domain types with enums for database type and environment.
- [x] 1.2 Implement connection validation for required name, unique name, supported type, supported environment, MongoDB URL details, and empty Redis/SQLite details.
- [x] 1.3 Implement filesystem persistence under `~/.lazy-db-pilot` with directory creation, JSON read/write, and invalid-record handling.
- [x] 1.4 Add unit tests for connection validation and persistence behavior using an isolated test directory.

## 2. Reusable TUI List Navigation

- [x] 2.1 Extract reusable selectable list behavior that supports arrow keys, `j`/`k`, Enter, and `l`.
- [x] 2.2 Update the database list to use the reusable selectable list behavior.
- [x] 2.3 Add tests proving `j` moves focus down, `k` moves focus up, and list bounds are respected.

## 3. Connection Creation UI

- [x] 3.1 Add TUI phases for loading saved connections, listing saved connections, and creating a connection.
- [x] 3.2 Implement connection creation prompts for name, database type, environment, and MongoDB URL when MongoDB is selected.
- [x] 3.3 Persist valid MongoDB, Redis, and SQLite connections and return them to the selectable connection list.
- [x] 3.4 Show validation errors for empty names, duplicate names, unsupported values, and invalid MongoDB URLs.

## 4. MongoDB Browsing from Saved Connections

- [x] 4.1 Load databases using the selected saved MongoDB connection URL.
- [x] 4.2 Preserve credential-safe display for saved connection URLs in loading, list, success, and error states.
- [x] 4.3 Let users return from database empty/error states to saved connection selection or connection creation.
- [x] 4.4 Display unsupported database type messages for Redis and SQLite connection selections without connecting.

## 5. Verification

- [x] 5.1 Update existing App tests for the saved-connection startup flow.
- [x] 5.2 Add integration-style TUI tests for creating a MongoDB connection and browsing databases.
- [x] 5.3 Run `pnpm verify` and fix failures.
