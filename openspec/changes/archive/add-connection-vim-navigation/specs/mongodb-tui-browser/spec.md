## ADDED Requirements

### Requirement: Connection List Navigation
The system SHALL allow the user to move the focused item in selectable vertical lists with `j` and `k`.

#### Scenario: User moves focus down with j
- **WHEN** the user is viewing a selectable vertical list with an item focused
- **AND** the user presses `j`
- **THEN** the focus moves to the next item unless the focused item is already the last item

#### Scenario: User moves focus up with k
- **WHEN** the user is viewing a selectable vertical list with an item focused
- **AND** the user presses `k`
- **THEN** the focus moves to the previous item unless the focused item is already the first item

### Requirement: Saved MongoDB Connection Selection
The system SHALL allow the user to select a saved MongoDB connection before browsing databases.

#### Scenario: User selects saved MongoDB connection
- **WHEN** the user selects a saved MongoDB connection
- **THEN** the system attempts to connect and list databases using that connection's MongoDB URL

#### Scenario: No saved connections exist
- **WHEN** the application starts and no saved connections exist
- **THEN** the terminal UI displays a connection creation path

## MODIFIED Requirements

### Requirement: MongoDB URL Input
The system SHALL collect a MongoDB connection URL when the user creates a MongoDB connection, and SHALL NOT require direct URL entry before browsing if a saved MongoDB connection is selected.

#### Scenario: User submits MongoDB URL while creating a connection
- **WHEN** the user enters a MongoDB connection URL during MongoDB connection creation and submits the prompt
- **THEN** the system validates the URL before saving the connection

#### Scenario: User selects saved MongoDB connection
- **WHEN** the user selects a saved MongoDB connection
- **THEN** the system attempts to connect and list databases using the saved MongoDB URL

#### Scenario: User submits empty input
- **WHEN** the user submits an empty MongoDB URL during MongoDB connection creation
- **THEN** the system rejects the input and remains on the URL prompt with an error message

### Requirement: MongoDB Database Listing
The system SHALL display database names available through the selected MongoDB connection before attempting to browse collections.

#### Scenario: Connection has databases
- **WHEN** the system successfully connects to MongoDB through the selected MongoDB connection and one or more databases are available
- **THEN** the terminal UI displays each database name for selection

#### Scenario: Connection has no databases
- **WHEN** the system successfully connects to MongoDB through the selected MongoDB connection and no databases are available
- **THEN** the terminal UI displays an empty-state message and allows the user to return to saved connection selection or connection creation

### Requirement: Connection Feedback
The system SHALL show clear terminal UI feedback for loading and failure states while loading saved connections, connecting to MongoDB, listing databases, and loading collections.

#### Scenario: Data loading in progress
- **WHEN** the system is loading saved connections, connecting to MongoDB, listing databases, or loading collections
- **THEN** the terminal UI displays a loading state

#### Scenario: Connection fails
- **WHEN** the MongoDB connection, database listing, or collection loading operation fails
- **THEN** the terminal UI displays a concise error message and allows the user to return to saved connection selection or connection creation

#### Scenario: Saved MongoDB connection cannot connect
- **WHEN** the user selects a saved MongoDB connection and the connection attempt fails
- **THEN** the terminal UI displays a concise connection failure message for that connection
- **AND** the user can return to saved connection selection or connection creation

### Requirement: Credential-Safe Display
The system MUST NOT display the submitted or saved MongoDB URL with embedded credentials after submission.

#### Scenario: URL includes credentials
- **WHEN** a submitted or saved MongoDB URL contains credentials
- **THEN** the terminal UI does not render the full URL or credentials in subsequent loading, connection-list, database-list, success, or error messages

### Requirement: Vim-Style Forward Navigation
The system SHALL allow the user to move forward from the focused selectable list item with `l`.

#### Scenario: User selects database with l
- **WHEN** the user is viewing the loaded database list with a focused database
- **AND** the user presses `l`
- **THEN** the system attempts to load collections from the focused database

#### Scenario: User selects connection with l
- **WHEN** the user is viewing the saved connection list with a focused connection
- **AND** the user presses `l`
- **THEN** the system attempts to use the focused connection
