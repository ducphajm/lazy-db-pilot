## MODIFIED Requirements

### Requirement: Collection Data Table Display
The system SHALL display loaded collection documents in the active right-side tab as vertically stacked document cards, SHALL render every top-level field in each document vertically within its card, SHALL keep overflowing document card content hidden by the Documents view container, and SHALL highlight the selected document card with a distinct color when the right data container is focused.

#### Scenario: Collection has documents
- **WHEN** the system successfully loads one or more documents from a collection
- **THEN** the terminal UI displays each document in an individual card in the active collection tab
- **AND** each card displays every top-level field from that document vertically
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

#### Scenario: Collection document has more fields than fit in the Documents view
- **WHEN** the system displays a document with more top-level fields than fit in the visible Documents view area
- **THEN** the terminal UI renders every top-level field in the document card
- **AND** the Documents view keeps overflowing content hidden within the right data container
- **AND** the terminal UI does not replace undisplayed fields with a hidden-field count summary
