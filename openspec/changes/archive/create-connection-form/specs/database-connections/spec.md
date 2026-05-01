## MODIFIED Requirements

### Requirement: Connection Creation
The system SHALL allow users to create MongoDB, Redis, and SQLite connections from a single TUI form.

#### Scenario: User creates a valid MongoDB connection
- **WHEN** the user enters a valid name, selects MongoDB, selects an environment, enters a valid MongoDB URL, and submits the connection form
- **THEN** the system persists the connection record
- **AND** the saved connection becomes available for selection in the TUI

#### Scenario: User creates a valid Redis connection
- **WHEN** the user enters a valid name, selects Redis, selects an environment, and submits the connection form
- **THEN** the system persists the connection record
- **AND** the saved connection becomes available for selection in the TUI

#### Scenario: User creates a valid SQLite connection
- **WHEN** the user enters a valid name, selects SQLite, selects an environment, and submits the connection form
- **THEN** the system persists the connection record
- **AND** the saved connection becomes available for selection in the TUI

#### Scenario: User navigates connection form fields
- **WHEN** the user is focused on a connection form field
- **AND** the user presses `Tab` or `Shift+Tab`
- **THEN** the system moves focus to the next or previous form field without submitting the form
- **AND** pressing `Enter` submits the complete connection form

#### Scenario: User submits invalid MongoDB URL
- **WHEN** the user submits the connection form for a MongoDB connection with an empty or invalid MongoDB URL
- **THEN** the system rejects the input and remains in the connection creation form with an error message

#### Scenario: User submits incomplete form
- **WHEN** the user submits the connection form with a missing required name, database type, or environment
- **THEN** the system rejects the input and remains in the connection creation form with an error message
