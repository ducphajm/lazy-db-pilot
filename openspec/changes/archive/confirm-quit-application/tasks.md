## 1. Quit Confirmation State

- [x] 1.1 Add app state for whether quit confirmation is pending.
- [x] 1.2 Add handlers to open, confirm, and cancel quit confirmation without changing unrelated app state.

## 2. Keyboard Behavior

- [x] 2.1 Update global input handling so `q` opens quit confirmation on non-text-entry screens instead of exiting immediately.
- [x] 2.2 Route `y` to exit and `n` to cancel while quit confirmation is pending.
- [x] 2.3 Preserve immediate `Ctrl+C` exit from all app phases.
- [x] 2.4 Preserve `q` as normal text input in connection creation form text fields.

## 3. UI Rendering

- [x] 3.1 Render a concise quit confirmation prompt when quit confirmation is pending.
- [x] 3.2 Update visible quit help text that currently says `q exits` so it reflects the confirmation flow.

## 4. Tests

- [x] 4.1 Add or update tests proving `q` opens confirmation and does not exit immediately.
- [x] 4.2 Add tests proving `y` confirms quit and `n` cancels quit.
- [x] 4.3 Add tests proving `q` remains text input in the connection creation form.
- [x] 4.4 Add or update tests proving `Ctrl+C` still exits immediately.
- [x] 4.5 Run the relevant pnpm test and typecheck commands.
