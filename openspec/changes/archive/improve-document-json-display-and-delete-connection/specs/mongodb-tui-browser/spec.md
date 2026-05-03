## MODIFIED Requirements

### Requirement: Collection Data Table Display
The system SHALL display loaded collection documents in a terminal datatable format, and SHALL render nested object and array values as readable multi-line JSON that remains visually contained within the table layout.

#### Scenario: Collection has documents
- **WHEN** the system successfully loads one or more documents from a collection
- **THEN** the terminal UI displays the documents in a datatable format
- **AND** the table includes document fields as columns

#### Scenario: Collection document has nested JSON value
- **WHEN** the system displays a document field whose value is an object or array
- **THEN** the terminal UI renders that value as indented multi-line JSON
- **AND** the rendered value does not overflow as a single long line

#### Scenario: Collection document has scalar values
- **WHEN** the system displays a document field whose value is a string, number, boolean, date, ObjectId-like value, null, or undefined
- **THEN** the terminal UI renders the scalar value in compact table form
