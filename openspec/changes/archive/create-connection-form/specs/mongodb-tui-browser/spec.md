## MODIFIED Requirements

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
