## ADDED Requirements

### Requirement: Fullscreen TUI Session
The system SHALL run the CLI as a fullscreen terminal UI session when launched.

#### Scenario: CLI launches
- **WHEN** the user runs the CLI
- **THEN** the terminal UI opens in fullscreen mode before displaying the MongoDB URL prompt

### Requirement: Global Quit Controls
The system SHALL allow the user to quit the terminal UI with `q` or `Ctrl+C`.

#### Scenario: User quits with q
- **WHEN** the terminal UI is open and the user presses `q`
- **THEN** the system exits the terminal UI

#### Scenario: User quits with Ctrl+C
- **WHEN** the terminal UI is open and the user presses `Ctrl+C`
- **THEN** the system exits the terminal UI

### Requirement: Collection List Back Navigation
The system SHALL allow the user to navigate from a collection list view back to the database list for the active MongoDB connection with Vim-style navigation.

#### Scenario: User returns from loaded collections to databases
- **WHEN** the user is viewing collections for a selected database and presses `h`
- **THEN** the terminal UI displays the previously loaded database list
- **AND** the system does not require the user to re-enter the MongoDB URL

#### Scenario: User returns from empty collections to databases
- **WHEN** the user is viewing an empty collection state for a selected database and presses `h`
- **THEN** the terminal UI displays the previously loaded database list
- **AND** the system does not require the user to re-enter the MongoDB URL

### Requirement: Vim-Style Forward Navigation
The system SHALL allow the user to move forward from the focused database list item with `l`.

#### Scenario: User selects database with l
- **WHEN** the user is viewing the loaded database list with a focused database
- **AND** the user presses `l`
- **THEN** the system attempts to load collections from the focused database
