## ADDED Requirements

### Requirement: Connection Creation Cancellation
The system SHALL allow users to cancel connection creation from the terminal UI before the connection form is submitted.

#### Scenario: User cancels creation with saved connections
- **WHEN** the user is editing the connection creation form and saved connections exist
- **AND** the user presses `Escape`
- **THEN** the system discards the in-progress form draft
- **AND** the system returns to the saved connection list
- **AND** the system does not persist a new connection record

#### Scenario: User cancels creation without saved connections
- **WHEN** the user is editing the connection creation form and no saved connections exist
- **AND** the user presses `Escape`
- **THEN** the system clears the in-progress form draft and validation error
- **AND** the system remains on the connection creation path
- **AND** the system does not persist a new connection record

#### Scenario: Connection form shows cancel help
- **WHEN** the user is viewing the connection creation form
- **THEN** the terminal UI shows concise help text that names `Escape` as the cancel key
