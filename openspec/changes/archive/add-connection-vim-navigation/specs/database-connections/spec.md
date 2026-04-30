## ADDED Requirements

### Requirement: Connection Record Fields
The system SHALL store each database connection with a name, database type, environment, and type-specific connection details.

#### Scenario: MongoDB connection record is created
- **WHEN** the user creates a MongoDB connection with a name, environment, and MongoDB URL
- **THEN** the system stores a connection record with the submitted name
- **AND** the database type is MongoDB
- **AND** the environment is the submitted environment
- **AND** the MongoDB URL is stored as MongoDB-specific connection details

#### Scenario: Redis connection record is created
- **WHEN** the user creates a Redis connection with a name and environment
- **THEN** the system stores a connection record with the submitted name
- **AND** the database type is Redis
- **AND** the environment is the submitted environment
- **AND** Redis-specific connection details are stored as empty details until Redis browsing is implemented

#### Scenario: SQLite connection record is created
- **WHEN** the user creates a SQLite connection with a name and environment
- **THEN** the system stores a connection record with the submitted name
- **AND** the database type is SQLite
- **AND** the environment is the submitted environment
- **AND** SQLite-specific connection details are stored as empty details until SQLite browsing is implemented

### Requirement: Database Type Values
The system SHALL restrict database type values to MongoDB, Redis, and SQLite.

#### Scenario: User selects a supported database type
- **WHEN** the user creates a connection and selects MongoDB, Redis, or SQLite
- **THEN** the system accepts the selected database type

#### Scenario: Unsupported database type is provided
- **WHEN** a connection record is created or loaded with a database type outside MongoDB, Redis, and SQLite
- **THEN** the system rejects the connection record as invalid

### Requirement: Environment Values
The system SHALL restrict connection environment values to local, development, and production.

#### Scenario: User selects a supported environment
- **WHEN** the user creates a connection and selects local, development, or production
- **THEN** the system accepts the selected environment

#### Scenario: Unsupported environment is provided
- **WHEN** a connection record is created or loaded with an environment outside local, development, and production
- **THEN** the system rejects the connection record as invalid

### Requirement: Connection Persistence Location
The system SHALL persist connection records under `~/.lazy-db-pilot`.

#### Scenario: Connection is saved
- **WHEN** the user creates a valid connection
- **THEN** the system creates `~/.lazy-db-pilot` if it does not exist
- **AND** the system persists the connection record inside that directory

#### Scenario: Application starts after connections were saved
- **WHEN** the application starts and saved connection records exist under `~/.lazy-db-pilot`
- **THEN** the system loads the saved connection records for display in the TUI

### Requirement: Connection Name Validation
The system SHALL require each connection name to be non-empty and unique among saved connections.

#### Scenario: Empty connection name is submitted
- **WHEN** the user submits an empty connection name while creating a connection
- **THEN** the system rejects the input and displays a concise validation error

#### Scenario: Duplicate connection name is submitted
- **WHEN** the user submits a connection name that already exists
- **THEN** the system rejects the input and displays a concise validation error

### Requirement: Connection Creation
The system SHALL allow users to create MongoDB, Redis, and SQLite connections from the TUI.

#### Scenario: User creates a valid MongoDB connection
- **WHEN** the user enters a valid name, selects MongoDB, selects an environment, enters a valid MongoDB URL, and submits the connection
- **THEN** the system persists the connection record
- **AND** the saved connection becomes available for selection in the TUI

#### Scenario: User creates a valid Redis connection
- **WHEN** the user enters a valid name, selects Redis, selects an environment, and submits the connection
- **THEN** the system persists the connection record
- **AND** the saved connection becomes available for selection in the TUI

#### Scenario: User creates a valid SQLite connection
- **WHEN** the user enters a valid name, selects SQLite, selects an environment, and submits the connection
- **THEN** the system persists the connection record
- **AND** the saved connection becomes available for selection in the TUI

#### Scenario: User submits invalid MongoDB URL
- **WHEN** the user creates a MongoDB connection with an empty or invalid MongoDB URL
- **THEN** the system rejects the input and remains in the connection creation flow with an error message

### Requirement: Unsupported Connection Usage
The system SHALL prevent browsing with Redis and SQLite connection records until those database browsers are implemented.

#### Scenario: User selects Redis connection
- **WHEN** the user selects a saved Redis connection
- **THEN** the system displays a concise unsupported database type message
- **AND** the system does not attempt to connect

#### Scenario: User selects SQLite connection
- **WHEN** the user selects a saved SQLite connection
- **THEN** the system displays a concise unsupported database type message
- **AND** the system does not attempt to connect
