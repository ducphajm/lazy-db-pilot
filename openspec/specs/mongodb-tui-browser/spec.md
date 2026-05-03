## Purpose
Define terminal UI behavior for connecting to MongoDB, browsing databases, and browsing collections.

## Requirements

### Requirement: MongoDB URL Input
The system SHALL collect a MongoDB connection URL in the connection creation form when the user creates a MongoDB connection, and SHALL NOT require direct URL entry before browsing if a saved MongoDB connection is selected.

#### Scenario: User submits MongoDB URL while creating a connection
- **WHEN** the user enters a MongoDB connection URL in the connection creation form and submits the form
- **THEN** the system validates the URL before saving the connection

#### Scenario: User selects saved MongoDB connection
- **WHEN** the user selects a saved MongoDB connection
- **THEN** the system attempts to connect and list databases using the saved MongoDB URL

#### Scenario: User submits empty input
- **WHEN** the user submits an empty MongoDB URL in the connection creation form
- **THEN** the system rejects the input and remains on the connection creation form with an error message

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

### Requirement: MongoDB Database Listing
The system SHALL display database names available through the selected MongoDB connection before attempting to browse collections.

#### Scenario: Connection has databases
- **WHEN** the system successfully connects to MongoDB through the selected MongoDB connection and one or more databases are available
- **THEN** the terminal UI displays each database name for selection

#### Scenario: Connection has no databases
- **WHEN** the system successfully connects to MongoDB through the selected MongoDB connection and no databases are available
- **THEN** the terminal UI displays an empty-state message and allows the user to return to saved connection selection or connection creation

### Requirement: MongoDB Database Selection
The system SHALL allow the user to select one listed MongoDB database before loading collections.

#### Scenario: User selects database
- **WHEN** the user selects a database from the database list
- **THEN** the system attempts to load collections from the selected database

### Requirement: Collection Listing
The system SHALL display the collection names from the selected MongoDB database in the terminal UI.

#### Scenario: Database has collections
- **WHEN** the system successfully loads one or more collections from the selected MongoDB database
- **THEN** the terminal UI displays each collection name

#### Scenario: Database has no collections
- **WHEN** the system successfully loads no collections from the selected MongoDB database
- **THEN** the terminal UI displays an empty-state message

### Requirement: Collection Data Loading
The system SHALL load documents from the selected MongoDB database when the user presses `Enter` or `l` on a focused collection item, and SHALL apply a default limit of 25 documents.

#### Scenario: User enters focused collection
- **WHEN** the user is browsing collections for a selected MongoDB database
- **AND** the user presses `Enter` on the focused collection item
- **THEN** the system loads documents from that collection with a limit of 25

#### Scenario: User selects collection with Vim-style forward navigation
- **WHEN** the user is browsing collections for a selected MongoDB database
- **AND** the user presses `l` on the focused collection item
- **THEN** the system loads documents from that collection with a limit of 25

### Requirement: Collection Data Table Display
The system SHALL display loaded collection documents in a terminal datatable format, and SHALL render nested object and array values as readable multi-line JSON that remains visually contained within the table layout.

#### Scenario: Collection has documents
- **WHEN** the system successfully loads one or more documents from a collection
- **THEN** the terminal UI displays the documents in a datatable format
- **AND** the table includes document fields as columns

#### Scenario: Collection has no documents
- **WHEN** the system successfully loads no documents from a collection
- **THEN** the terminal UI displays an empty-state message for the selected collection

#### Scenario: Collection document has nested JSON value
- **WHEN** the system displays a document field whose value is an object or array
- **THEN** the terminal UI renders that value as indented multi-line JSON
- **AND** the rendered value does not overflow as a single long line

#### Scenario: Collection document has scalar values
- **WHEN** the system displays a document field whose value is a string, number, boolean, date, ObjectId-like value, null, or undefined
- **THEN** the terminal UI renders the scalar value in compact table form

### Requirement: Collection Data Feedback
The system SHALL show clear terminal UI feedback for loading and failure states while loading collection data.

#### Scenario: Collection data loading in progress
- **WHEN** the system is loading documents from a selected collection
- **THEN** the terminal UI displays a loading state

#### Scenario: Collection data loading fails
- **WHEN** the system fails to load documents from a selected collection
- **THEN** the terminal UI displays a concise error message
- **AND** the user can return to the collection list for the selected database

### Requirement: Collection Data Back Navigation
The system SHALL allow the user to navigate from collection data views back to the collection list for the active MongoDB database with Vim-style navigation.

#### Scenario: User returns from loaded collection data to collections
- **WHEN** the user is viewing collection data for a selected collection
- **AND** the user presses `h`
- **THEN** the terminal UI displays the previously loaded collection list
- **AND** the system does not require the user to re-enter the MongoDB URL or reselect the database

#### Scenario: User returns from empty collection data to collections
- **WHEN** the user is viewing an empty collection data state for a selected collection
- **AND** the user presses `h`
- **THEN** the terminal UI displays the previously loaded collection list
- **AND** the system does not require the user to re-enter the MongoDB URL or reselect the database

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
The system SHALL allow the user to move forward from the focused selectable list item with `l`.

#### Scenario: User selects database with l
- **WHEN** the user is viewing the loaded database list with a focused database
- **AND** the user presses `l`
- **THEN** the system attempts to load collections from the focused database

#### Scenario: User selects connection with l
- **WHEN** the user is viewing the saved connection list with a focused connection
- **AND** the user presses `l`
- **THEN** the system attempts to use the focused connection
