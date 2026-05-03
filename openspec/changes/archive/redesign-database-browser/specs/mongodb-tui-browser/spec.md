## ADDED Requirements

### Requirement: Split MongoDB Browser Layout
The system SHALL display MongoDB browsing in a two-container layout after a MongoDB connection has loaded databases, with database and collection hierarchy on the left and collection documents on the right.

#### Scenario: Browser shows database hierarchy and document container
- **WHEN** the system has loaded one or more databases for a selected MongoDB connection
- **THEN** the terminal UI displays a left sidebar container with database names
- **AND** the terminal UI displays a right data container for collection documents
- **AND** the left sidebar remains visible while collection documents are displayed

#### Scenario: Selected database expands collections
- **WHEN** the user selects a database from the left sidebar
- **AND** the system successfully loads one or more collections from that database
- **THEN** the selected database is displayed as an expanded folder-like item
- **AND** its collections are displayed as child items under that database

#### Scenario: Empty collection list remains in hierarchy
- **WHEN** the user selects a database from the left sidebar
- **AND** the system successfully loads no collections from that database
- **THEN** the selected database is displayed in the left sidebar
- **AND** the terminal UI displays an empty collection state without leaving the split browser layout

### Requirement: Left Sidebar Folder Navigation
The system SHALL allow the user to open and close database folders in the left sidebar with Vim-style lateral navigation.

#### Scenario: User opens a database folder
- **WHEN** the user is in the split MongoDB browser layout with the left sidebar focused
- **AND** a database item is focused
- **AND** the user presses `l`
- **THEN** the system opens that database folder by loading its collections
- **AND** focus remains in the left sidebar

#### Scenario: User closes an expanded database folder
- **WHEN** the user is in the split MongoDB browser layout with the left sidebar focused
- **AND** the active database folder is expanded
- **AND** the user presses `h`
- **THEN** the system closes the active database folder
- **AND** focus remains in the left sidebar

#### Scenario: User returns to saved connections from browser
- **WHEN** the user is in the split MongoDB browser layout with the left sidebar focused
- **AND** the user presses Backspace
- **THEN** the terminal UI displays the saved connection list
- **AND** the system does not require the user to restart the terminal UI

### Requirement: Browser Container Navigation
The system SHALL allow the user to move focus between MongoDB browser containers with `Ctrl+h`, `Ctrl+j`, `Ctrl+k`, and `Ctrl+l`.

#### Scenario: User moves focus to left sidebar
- **WHEN** the user is in the split MongoDB browser layout
- **AND** the user presses `Ctrl+h`
- **THEN** focus moves to the left sidebar container when it is not already focused

#### Scenario: User moves focus to right data container
- **WHEN** the user is in the split MongoDB browser layout
- **AND** the user presses `Ctrl+l`
- **THEN** focus moves to the right data container when document navigation is available

#### Scenario: User presses vertical container navigation without vertical neighbor
- **WHEN** the user is in the split MongoDB browser layout
- **AND** the user presses `Ctrl+j` or `Ctrl+k`
- **AND** no container exists in that direction
- **THEN** focus remains on the current container

#### Scenario: Focused container is visually indicated
- **WHEN** the user is in the split MongoDB browser layout
- **THEN** the terminal UI visually indicates which container currently has focus

## MODIFIED Requirements

### Requirement: MongoDB Database Selection
The system SHALL allow the user to select one listed MongoDB database in the left sidebar before loading collections.

#### Scenario: User selects database
- **WHEN** the user selects a database from the left sidebar database list
- **THEN** the system attempts to load collections from the selected database
- **AND** the selected database becomes the active folder-like database item in the left sidebar
- **AND** the right data container clears any previously displayed collection documents

### Requirement: Collection Listing
The system SHALL display collection names from the selected MongoDB database as child items under the selected database in the left sidebar.

#### Scenario: Database has collections
- **WHEN** the system successfully loads one or more collections from the selected MongoDB database
- **THEN** the terminal UI displays each collection name as a child item under the selected database in the left sidebar

#### Scenario: Database has no collections
- **WHEN** the system successfully loads no collections from the selected MongoDB database
- **THEN** the terminal UI displays an empty-state message while keeping the selected database visible in the left sidebar

