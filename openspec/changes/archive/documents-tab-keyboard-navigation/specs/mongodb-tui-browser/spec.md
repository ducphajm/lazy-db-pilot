## ADDED Requirements

### Requirement: Collection Document Tab Keyboard Navigation
The system SHALL allow the user to navigate between open collection document tabs in the Documents view with `Tab` and `Shift+Tab`.

#### Scenario: User activates next document tab
- **WHEN** the right data container is focused
- **AND** multiple collection document tabs are open
- **AND** the user presses `Tab`
- **THEN** the system activates the next open collection document tab
- **AND** the newly active tab's existing state is displayed without reloading other open tabs

#### Scenario: User activates previous document tab
- **WHEN** the right data container is focused
- **AND** multiple collection document tabs are open
- **AND** the user presses `Shift+Tab`
- **THEN** the system activates the previous open collection document tab
- **AND** the newly active tab's existing state is displayed without reloading other open tabs

#### Scenario: Next tab navigation wraps
- **WHEN** the right data container is focused
- **AND** multiple collection document tabs are open
- **AND** the last collection document tab is active
- **AND** the user presses `Tab`
- **THEN** the system activates the first open collection document tab

#### Scenario: Previous tab navigation wraps
- **WHEN** the right data container is focused
- **AND** multiple collection document tabs are open
- **AND** the first collection document tab is active
- **AND** the user presses `Shift+Tab`
- **THEN** the system activates the last open collection document tab
