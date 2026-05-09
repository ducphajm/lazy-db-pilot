## Why

Pressing `q` currently exits the terminal UI immediately, which makes accidental keypresses costly during keyboard-driven browsing. Adding a confirmation prompt reduces accidental exits without removing the existing quit shortcut.

## What Changes

- Change `q` from an immediate quit action to a quit confirmation flow on non-text-entry screens.
- Show a concise yes/no confirmation prompt after `q` is pressed.
- Exit only when the user confirms with `y`.
- Cancel the pending quit when the user answers `n` or uses a cancel key.
- Preserve `Ctrl+C` as an immediate exit control.
- Preserve normal `q` text entry in the connection creation form.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mongodb-tui-browser`: Global quit controls will require confirmation for `q` while keeping `Ctrl+C` immediate.

## Impact

- Affects app-level keyboard handling and terminal UI rendering.
- Updates tests around global quit behavior and text-entry exceptions.
- No dependency or database API changes.
