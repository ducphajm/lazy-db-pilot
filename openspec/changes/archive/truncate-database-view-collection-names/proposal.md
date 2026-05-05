## Why

Long MongoDB collection names can wrap in the database sidebar, causing the list marker and label to split across two lines. This makes the hierarchy harder to scan and can shift nearby rows in the terminal UI.

## What Changes

- Keep collection child rows in the database sidebar to a single terminal line.
- Truncate collection names that exceed the available label width.
- Show a trailing ellipsis for truncated collection names, such as `verylongnameever...`.
- Preserve the full collection name for selection and document-loading behavior.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mongodb-tui-browser`: Collection child items in the database sidebar must render as one-line, ellipsized labels when names are too long for the available sidebar width.

## Impact

- Affected UI: MongoDB browser left sidebar database and collection hierarchy.
- Affected behavior: collection label rendering only; no database API, persistence, navigation, or document loading changes.
- Tests should cover long collection labels and verify full collection identifiers are still used internally.
