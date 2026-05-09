## MODIFIED Requirements

### Requirement: Global Quit Controls
The system SHALL allow the user to quit the terminal UI with confirmed `q` input or immediate `Ctrl+C`.

#### Scenario: User starts quit confirmation with q
- **WHEN** the terminal UI is open on a non-text-entry screen
- **AND** the user presses `q`
- **THEN** the system displays a quit confirmation prompt
- **AND** the system does not exit the terminal UI

#### Scenario: User confirms quit
- **WHEN** the quit confirmation prompt is displayed
- **AND** the user presses `y`
- **THEN** the system exits the terminal UI

#### Scenario: User cancels quit
- **WHEN** the quit confirmation prompt is displayed
- **AND** the user presses `n`
- **THEN** the system dismisses the quit confirmation prompt
- **AND** the system remains in the terminal UI

#### Scenario: User types q in connection creation form
- **WHEN** the user is editing a text field in the connection creation form
- **AND** the user presses `q`
- **THEN** the system enters `q` into the focused text field
- **AND** the system does not display a quit confirmation prompt

#### Scenario: User quits with Ctrl+C
- **WHEN** the terminal UI is open and the user presses `Ctrl+C`
- **THEN** the system exits the terminal UI
