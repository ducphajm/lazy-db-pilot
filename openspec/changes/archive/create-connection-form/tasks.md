## 1. Form Model

- [x] 1.1 Replace sequential connection creation phases with a single connection form phase.
- [x] 1.2 Add connection form draft state for name, database type, environment, and MongoDB URL.
- [x] 1.3 Build a submit handler that converts the draft into `ConnectionInput` and enters the existing saving flow.

## 2. TUI Form

- [x] 2.1 Add a connection creation form view that displays all relevant fields together.
- [x] 2.2 Support `Tab` and `Shift+Tab` navigation between form fields and editable text entry for name and MongoDB URL.
- [x] 2.3 Support database type and environment selection inside the form.
- [x] 2.4 Show the MongoDB URL field only when MongoDB is selected.
- [x] 2.5 Submit the complete form with `Enter`.

## 3. Validation

- [x] 3.1 Preserve required and unique connection name validation in the form submission path.
- [x] 3.2 Preserve supported database type and environment validation in the form submission path.
- [x] 3.3 Preserve MongoDB URL validation and keep invalid MongoDB submissions on the form with an error message.
- [x] 3.4 Preserve Redis and SQLite submission with empty type-specific details.

## 4. Tests

- [x] 4.1 Update connection creation tests to use the single form flow.
- [x] 4.2 Add coverage for submitting incomplete form values.
- [x] 4.3 Add coverage for invalid MongoDB URL staying on the form.
- [x] 4.4 Add coverage for Redis and SQLite creation from the form.
- [x] 4.5 Run the relevant pnpm test and typecheck commands.
