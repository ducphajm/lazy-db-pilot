## Why

Collection document values are currently rendered as compact JSON on a single line, which overflows in the terminal and makes nested documents hard to inspect. Saved connections also need a deletion path so users can remove obsolete or incorrect connection records without editing persistence files manually.

## What Changes

- Render object and array document values in collection data views as readable multi-line JSON instead of single-line compact JSON.
- Preserve collection data navigation while keeping wide or nested document content visually contained in the terminal layout.
- Add a TUI action for deleting a focused saved connection.
- Persist connection deletion and refresh the saved connection list after removal.
- Require an explicit confirmation step before deleting a connection.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mongodb-tui-browser`: Collection data display requirements change to require readable multi-line JSON for nested document values.
- `database-connections`: Saved connection management requirements change to allow deleting persisted connection records.

## Impact

- Collection data table rendering for MongoDB documents.
- Saved connection list TUI controls and state transitions.
- Connection persistence repository/service deletion behavior.
- Tests covering document formatting and connection deletion flows.
