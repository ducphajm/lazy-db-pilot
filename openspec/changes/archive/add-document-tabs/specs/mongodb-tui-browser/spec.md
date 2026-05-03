## ADDED Requirements

### Requirement: Collection Document Tabs
The system SHALL display opened collection document views as tabs in the right data container and SHALL keep each tab open until the user closes it.

#### Scenario: Collection opens in a new tab
- **WHEN** the user opens a collection from the left sidebar with `Enter` or `l`
- **AND** no tab exists for that connection, database, and collection
- **THEN** the system creates a new tab for that collection in the right data container
- **AND** the new tab becomes the active tab
- **AND** previously opened tabs remain available

#### Scenario: Existing collection tab is activated
- **WHEN** the user opens a collection from the left sidebar with `Enter` or `l`
- **AND** a tab already exists for that connection, database, and collection
- **THEN** the system activates the existing tab
- **AND** the system does not create a duplicate tab

#### Scenario: User closes active collection tab
- **WHEN** the right data container is focused
- **AND** one or more collection tabs are open
- **AND** the user presses `x`
- **THEN** the system closes the active tab
- **AND** the system activates an adjacent remaining tab when one exists

#### Scenario: User closes last collection tab
- **WHEN** the right data container is focused
- **AND** exactly one collection tab is open
- **AND** the user presses `x`
- **THEN** the system closes the tab
- **AND** the right data container displays an empty no-open-tabs state

#### Scenario: Tab state remains scoped
- **WHEN** multiple collection tabs are open
- **THEN** each tab keeps its own documents, selected document, loading state, empty state, or error state
- **AND** changing the active tab displays that tab's state without clearing other tabs

## MODIFIED Requirements

### Requirement: MongoDB Database Selection
The system SHALL allow the user to select one listed MongoDB database in the left sidebar before loading collections, and SHALL keep opened document tabs available until the user closes them.

#### Scenario: User selects database
- **WHEN** the user selects a database from the left sidebar database list
- **THEN** the system attempts to load collections from the selected database
- **AND** the selected database becomes the active folder-like database item in the left sidebar
- **AND** any open right-side collection document tabs remain available

### Requirement: Collection Data Loading
The system SHALL load documents from the selected MongoDB database when the user presses `Enter` or `l` on a focused collection item in the left sidebar, SHALL apply a default limit of 25 documents, and SHALL display the result in an active collection tab.

#### Scenario: User enters focused collection
- **WHEN** the user is browsing collections for a selected MongoDB database in the left sidebar
- **AND** the user presses `Enter` on the focused collection item
- **THEN** the system loads documents from that collection with a limit of 25
- **AND** the loaded documents are displayed in an active tab for that collection in the right data container
- **AND** focus moves to the right data container

#### Scenario: User selects collection with Vim-style forward navigation
- **WHEN** the user is browsing collections for a selected MongoDB database in the left sidebar
- **AND** the user presses `l` on the focused collection item
- **THEN** the system loads documents from that collection with a limit of 25
- **AND** the loaded documents are displayed in an active tab for that collection in the right data container
- **AND** focus moves to the right data container

### Requirement: Collection Data Table Display
The system SHALL display loaded collection documents in the active right-side tab as vertically stacked document cards, SHALL render each document's field information vertically within its card, and SHALL highlight the selected document card with a distinct color when the right data container is focused.

#### Scenario: Collection has documents
- **WHEN** the system successfully loads one or more documents from a collection
- **THEN** the terminal UI displays each document in an individual card in the active collection tab
- **AND** each card displays that document's fields vertically
- **AND** one document card is selected by default
- **AND** the selected document card is highlighted with a distinct color when the right data container is focused

#### Scenario: User moves selected document down
- **WHEN** the user is viewing loaded collection document cards in the active tab with the right data container focused
- **AND** the selected document is not the last document
- **AND** the user presses `j`
- **THEN** the selected document moves to the next document card
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: User wraps selected document down from last document
- **WHEN** the user is viewing loaded collection document cards in the active tab with the right data container focused
- **AND** the selected document is the last document
- **AND** the user presses `j`
- **THEN** the selected document moves to the first document card
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: User moves selected document up
- **WHEN** the user is viewing loaded collection document cards in the active tab with the right data container focused
- **AND** the selected document is not the first document
- **AND** the user presses `k`
- **THEN** the selected document moves to the previous document card
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: User wraps selected document up from first document
- **WHEN** the user is viewing loaded collection document cards in the active tab with the right data container focused
- **AND** the selected document is the first document
- **AND** the user presses `k`
- **THEN** the selected document moves to the last document card
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: Collection has no documents
- **WHEN** the system successfully loads no documents from a collection
- **THEN** the terminal UI displays an empty-state message for the selected collection in the active collection tab

#### Scenario: Collection document has nested JSON value
- **WHEN** the system displays a document field whose value is an object or array
- **THEN** the terminal UI renders that value as indented multi-line JSON inside the document card
- **AND** the rendered value does not overflow as a single long line

#### Scenario: Collection document has scalar values
- **WHEN** the system displays a document field whose value is a string, number, boolean, date, ObjectId-like value, null, or undefined
- **THEN** the terminal UI renders the scalar value in compact field form inside the document card

### Requirement: Collection Data Feedback
The system SHALL show clear terminal UI feedback in the active collection tab for loading and failure states while loading collection data.

#### Scenario: Collection data loading in progress
- **WHEN** the system is loading documents from a selected collection
- **THEN** the terminal UI displays a loading state in the active collection tab
- **AND** the right data container has focus

#### Scenario: Collection data loading fails
- **WHEN** the system fails to load documents from a selected collection
- **THEN** the terminal UI displays a concise error message in the active collection tab
- **AND** the right data container has focus
- **AND** the user can move focus back to the left sidebar collection hierarchy
