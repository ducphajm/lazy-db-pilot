## ADDED Requirements

### Requirement: Connection Deletion
The system SHALL allow users to delete a saved connection record from the terminal UI after explicit confirmation.

#### Scenario: User requests connection deletion
- **WHEN** the user is viewing the saved connection list with a saved connection focused
- **AND** the user presses `d`
- **THEN** the terminal UI displays a deletion confirmation prompt for that connection
- **AND** the system does not delete the connection before confirmation

#### Scenario: Saved connection list shows delete help
- **WHEN** the user is viewing the saved connection list
- **THEN** the terminal UI shows concise help text that names `d` as the delete key for saved connections

#### Scenario: User confirms connection deletion
- **WHEN** the user confirms deletion for a saved connection
- **THEN** the system removes that connection record from persisted storage
- **AND** the terminal UI refreshes the saved connection list

#### Scenario: User cancels connection deletion
- **WHEN** the user cancels deletion for a saved connection
- **THEN** the system keeps the connection record in persisted storage
- **AND** the terminal UI returns to the saved connection list

#### Scenario: Last connection is deleted
- **WHEN** the user confirms deletion for the only saved connection
- **THEN** the system removes that connection record from persisted storage
- **AND** the terminal UI displays the connection creation path
