## MODIFIED Requirements

### Requirement: Collection Listing
The system SHALL display collection names from the selected MongoDB database as single-line child items under the selected database in the left sidebar, and SHALL responsively ellipsize collection labels that are too long for the rendered sidebar label width.

#### Scenario: Database has collections
- **WHEN** the system successfully loads one or more collections from the selected MongoDB database
- **THEN** the terminal UI displays each collection name as a child item under the selected database in the left sidebar

#### Scenario: Database has no collections
- **WHEN** the system successfully loads no collections from the selected MongoDB database
- **THEN** the terminal UI displays an empty-state message while keeping the selected database visible in the left sidebar

#### Scenario: Collection name exceeds sidebar width
- **WHEN** the system displays a collection child item whose full collection name exceeds the rendered left sidebar label width
- **THEN** the terminal UI displays the collection child item on one line
- **AND** the displayed collection label fits within the rendered sidebar label width
- **AND** the displayed collection label reserves space for and ends with `...`
- **AND** selecting the collection still uses the full collection name

#### Scenario: Sidebar width can show full collection name
- **WHEN** the system displays a collection child item whose full collection name fits within the rendered left sidebar label width
- **THEN** the terminal UI displays the full collection name without `...`
