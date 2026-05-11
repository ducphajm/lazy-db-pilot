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
The system SHALL allow the user to move the focused item in selectable vertical lists with `j` and `k`, and SHALL wrap focus at list boundaries.

#### Scenario: User moves focus down with j
- **WHEN** the user is viewing a selectable vertical list with an item focused
- **AND** the focused item is not the last item
- **AND** the user presses `j`
- **THEN** the focus moves to the next item

#### Scenario: User wraps focus down from last item with j
- **WHEN** the user is viewing a selectable vertical list with the last item focused
- **AND** the user presses `j`
- **THEN** the focus moves to the first item

#### Scenario: User moves focus up with k
- **WHEN** the user is viewing a selectable vertical list with an item focused
- **AND** the focused item is not the first item
- **AND** the user presses `k`
- **THEN** the focus moves to the previous item

#### Scenario: User wraps focus up from first item with k
- **WHEN** the user is viewing a selectable vertical list with the first item focused
- **AND** the user presses `k`
- **THEN** the focus moves to the last item

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

### Requirement: Database List Back Navigation
The system SHALL allow the user to navigate from the MongoDB database list back to the saved connection list with Vim-style navigation.

#### Scenario: User returns from loaded databases to saved connections
- **WHEN** the user is viewing the loaded database list for a selected MongoDB connection
- **AND** the user presses `h`
- **THEN** the terminal UI displays the saved connection list
- **AND** the system does not require the user to restart the terminal UI

#### Scenario: Database list shows saved connection help
- **WHEN** the user is viewing the loaded database list for a selected MongoDB connection
- **THEN** the terminal UI shows concise help text that names `h` as the key to return to saved connections

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

### Requirement: Collection Document Creation Shortcut
The system SHALL allow the user to create a new MongoDB document for the active collection tab from the right-side Documents view with `a`.

#### Scenario: User starts document creation from loaded collection tab
- **WHEN** the right data container is focused
- **AND** the active collection tab has loaded documents for a collection
- **AND** the user presses `a`
- **THEN** the terminal UI displays a create-document editor for the active tab's collection
- **AND** the draft is scoped to the active tab's connection, database, and collection

#### Scenario: User starts document creation from empty collection tab
- **WHEN** the right data container is focused
- **AND** the active collection tab is an empty collection state
- **AND** the user presses `a`
- **THEN** the terminal UI displays a create-document editor for the active tab's collection
- **AND** the draft is scoped to the active tab's connection, database, and collection

#### Scenario: User submits valid document JSON
- **WHEN** the user is editing a create-document draft
- **AND** the draft contains valid JSON object content
- **AND** the user submits the draft
- **THEN** the system inserts the parsed document into the active tab's MongoDB collection
- **AND** the system refreshes the active collection tab through the existing document loading behavior after the insert succeeds

#### Scenario: User submits invalid document JSON
- **WHEN** the user is editing a create-document draft
- **AND** the draft does not contain valid JSON object content
- **AND** the user submits the draft
- **THEN** the system rejects the draft
- **AND** the terminal UI remains in the create-document editor with a concise validation error
- **AND** the system does not insert a document

#### Scenario: User cancels document creation
- **WHEN** the user is editing a create-document draft
- **AND** the user presses `Escape`
- **THEN** the system discards the draft
- **AND** the terminal UI returns to the active collection tab without inserting a document

#### Scenario: Document insertion fails
- **WHEN** the user submits a valid create-document draft
- **AND** MongoDB rejects or fails the insert operation
- **THEN** the terminal UI displays a concise insertion error
- **AND** the user remains able to edit, resubmit, or cancel the draft

#### Scenario: Shortcut is ignored without active collection tab
- **WHEN** the right data container is focused
- **AND** no collection tab is active
- **AND** the user presses `a`
- **THEN** the terminal UI remains in the no-open-tabs state
- **AND** the system does not display a create-document editor

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
The system SHALL display loaded collection documents in the active right-side tab as vertically stacked document cards, SHALL render every top-level field in each document vertically within its card, SHALL keep overflowing document card content scrollable within the Documents view container, SHALL maintain an active cursor on the selected document card, SHALL allow Vim-style line, page, top, and bottom navigation through rendered document content, and SHALL highlight the selected document card with a distinct color when the right data container is focused.

#### Scenario: Collection has documents
- **WHEN** the system successfully loads one or more documents from a collection
- **THEN** the terminal UI displays each document in an individual card in the active collection tab
- **AND** each card displays every top-level field from that document vertically
- **AND** one document card is selected by default with the active cursor on it
- **AND** the selected document card is highlighted with a distinct color when the right data container is focused

