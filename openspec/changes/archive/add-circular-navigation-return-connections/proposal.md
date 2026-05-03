## Why

Keyboard navigation currently stops at the first or last item in vertical lists, which slows repeated browsing in the TUI. Users also need an explicit, discoverable way to return from MongoDB browsing views to the saved connection list without restarting the app.

## What Changes

- Make `j` and `k` navigation circular in selectable vertical lists.
- Add Vim-style back navigation from the database list to the saved connection list for the active session.
- Ensure the UI help text names the key used to return to the saved connection list.
- Preserve existing forward navigation, quit controls, credential-safe display, and MongoDB browsing behavior.

## Capabilities

### New Capabilities

### Modified Capabilities

- `mongodb-tui-browser`: selectable list movement wraps at list boundaries, and MongoDB database browsing includes a visible back path to saved connection selection.

## Impact

- TUI navigation state and key handling.
- Help text displayed in MongoDB database and selectable list views.
- Tests covering keyboard navigation and view transitions.
