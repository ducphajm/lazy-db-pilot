## ADDED Requirements

### Requirement: MongoDB URL Input
The system SHALL prompt the user in the terminal UI for a MongoDB connection URL before attempting to browse collections.

#### Scenario: User submits MongoDB URL
- **WHEN** the user enters a MongoDB connection URL and submits the prompt
- **THEN** the system attempts to connect and list databases using that URL

#### Scenario: User submits empty input
- **WHEN** the user submits an empty MongoDB URL
- **THEN** the system rejects the input and remains on the URL prompt with an error message

### Requirement: MongoDB Database Listing
The system SHALL display database names available through the submitted MongoDB connection URL before attempting to browse collections.

#### Scenario: Connection has databases
- **WHEN** the system successfully connects to MongoDB and one or more databases are available
- **THEN** the terminal UI displays each database name for selection

#### Scenario: Connection has no databases
- **WHEN** the system successfully connects to MongoDB and no databases are available
- **THEN** the terminal UI displays an empty-state message and allows the user to enter a new MongoDB URL

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

### Requirement: Connection Feedback
The system SHALL show clear terminal UI feedback for loading and failure states while connecting to MongoDB, listing databases, and loading collections.

#### Scenario: Data loading in progress
- **WHEN** the system is connecting to MongoDB, listing databases, or loading collections
- **THEN** the terminal UI displays a loading state

#### Scenario: Connection fails
- **WHEN** the MongoDB connection, database listing, or collection loading operation fails
- **THEN** the terminal UI displays a concise error message and allows the user to enter a new MongoDB URL

### Requirement: Credential-Safe Display
The system MUST NOT display the submitted MongoDB URL with embedded credentials after submission.

#### Scenario: URL includes credentials
- **WHEN** the user submits a MongoDB URL containing credentials
- **THEN** the terminal UI does not render the full URL or credentials in subsequent loading, database-list, success, or error messages
