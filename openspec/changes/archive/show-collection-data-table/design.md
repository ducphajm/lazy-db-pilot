## Context

The TUI currently lets users select a saved MongoDB connection, select a database, and view collection names. The MongoDB service exposes database and collection listing functions, while `src/App.tsx` owns navigation state and `src/app/AppView.tsx` renders each phase.

This change extends collection browsing into document inspection. After the user presses `Enter` or `l` on a focused collection item, the app should query the selected database and render the first page of documents as a terminal table.

## Goals / Non-Goals

**Goals:**
- Load documents from a selected MongoDB database and collection.
- Use a default document limit of 25.
- Render results in a readable datatable format in the terminal.
- Preserve existing loading, error, empty-state, quit, and back-navigation behavior.

**Non-Goals:**
- Custom filters, sorting, pagination, or editable limits.
- Document mutation, export, or write operations.
- Support for non-MongoDB databases.

## Decisions

- Add a MongoDB service function for collection document loading. It should accept URL, database name, collection name, and an optional limit that defaults to 25. This keeps the query behavior testable outside the React state machine and avoids embedding MongoDB driver details in the TUI layer.
- Represent loaded documents as structured records with string keys and unknown values. Rendering should normalize values for display rather than assuming a fixed schema, because MongoDB documents in one collection can have different fields.
- Build the table columns from the loaded documents. Include keys that appear in the limited result set, prefer stable ordering with `_id` first when present, and stringify nested objects or arrays compactly so the table remains usable in a terminal.
- Add explicit TUI phases for loading, loaded, empty, and failed collection data. This follows the existing phase-based flow for databases and collections and keeps recovery/back navigation consistent.
- Trigger document loading when the user presses `Enter` or `l` on the focused collection item. If the existing implementation only shows collection names, implementation can first convert that view to a selectable list and route selection through the same loader.

## Risks / Trade-offs

- Wide or deeply nested documents can overflow terminal width -> truncate cell values and preserve full values only in memory.
- Heterogeneous documents can produce many columns -> cap visible columns or prioritize common keys if the table becomes too wide during implementation.
- Large collections can be expensive to query -> always apply the default limit unless the caller explicitly supplies another limit in code.
- Some values are not JSON-serializable -> use defensive display formatting for ObjectId, Date, null, arrays, objects, and unknown values.