#### Scenario: User moves cursor down
- **WHEN** the user is viewing loaded collection document cards in the active tab with the right data container focused
- **AND** the active cursor is not on the last rendered line of the document content
- **AND** the user presses `j`
- **THEN** the active cursor moves down by one rendered line or single-line field
- **AND** the document card containing the active cursor is selected and highlighted with the selected color
- **AND** the Documents view scrolls when needed to keep the active cursor visible within the right data container

#### Scenario: User moves cursor down from last rendered line
- **WHEN** the user is viewing loaded collection document cards in the active tab with the right data container focused
- **AND** the active cursor is on the last rendered line of the document content
- **AND** the user presses `j`
- **THEN** the active cursor remains on the last rendered line
- **AND** the selected document card remains highlighted with the selected color

#### Scenario: User moves cursor up
- **WHEN** the user is viewing loaded collection document cards in the active tab with the right data container focused
- **AND** the active cursor is not on the first rendered line of the document content
- **AND** the user presses `k`
- **THEN** the active cursor moves up by one rendered line or single-line field
- **AND** the document card containing the active cursor is selected and highlighted with the selected color
- **AND** the Documents view scrolls when needed to keep the active cursor visible within the right data container

#### Scenario: User moves cursor up from first rendered line
- **WHEN** the user is viewing loaded collection document cards in the active tab with the right data container focused
- **AND** the active cursor is on the first rendered line of the document content
- **AND** the user presses `k`
- **THEN** the active cursor remains on the first rendered line
- **AND** the selected document card remains highlighted with the selected color

#### Scenario: User pages document content down
- **WHEN** the user is viewing loaded collection document cards in the active tab with the right data container focused
- **AND** rendered document content extends below the visible Documents view area
- **AND** the user presses `Ctrl+d`
- **THEN** the active cursor moves down by a page of rendered document content
- **AND** the Documents view scrolls to keep the active cursor visible within the right data container

#### Scenario: User pages document content up
- **WHEN** the user is viewing loaded collection document cards in the active tab with the right data container focused
- **AND** rendered document content extends above the visible Documents view area
- **AND** the user presses `Ctrl+u`
- **THEN** the active cursor moves up by a page of rendered document content
- **AND** the Documents view scrolls to keep the active cursor visible within the right data container

#### Scenario: User jumps to top of document content
- **WHEN** the user is viewing loaded collection document cards in the active tab with the right data container focused
- **AND** the active cursor is not on the first rendered line of the document content
- **AND** the user presses `gg`
- **THEN** the active cursor moves to the first rendered line of the document content
- **AND** the first document card is selected and highlighted with the selected color
- **AND** the Documents view scrolls to the top of the rendered document content

#### Scenario: User jumps to bottom of document content
- **WHEN** the user is viewing loaded collection document cards in the active tab with the right data container focused
- **AND** the active cursor is not on the last rendered line of the document content
- **AND** the user presses `Shift+G`
- **THEN** the active cursor moves to the last rendered line of the document content
- **AND** the last document card is selected and highlighted with the selected color
- **AND** the Documents view scrolls to keep the active cursor visible within the right data container

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

#### Scenario: Collection document has more fields than fit in the Documents view
- **WHEN** the system displays a document with more top-level fields than fit in the visible Documents view area
- **THEN** the terminal UI renders every top-level field in the document card
- **AND** the Documents view keeps overflowing content scrollable within the right data container
- **AND** the terminal UI does not replace undisplayed fields with a hidden-field count summary

#### Scenario: Documents exceed visible right pane height
- **WHEN** the active collection tab contains more rendered document card content than fits in the visible Documents view height
- **THEN** the terminal UI displays a visible subset of document card content within the right data container
- **AND** the document content remains contained within the right data container
- **AND** the document content does not overflow into the left sidebar or footer controls

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
The system SHALL allow the user to quit the terminal UI with confirmed `q` input.

#### Scenario: User starts quit confirmation with q
- **WHEN** the terminal UI is open on a non-text-entry screen
- **AND** the user presses `q`
- **THEN** the system displays a quit confirmation prompt
- **AND** the system does not exit the terminal UI

#### Scenario: User confirms quit
- **WHEN** the quit confirmation prompt is displayed
- **AND** the user presses `y`
- **THEN** the system exits the terminal UI

#### Scenario: User cancels quit
- **WHEN** the quit confirmation prompt is displayed
- **AND** the user presses `n`
- **THEN** the system dismisses the quit confirmation prompt
- **AND** the system remains in the terminal UI

#### Scenario: User types q in connection creation form
- **WHEN** the user is editing a text field in the connection creation form
- **AND** the user presses `q`
- **THEN** the system enters `q` into the focused text field
- **AND** the system does not display a quit confirmation prompt

#### Scenario: User presses Ctrl+C
- **WHEN** the terminal UI is open and the user presses `Ctrl+C`
- **THEN** the system remains in the terminal UI

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
