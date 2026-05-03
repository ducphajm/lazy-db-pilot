## Why

The current MongoDB browser presents database, collection, and document browsing as separate views, which makes it harder to keep context while moving through data. A split browser layout can keep database and collection hierarchy visible while documents are inspected.

## What Changes

- Redesign the MongoDB browsing UI into a two-container layout.
- Display databases and their collections in a folder-like left sidebar.
- Display documents for the selected collection in the right data container.
- Add `Ctrl+h`, `Ctrl+j`, `Ctrl+k`, and `Ctrl+l` container navigation so users can move focus between major UI containers without losing Vim-style item navigation.
- Preserve existing MongoDB connection, loading, error, selection, and credential-safe display behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mongodb-tui-browser`: Replace the separate database, collection, and document browsing flow with a split browser layout and add container-level `Ctrl+h/j/k/l` navigation.

## Impact

- Affects the Ink terminal UI components and app state used for MongoDB browsing.
- Affects tests covering database listing, collection listing, document loading, back navigation, and keyboard navigation.
- No API, persistence format, or external dependency changes are expected.
