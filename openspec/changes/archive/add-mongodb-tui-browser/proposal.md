## Why

Developers need a fast terminal interface for inspecting databases without leaving their shell. The first version should establish a focused MongoDB browsing path before expanding to additional database engines such as SQLite.

## What Changes

- Add a terminal UI flow that prompts the user for a MongoDB connection URL.
- Connect to MongoDB using the provided URL and display available databases.
- Allow the user to select a database, then display all collections in that database in the TUI.
- Scope the first version to MongoDB only while keeping the direction compatible with later SQLite support.
- Handle connection and collection-loading errors with clear terminal feedback.

## Capabilities

### New Capabilities

- `mongodb-tui-browser`: Covers entering a MongoDB URL, listing databases, selecting a database, and viewing that database's collections in the terminal UI.

### Modified Capabilities

- None.

## Impact

- Affected code: CLI/TUI entrypoint, MongoDB connection layer, database-list and collection-list presentation components, and error handling.
- Dependencies: MongoDB Node.js driver if not already present.
- Systems: Local terminal runtime and externally reachable MongoDB instances supplied by the user.
