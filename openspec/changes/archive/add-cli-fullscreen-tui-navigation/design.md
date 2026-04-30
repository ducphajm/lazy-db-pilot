## Context

The CLI is an Ink React app launched from `src/cli.tsx`. It currently renders the URL prompt, database list, and collection list as a normal terminal flow. After collections load, the app displays results and only tells users to press `Ctrl+C` to exit.

This change keeps the existing MongoDB service contract intact and updates the terminal session behavior and UI state transitions.

## Goals / Non-Goals

**Goals:**

- Launch the CLI as a fullscreen TUI session.
- Provide consistent quit behavior with `q` and `Ctrl+C`.
- Let users return from a selected database's collection list to the previously loaded database list.
- Avoid reconnecting or re-listing databases when navigating back from collections.
- Preserve credential-safe display rules.

**Non-Goals:**

- Adding document browsing or collection selection behavior.
- Adding command-line flags.
- Changing MongoDB service APIs or validation rules.
- Preserving compatibility with the prior non-fullscreen terminal rendering.

## Decisions

- Use Ink's fullscreen rendering support at the CLI entrypoint.
  - Rationale: fullscreen lifecycle belongs at process startup, not inside app state.
  - Alternative considered: simulate fullscreen with layout sizing in React. That would not provide the expected alternate-screen terminal lifecycle.

- Handle `q` and `Ctrl+C` as global app controls.
  - Rationale: users expect quit controls to work consistently on every screen, including prompts, loading states, errors, and lists.
  - Alternative considered: only document `Ctrl+C`. That does not satisfy the requested `q` behavior and is less discoverable for a TUI.

- Add an explicit collection-list back transition to the loaded database-list state.
  - Rationale: the app already stores the loaded database names, so returning to the database list can be a local state transition without another MongoDB call.
  - Alternative considered: route back through the URL prompt. That discards useful session state and makes browsing slower.

- Use Vim-style navigation controls for database and collection movement.
  - Rationale: `h` for back and `l` for forward/select gives the TUI a compact keyboard model.
  - Alternative considered: use only Enter for selection and an unspecified back key. That leaves navigation behavior ambiguous.

## Risks / Trade-offs

- `q` may conflict with text entry on the URL prompt -> Only treat `q` as quit when Ink input handling can distinguish it from normal text input, or ensure the text input continues to accept `q` as part of a URL.
- Fullscreen rendering can behave differently in test output -> Keep tests focused on state transitions and CLI render options where practical.
- Back navigation from collection error/empty states could be inconsistent -> Apply `h` back behavior to loaded and empty collection states; keep collection errors on the existing retry-to-URL path.
