## MODIFIED Requirements

### Requirement: Collection Data Table Display
The system SHALL display loaded collection documents in the active right-side tab as vertically stacked document cards, SHALL render every top-level field in each document vertically within its card, SHALL keep overflowing document card content scrollable within the Documents view container, SHALL maintain an active cursor on the selected document card, and SHALL highlight the selected document card with a distinct color when the right data container is focused.

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
