## Context

The terminal UI enters `CreatingConnection` when the user chooses `Create connection` from the saved connection list, and also starts there when no saved connections exist. `ConnectionForm` handles field navigation and text input locally, while `App` owns the phase, connection list, draft, and persistence workflow.

`q` currently exits outside prompts and is allowed as text input inside the form, so cancellation needs a distinct form action that does not conflict with typing connection names or URLs.

## Goals / Non-Goals

**Goals:**
- Let users cancel connection creation before submitting.
- Avoid saving or validating partial form data on cancel.
- Return to `ConnectionsLoaded` when saved connections exist.
- Keep users in `CreatingConnection` when no saved connections exist.
- Show concise form help for the cancel action.

**Non-Goals:**
- Do not change connection validation or persistence rules.
- Do not change global quit behavior.
- Do not add cancellation for in-flight save operations.

## Decisions

- Use `Escape` as the cancel key for the connection form.
  - Rationale: `q` is valid typed input in the form today, and reusing it would make it impossible to enter names or URLs containing `q`.
  - Alternative considered: `q` to cancel. Rejected because it conflicts with current text entry behavior.

- Implement cancellation as an `onCancel` callback passed from `App` to `ConnectionForm`.
  - Rationale: `ConnectionForm` can detect the key, but `App` owns the destination phase and the state that must be cleared.
  - Alternative considered: Handle `Escape` in the app-level `useInput`. Rejected because form-specific behavior belongs with form input handling and avoids coupling global input code to form internals.

- Reset draft, pending connection, and validation error when canceling.
  - Rationale: reopening the form should start cleanly and cancel must not preserve stale validation feedback.
  - Alternative considered: preserve the draft. Rejected because the user request is to cancel creation, not temporarily leave and resume editing.

## Risks / Trade-offs

- Users may not discover `Escape` without help text -> Add concise help text inside the form.
- Terminals can vary in escape-key behavior -> Cover the behavior through the Ink input abstraction used by existing form controls.
