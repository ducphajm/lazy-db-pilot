## 1. Fullscreen Session Lifecycle

- [x] 1.1 Update the CLI entrypoint to render the Ink app in fullscreen mode.
- [x] 1.2 Ensure `Ctrl+C` exits cleanly from all app phases under fullscreen rendering.
- [x] 1.3 Add or update tests that verify the CLI uses fullscreen render options where practical.

## 2. Global Quit Controls

- [x] 2.1 Add app-level input handling for `q` that exits from non-text-entry screens.
- [x] 2.2 Preserve normal URL text entry so `q` can still be typed into the MongoDB URL prompt.
- [x] 2.3 Add tests for quitting with `q` and `Ctrl+C` from representative prompt, list, loading, and result states.

## 3. Collection Back Navigation

- [x] 3.1 Add `h` back navigation from loaded collection results to the loaded database list.
- [x] 3.2 Add the same `h` back-navigation behavior from the empty collection state to the loaded database list.
- [x] 3.3 Preserve the active MongoDB URL and loaded database list when returning from collections to databases.
- [x] 3.4 Add `l` forward navigation from the focused database list item to collection loading.
- [x] 3.5 Add tests that verify back navigation does not call the database loader again or require URL re-entry.
- [x] 3.6 Add tests that verify `l` selects the focused database.

## 4. Verification

- [x] 4.1 Run `pnpm lint`.
- [x] 4.2 Run `pnpm test`.
- [x] 4.3 Run `pnpm typecheck`.
