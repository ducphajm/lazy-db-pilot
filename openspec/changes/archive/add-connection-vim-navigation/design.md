## Context

The current TUI starts at a MongoDB URL prompt, validates the URL, loads databases, and then loads collections for the selected database. Database list navigation already supports arrow keys and `l`, while collection views support `h` to return to the database list. There is no persisted connection model, connection list, or application data directory.

This change adds a local connection registry under `~/.lazy-db-pilot` and uses saved MongoDB connections as the entry point for browsing. The implementation should stay within the existing TypeScript, React, Ink, Node.js, and pnpm stack.

## Goals / Non-Goals

**Goals:**
- Persist user-created database connection records under `~/.lazy-db-pilot`.
- Add connection fields for name, database type, environment, and type-specific details.
- Support MongoDB, Redis, and SQLite connection creation.
- Support MongoDB browsing from a saved MongoDB connection.
- Define database type and environment as TypeScript enums.
- Add `j` and `k` navigation anywhere the TUI presents a selectable vertical list.

**Non-Goals:**
- Connecting to Redis or SQLite.
- Encrypting connection data at rest.
- Preserving the previous startup flow as the primary user path.
- Syncing connection settings across machines.

## Decisions

1. Store connections in a JSON file under `~/.lazy-db-pilot`.

   Rationale: A JSON file is easy to inspect, test, and update with Node.js standard APIs. The app is local-first and does not need a database for its own settings.

   Alternative considered: one file per connection. That adds directory traversal, duplicate-name reconciliation across files, and more filesystem edge cases without clear benefit for the current scale.

2. Model connection type and environment with enums.

   Rationale: The accepted values are fixed sets and project rules require enums for fixed constants. This also keeps validation centralized and prevents ad hoc string comparisons in UI code.

   Alternative considered: string literal unions. They are type-safe, but they do not satisfy the project rule for fixed constants.

3. Keep connection details type-specific.

   Rationale: MongoDB needs a URL now, while Redis and SQLite can be created but cannot connect yet. Redis and SQLite records should use empty type-specific details until their browsers define the required fields. A discriminated connection model prevents forcing unrelated fields into every connection.

   Alternative considered: a single generic `url` field for every database type. That is simpler initially but weakens validation for SQLite and future connection types.

4. Introduce reusable list navigation behavior.

   Rationale: `j`/`k`, arrow keys, and selection behavior should be consistent for connection lists, database lists, and future selectable lists. Shared behavior also limits regressions when adding new list screens.

   Alternative considered: adding `j`/`k` directly to the existing database list only. That would satisfy part of the request but leave new connection lists inconsistent.

5. Allow Redis and SQLite connection creation without connection attempts.

   Rationale: The fixed database type set includes Redis and SQLite, and users should be able to create those saved records now. Selecting those records displays an unsupported database type message and does not attempt to connect.

   Alternative considered: limiting creation to MongoDB only. That conflicts with the requested supported type set and would make Redis and SQLite records possible only through hand-edited storage.

## Risks / Trade-offs

- Plaintext connection storage may expose credentials in MongoDB URLs if the user includes them. -> Keep credential-safe rendering in the TUI and document that storage is local plaintext until an encryption requirement is added.
- JSON file writes can be interrupted. -> Write through a temporary file and rename it into place.
- Duplicate connection names can make selection ambiguous. -> Reject duplicates during connection creation.
- Saved MongoDB connections may fail when selected. -> Display a concise failure message for the selected connection and let the user return to connection selection or creation.
- Introducing connection screens can grow `App.tsx` beyond the file size limit. -> Split persistence, types, validation, and reusable list UI into separate modules during implementation.
