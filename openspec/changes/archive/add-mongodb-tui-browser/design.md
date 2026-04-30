## Context

The project is intended to become a terminal database viewer built with TypeScript, React, Node.js, pnpm, and `@inkjs/ui`. The first usable milestone is MongoDB-only: prompt for a MongoDB connection URL, list available databases, let the user select one database, and render that database's collections in the terminal UI. SQLite support is intentionally deferred, but the MongoDB path should be structured so later database adapters can be added without rewriting the TUI flow.

## Goals / Non-Goals

**Goals:**

- Provide a TUI entry flow that accepts a MongoDB URL from the user.
- Connect to MongoDB using the official Node.js driver.
- Load and display database names available through the connection.
- Allow the user to select one database.
- Load and display collection names for the selected database.
- Show clear loading, empty, and error states.
- Keep database access separate from React/Ink presentation components.

**Non-Goals:**

- SQLite support in the first version.
- Browsing documents, schemas, indexes, or collection statistics.
- Persisting connection URLs or connection history.
- Authentication management beyond accepting whatever credentials are embedded in the MongoDB URL.
- Editing database data.

## Decisions

### Use the MongoDB URL as the only first-version input

The TUI will ask for a single MongoDB connection string and will not add separate host, database, username, or password prompts in this version. The MongoDB driver already understands standard connection strings, including credentials, replica sets, TLS options, and query parameters.

Alternative considered: collecting connection settings through multiple form fields. That would make simple cases more verbose and would duplicate parsing already handled by the driver.

### Select the database after connecting

The TUI will list databases available through the submitted MongoDB URL and let the user select one before loading collections. The URL may include a database path, but the first version will not require or automatically lock onto that path; database choice happens in the TUI after connection.

Alternative considered: requiring the URL to include a database path. That is too restrictive for the intended flow because users may connect to a server or replica set first and inspect databases before choosing one.

### Separate connection logic from TUI components

MongoDB operations will live behind small service functions such as `listMongoDatabases(url): Promise<string[]>` and `listMongoCollections(url, databaseName): Promise<string[]>`. The Ink components will own input, loading, database selection, and rendering states, while the service owns client creation, database retrieval, collection retrieval, and cleanup.

Alternative considered: performing MongoDB driver calls directly inside the top-level component. That is faster to sketch but harder to test and harder to extend when SQLite support is added.

### Close MongoDB clients after each database operation

The first version only needs snapshots of database and collection names, so the MongoDB client should be closed after each list operation succeeds or fails. Long-lived connections can be introduced when the TUI supports deeper navigation or refresh behavior.

Alternative considered: keeping the connection open for the entire TUI session. That is premature for a collection-only view and increases cleanup complexity.

## Risks / Trade-offs

- Connection URLs can contain credentials → avoid logging or echoing the full URL after submission; display sanitized error context only.
- Network or authentication failures can be slow → show a loading state while connecting, listing databases, and listing collections; return driver errors as concise user-facing messages.
- Database listing may return no visible user databases → show an empty database-list state and allow the user to enter a new URL.
- Later SQLite support needs a different connection model → keep provider-specific logic behind a service boundary and avoid baking MongoDB assumptions into generic UI labels where practical.
