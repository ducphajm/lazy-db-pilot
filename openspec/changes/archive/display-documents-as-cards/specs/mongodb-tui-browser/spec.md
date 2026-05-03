## MODIFIED Requirements

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
- **AND** the user presses `j`
- **THEN** the selected document moves to the next document card unless the selected document is already the last document
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: User moves selected document up
- **WHEN** the user is viewing loaded collection document cards with a selected document
- **AND** the user presses `k`
- **THEN** the selected document moves to the previous document card unless the selected document is already the first document
- **AND** the newly selected document card is highlighted with the selected color

#### Scenario: Collection has no documents
- **WHEN** the system successfully loads no documents from a collection
- **THEN** the terminal UI displays an empty-state message for the selected collection

#### Scenario: Collection document has nested JSON value
- **WHEN** the system displays a document field whose value is an object or array
- **THEN** the terminal UI renders that value as indented multi-line JSON inside the document card
- **AND** the rendered value does not overflow as a single long line

#### Scenario: Collection document has scalar values
- **WHEN** the system displays a document field whose value is a string, number, boolean, date, ObjectId-like value, null, or undefined
- **THEN** the terminal UI renders the scalar value in compact field form inside the document card
