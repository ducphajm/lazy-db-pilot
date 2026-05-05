## MODIFIED Requirements

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
- **THEN** that database is displayed as an expanded folder-like item
- **AND** its collections are displayed as child items under that database

#### Scenario: Multiple databases remain expanded
- **WHEN** the user has expanded one database in the left sidebar
- **AND** the user selects and successfully loads collections for another database
- **THEN** both databases are displayed as expanded folder-like items
- **AND** each expanded database displays its own collections as child items under that database

#### Scenario: Empty collection list remains in hierarchy
- **WHEN** the user selects a database from the left sidebar
- **AND** the system successfully loads no collections from that database
- **THEN** that database is displayed in the left sidebar
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
- **AND** an expanded database folder is focused
- **AND** the user presses `h`
- **THEN** the system closes only the focused database folder
- **AND** other expanded database folders remain expanded
- **AND** focus remains in the left sidebar

#### Scenario: User returns to saved connections from browser
- **WHEN** the user is in the split MongoDB browser layout with the left sidebar focused
- **AND** the user presses Backspace
- **THEN** the terminal UI displays the saved connection list
- **AND** the system does not require the user to restart the terminal UI

### Requirement: MongoDB Database Selection
The system SHALL allow the user to select MongoDB databases in the left sidebar before loading collections, SHALL keep opened document tabs available until the user closes them, and SHALL allow multiple loaded database folders to remain expanded.

#### Scenario: User selects database
- **WHEN** the user selects a database from the left sidebar database list
- **THEN** the system attempts to load collections from the selected database
- **AND** the selected database becomes an expanded folder-like database item in the left sidebar
- **AND** previously expanded database folders remain expanded

#### Scenario: User selects already expanded database
- **WHEN** the user selects a database that is already expanded in the left sidebar
- **THEN** the system keeps that database expanded
- **AND** the system keeps other expanded database folders expanded

### Requirement: Collection Listing
The system SHALL display collection names from each expanded MongoDB database as single-line child items under that database in the left sidebar, and SHALL responsively ellipsize collection labels that are too long for the rendered sidebar label width.

#### Scenario: Database has collections
- **WHEN** the system successfully loads one or more collections from a MongoDB database
- **THEN** the terminal UI displays each collection name as a child item under that database in the left sidebar

#### Scenario: Multiple expanded databases have collections
- **WHEN** the system has successfully loaded collections for multiple expanded MongoDB databases
- **THEN** the terminal UI displays each loaded collection under its owning database
- **AND** the system does not display one database's collections under another database

#### Scenario: Database has no collections
- **WHEN** the system successfully loads no collections from a MongoDB database
- **THEN** the terminal UI displays an empty-state message while keeping that database visible in the left sidebar

#### Scenario: Collection name exceeds sidebar width
- **WHEN** the system displays a collection child item whose full collection name exceeds the rendered left sidebar label width
- **THEN** the terminal UI displays the collection child item on one line
- **AND** the displayed collection label fits within the rendered sidebar label width
- **AND** the displayed collection label reserves space for and ends with `...`
- **AND** selecting the collection still uses the full collection name

#### Scenario: Sidebar width can show full collection name
- **WHEN** the system displays a collection child item whose full collection name fits within the rendered left sidebar label width
- **THEN** the terminal UI displays the full collection name without `...`

## ADDED Requirements

### Requirement: Scrollable Left Sidebar
The system SHALL keep the MongoDB browser left sidebar navigable when database and collection hierarchy content exceeds the visible sidebar height.

#### Scenario: Sidebar content exceeds visible height
- **WHEN** the left sidebar contains more database and collection items than fit in the visible sidebar height
- **THEN** the terminal UI displays a visible subset of sidebar items within the left sidebar pane
- **AND** the selected sidebar item remains visible as the user navigates with `j` or `k`
- **AND** the left sidebar pane does not overflow into the right data container or footer controls

#### Scenario: Sidebar content fits visible height
- **WHEN** the left sidebar contains database and collection items that fit in the visible sidebar height
- **THEN** the terminal UI displays all sidebar items without clipping them