### Requirement: Collection Data Loading
The system SHALL load documents from the selected MongoDB database when the user presses `Enter` or `l` on a focused collection item in the left sidebar, and SHALL apply a default limit of 25 documents.

#### Scenario: User enters focused collection
- **WHEN** the user is browsing collections for a selected MongoDB database in the left sidebar
- **AND** the user presses `Enter` on the focused collection item
- **THEN** the system loads documents from that collection with a limit of 25
- **AND** the loaded documents are displayed in the right data container
- **AND** focus moves to the right data container

#### Scenario: User selects collection with Vim-style forward navigation
- **WHEN** the user is browsing collections for a selected MongoDB database in the left sidebar
- **AND** the user presses `l` on the focused collection item
- **THEN** the system loads documents from that collection with a limit of 25
- **AND** the loaded documents are displayed in the right data container
- **AND** focus moves to the right data container

### Requirement: Collection Data Table Display
The system SHALL display loaded collection documents in the right data container as vertically stacked document cards, SHALL render each document's field information vertically within its card, and SHALL highlight the selected document card with a distinct color when the right data container is focused.

#### Scenario: Collection has documents
- **WHEN** the system successfully loads one or more documents from a collection
- **THEN** the terminal UI displays each document in an individual card in the right data container
- **AND** each card displays that document's fields vertically
- **AND** one document card is selected by default
- **AND** the selected document card is highlighted with a distinct color when the right data container is focused

#### Scenario: User moves selected document down
- **WHEN** the user is viewing loaded collection document cards with the right data container focused
- **AND** the selected document is not the last document
- **AND** the user presses `j`
- **THEN** the selected document moves to the next document card
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: User wraps selected document down from last document
- **WHEN** the user is viewing loaded collection document cards with the right data container focused
- **AND** the selected document is the last document
- **AND** the user presses `j`
- **THEN** the selected document moves to the first document card
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: User moves selected document up
- **WHEN** the user is viewing loaded collection document cards with the right data container focused
- **AND** the selected document is not the first document
- **AND** the user presses `k`
- **THEN** the selected document moves to the previous document card
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: User wraps selected document up from first document
- **WHEN** the user is viewing loaded collection document cards with the right data container focused
- **AND** the selected document is the first document
- **AND** the user presses `k`
- **THEN** the selected document moves to the last document card
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: Collection has no documents
- **WHEN** the system successfully loads no documents from a collection
- **THEN** the terminal UI displays an empty-state message for the selected collection in the right data container

#### Scenario: Collection document has nested JSON value
- **WHEN** the system displays a document field whose value is an object or array
- **THEN** the terminal UI renders that value as indented multi-line JSON inside the document card
- **AND** the rendered value does not overflow as a single long line

#### Scenario: Collection document has scalar values
- **WHEN** the system displays a document field whose value is a string, number, boolean, date, ObjectId-like value, null, or undefined
- **THEN** the terminal UI renders the scalar value in compact field form inside the document card

### Requirement: Collection Data Feedback
The system SHALL show clear terminal UI feedback in the right data container for loading and failure states while loading collection data.

#### Scenario: Collection data loading in progress
- **WHEN** the system is loading documents from a selected collection
- **THEN** the terminal UI displays a loading state in the right data container
- **AND** the right data container has focus

#### Scenario: Collection data loading fails
- **WHEN** the system fails to load documents from a selected collection
- **THEN** the terminal UI displays a concise error message in the right data container
- **AND** the right data container has focus
- **AND** the user can move focus back to the left sidebar collection hierarchy

### Requirement: Collection Data Back Navigation
The system SHALL allow the user to navigate from the right data container back to the left sidebar collection hierarchy for the active MongoDB database with Vim-style navigation.

#### Scenario: User returns from loaded collection data to collections
- **WHEN** the user is viewing collection data for a selected collection with the right data container focused
- **AND** the user presses `h` or `Ctrl+h`
- **THEN** focus moves to the left sidebar collection hierarchy
- **AND** the system does not require the user to re-enter the MongoDB URL or reselect the database

#### Scenario: User returns from empty collection data to collections
- **WHEN** the user is viewing an empty collection data state for a selected collection with the right data container focused
- **AND** the user presses `h` or `Ctrl+h`
- **THEN** focus moves to the left sidebar collection hierarchy
- **AND** the system does not require the user to re-enter the MongoDB URL or reselect the database
