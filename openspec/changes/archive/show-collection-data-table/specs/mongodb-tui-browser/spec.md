## ADDED Requirements

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
The system SHALL display loaded collection documents in a terminal datatable format.

#### Scenario: Collection has documents
- **WHEN** the system successfully loads one or more documents from a collection
- **THEN** the terminal UI displays the documents in a datatable format
- **AND** the table includes document fields as columns

#### Scenario: Collection has no documents
- **WHEN** the system successfully loads no documents from a collection
- **THEN** the terminal UI displays an empty-state message for the selected collection

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
