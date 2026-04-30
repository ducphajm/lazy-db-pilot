## Why

The CLI currently behaves like a linear terminal prompt after collection loading, which makes browsing feel transient and limits navigation. Running the CLI as a fullscreen TUI with predictable quit and back-navigation controls makes database browsing usable as an interactive session.

## What Changes

- Render the CLI as a fullscreen terminal UI when launched.
- Allow the user to quit the TUI from any screen with `q` or `Ctrl+C`.
- Allow the user to navigate from the collection list back to the database list without reconnecting or re-entering the MongoDB URL.
- Preserve existing database and collection loading behavior, validation, error feedback, and credential-safe display.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mongodb-tui-browser`: Add fullscreen session behavior, global quit controls, and collection-to-database back navigation.

## Impact

- Affects the Ink CLI entrypoint and React TUI state handling in `src/cli.tsx` and `src/App.tsx`.
- Adds or updates Ink component tests for fullscreen rendering, quit controls, and collection-to-database navigation.
- No database service API changes are expected.
