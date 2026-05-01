## Why

Creating a connection currently requires a step-by-step prompt flow, which makes users move through separate screens for values that belong to one record. A single form lets users review and submit all connection fields together, with `Enter` creating the connection once the form is valid.

## What Changes

- Replace the multi-step connection creation prompts with one terminal form.
- Show editable fields for connection name, database type, environment, and database-specific details in the same form.
- Allow `Enter` to submit the complete form and create the connection.
- Keep existing validation for required name, unique name, supported type, supported environment, and MongoDB URL.
- Keep Redis and SQLite connection creation available with no database-specific detail fields until those browsers are implemented.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `database-connections`: Connection creation changes from sequential prompts to a single form submission flow.
- `mongodb-tui-browser`: MongoDB URL entry during connection creation moves into the single connection form.

## Impact

- Affected code: connection creation state in `src/App.tsx`, TUI rendering in `src/app/AppView.tsx`, phase definitions in `src/app/phases.ts`, connection validation integration, and App tests covering creation and validation.
- No storage schema, database driver, or dependency changes are expected.
