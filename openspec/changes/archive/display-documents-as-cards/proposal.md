## Why

The current collection document view presents records as a table, which makes document-level inspection harder when fields contain nested or vertically dense data. A card-based view will make each document easier to scan after selecting a collection while preserving keyboard navigation.

## What Changes

- Display loaded collection documents as individual cards instead of a datatable.
- Render each document card's field information vertically.
- Allow users to move the selected document between cards.
- Highlight the selected document card with a distinct color.
- Preserve existing collection loading, empty-state, failure-state, and back-navigation behavior.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mongodb-tui-browser`: Change the collection data display requirement from table-oriented rendering to navigable document cards with vertical field layout and selected-card highlighting.

## Impact

- Affects the terminal UI collection data view and keyboard handling for document navigation.
- Affects tests or snapshots covering collection document rendering.
- No database API, persistence, or connection behavior changes.
