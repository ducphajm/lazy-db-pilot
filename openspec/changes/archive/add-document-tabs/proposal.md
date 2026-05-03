## Why

Opening a collection from the database left sidebar currently replaces the right-side data view, which loses the previous collection context. Users need to compare or revisit multiple collections without reloading each one.

## What Changes

- Change the right data container into a multi-tab document area.
- Opening a collection with `Enter` or `l` creates or activates a tab for that collection instead of clearing previously loaded data.
- Add close controls so each tab can be closed with `x`.
- Keep document cards, loading states, empty states, and error states scoped to their owning tab.
- Preserve left sidebar navigation while the tabbed right data container is active.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mongodb-tui-browser`: Collection document display changes from a single replaceable right-side view to a closable multi-tab document UI.

## Impact

- Affects MongoDB browser TUI state management, collection loading behavior, right data container rendering, keyboard handling, and related tests.
- No database API or persistence format changes are expected.
