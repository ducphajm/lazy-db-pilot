## Context

The TUI handles global input in `src/app/useAppInput.ts`. Today `Ctrl+C` and `q` both call the app exit handler immediately outside the connection creation form, while the form deliberately allows `q` as typed input.

The UI already has confirmation-style behavior for saved connection deletion, so a quit confirmation can follow the same stateful prompt pattern without adding dependencies.

## Goals / Non-Goals

**Goals:**

- Prevent accidental application exits caused by pressing `q`.
- Keep `q` discoverable as the quit shortcut while requiring explicit confirmation.
- Preserve immediate `Ctrl+C` exit behavior.
- Preserve `q` as normal text input in the connection creation form.

**Non-Goals:**

- Add configurable keybindings.
- Change navigation keys unrelated to quitting.
- Add persistence for pending quit confirmation state across sessions.

## Decisions

- Represent pending quit confirmation in app state.
  - Rationale: `App` already owns phase, dialogs, and the exit handler, so a boolean confirmation state can be shared between input handling and rendering.
  - Alternative considered: call a blocking prompt from the input handler. Ink apps should render prompts declaratively rather than blocking terminal input.

- Handle `q` in two steps on non-text-entry screens: first press opens confirmation, `y` exits, and `n` cancels.
  - Rationale: the shortcut remains fast but requires intent before terminating the session.
  - Alternative considered: require double-press `q`. A yes/no prompt is clearer and easier to discover.

- Keep `Ctrl+C` immediate.
  - Rationale: `Ctrl+C` is the terminal-level emergency exit path users expect, and changing it could make the app feel trapped.
  - Alternative considered: confirm both `q` and `Ctrl+C`. That improves consistency but weakens the reliable escape hatch.

- While quit confirmation is visible, route confirmation keys before normal navigation keys.
  - Rationale: the prompt is modal; unrelated navigation should not change app state while the user is deciding whether to quit.
  - Alternative considered: allow background navigation while the prompt is visible. That can make the confirmation ambiguous and harder to test.

## Risks / Trade-offs

- Confirmation prompt could conflict with typed input -> Do not open it from the connection creation form, where `q`, `y`, and `n` are valid text.
- Modal input can swallow expected navigation -> Keep the prompt small and handle only confirmation, cancellation, and immediate `Ctrl+C`.
- Help text may become inaccurate -> Update visible quit help to mention confirmation where the app currently names `q exit`.
