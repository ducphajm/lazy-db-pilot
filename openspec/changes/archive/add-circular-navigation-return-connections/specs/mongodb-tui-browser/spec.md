## ADDED Requirements

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

## MODIFIED Requirements

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

### Requirement: Collection Data Table Display
The system SHALL display loaded collection documents as vertically stacked document cards, SHALL render each document's field information vertically within its card, and SHALL highlight the selected document card with a distinct color.

#### Scenario: Collection has documents
- **WHEN** the system successfully loads one or more documents from a collection
- **THEN** the terminal UI displays each document in an individual card
- **AND** each card displays that document's fields vertically
- **AND** one document card is selected by default
- **AND** the selected document card is highlighted with a distinct color

#### Scenario: User moves selected document down
- **WHEN** the user is viewing loaded collection document cards with a selected document
- **AND** the selected document is not the last document
- **AND** the user presses `j`
- **THEN** the selected document moves to the next document card
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: User wraps selected document down from last document
- **WHEN** the user is viewing loaded collection document cards with the last document selected
- **AND** the user presses `j`
- **THEN** the selected document moves to the first document card
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: User moves selected document up
- **WHEN** the user is viewing loaded collection document cards with a selected document
- **AND** the selected document is not the first document
- **AND** the user presses `k`
- **THEN** the selected document moves to the previous document card
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: User wraps selected document up from first document
- **WHEN** the user is viewing loaded collection document cards with the first document selected
- **AND** the user presses `k`
- **THEN** the selected document moves to the last document card
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: Collection has no documents
- **WHEN** the system successfully loads no documents from a collection
- **THEN** the terminal UI displays an empty-state message for the selected collection

#### Scenario: Collection document has nested JSON value
- **WHEN** the system displays a document field whose value is an object or array
- **THEN** the terminal UI renders that value as indented multi-line JSON inside the document card
- **AND** the rendered value does not overflow as a single long line

#### Scenario: Collection has scalar values
- **WHEN** the system displays a document field whose value is a string, number, boolean, date, ObjectId-like value, null, or undefined
- **THEN** the terminal UI renders the scalar value in compact field form inside the document card
