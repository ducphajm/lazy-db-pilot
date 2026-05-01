## Context

Connection records already have a stable domain shape: name, database type, environment, and type-specific details. The current TUI creates those records through sequential phases: name input, database type selection, environment selection, and MongoDB URL input. That makes creation slower and prevents users from reviewing all fields before submitting.

The app is an Ink React TUI using TypeScript, `@inkjs/ui`, and pnpm. Existing validation and persistence should remain the source of truth for valid connection records.

## Goals / Non-Goals

**Goals:**

- Present connection creation as one form with all relevant fields visible together.
- Let users edit fields and press `Enter` to create the connection.
- Preserve existing validation messages and saved connection output.
- Keep MongoDB URL validation in the MongoDB creation path.
- Keep Redis and SQLite creation supported without type-specific details.

**Non-Goals:**

- Changing the persisted connection record schema.
- Adding Redis or SQLite browsing.
- Adding connection editing or deletion.
- Adding new external form dependencies unless the existing UI primitives cannot support accessible form behavior.

## Decisions

### Use one creation phase with a form draft

Replace the sequential creation phases with a single connection form phase backed by a draft containing name, type, environment, and MongoDB URL. The form view owns field focus and editing; `App` owns validation, persistence, and phase transitions.

Alternative considered: keep the existing phases and render them as a visual form. That would not satisfy the requirement because submission would still be step-by-step.

### Submit only from the complete form

Pressing `Enter` submits the current form. The submit handler builds a `ConnectionInput` from the draft, validates the complete record, and moves to the existing saving phase when valid. Validation errors keep the user on the form and should identify the field that needs correction.

Alternative considered: validate and save fields incrementally as focus leaves each field. That adds state complexity without improving the final persistence contract.

### Navigate form fields with Tab

The connection form uses `Tab` to move focus to the next field and `Shift+Tab` to move focus to the previous field. `Enter` always submits the complete form instead of advancing between fields.

Alternative considered: reuse `j` and `k` for form navigation. That conflicts with editable text fields where those keys are valid input characters.

### Keep type-specific fields conditional

The form always shows name, database type, and environment. It shows MongoDB URL only when MongoDB is selected. Redis and SQLite continue to submit empty details until their browsers are implemented.

Alternative considered: show disabled placeholder fields for Redis and SQLite details. That would add UI noise without creating usable values.

### Reuse existing validation and persistence paths

Form submission should continue to use the existing connection validation and persistence layers. UI-level checks can provide immediate messages, but the saved record must still pass domain validation.

Alternative considered: duplicate full validation inside the form component. That risks drift between UI behavior and persistence behavior.

## Risks / Trade-offs

- Form keyboard handling may conflict with existing global quit and Vim navigation controls -> Scope form-specific key handling to the creation form and keep global `q`/`Ctrl+C` behavior intact.
- A terminal form can become hard to test if field state is embedded deeply in the view -> Keep form draft state and submit behavior testable through `App` integration tests and small pure helpers where useful.
- Error messages may become less clear when multiple fields are visible -> Show a concise validation message near the form and keep focus on the failed or currently edited field.
- Removing old creation phases touches several tests -> Update tests to assert the user-facing form behavior instead of phase names.
