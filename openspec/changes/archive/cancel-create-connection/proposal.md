## Why

Users can enter the connection creation form from the saved connection list, but there is no explicit way to cancel creation and return without saving. This traps users in a form flow when they change their mind or opened it by mistake.

## What Changes

- Add a cancel action to the connection creation form.
- Return the user to the saved connection list when saved connections exist.
- Keep the user on the creation path when no saved connections exist, because there is no saved list to return to.
- Ensure canceling does not persist a partial connection or show validation errors.

## Capabilities

### New Capabilities

### Modified Capabilities
- `database-connections`: Add cancel behavior for the connection creation form.

## Impact

- Affects terminal UI state handling for the connection creation form.
- Affects connection form help text and keyboard handling.
- Adds focused tests for canceling connection creation with and without saved connections.
