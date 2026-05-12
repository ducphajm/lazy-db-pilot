## ADDED Requirements

### Requirement: Collection Creation Shortcut
The system SHALL allow the user to create a new MongoDB collection for the focused database from the left-side Databases view with `a`.

#### Scenario: User starts collection creation from focused database
- **WHEN** the left sidebar is focused
- **AND** a database item is focused
- **AND** the user presses `a`
- **THEN** the terminal UI displays a create-collection editor for the focused database
- **AND** the draft is scoped to the selected connection and focused database

#### Scenario: Shortcut is ignored from focused collection
- **WHEN** the left sidebar is focused
- **AND** a collection item is focused
- **AND** the user presses `a`
- **THEN** the terminal UI remains in the current database browser state
- **AND** the system does not display a create-collection editor

#### Scenario: Shortcut is ignored from right data container
- **WHEN** the right data container is focused
- **AND** the user presses `a`
- **THEN** collection creation does not start from the left-side Databases view
- **AND** existing right-side `a` behavior remains unchanged

#### Scenario: User submits valid collection name
- **WHEN** the user is editing a create-collection draft
- **AND** the draft contains a non-empty collection name
- **AND** the user submits the draft
- **THEN** the system creates the collection in the draft's MongoDB database
- **AND** the system refreshes that database's collection list through the existing collection loading behavior after creation succeeds

#### Scenario: User submits empty collection name
- **WHEN** the user is editing a create-collection draft
- **AND** the draft collection name is empty or whitespace-only
- **AND** the user submits the draft
- **THEN** the system rejects the draft
- **AND** the terminal UI remains in the create-collection editor with a concise validation error
- **AND** the system does not create a collection

#### Scenario: User cancels collection creation
- **WHEN** the user is editing a create-collection draft
- **AND** the user presses `Escape`
- **THEN** the system discards the draft
- **AND** the terminal UI returns to the left-side Databases view without creating a collection

#### Scenario: Collection creation fails
- **WHEN** the user submits a valid create-collection draft
- **AND** MongoDB rejects or fails the create collection operation
- **THEN** the terminal UI displays a concise creation error
- **AND** the user remains able to edit, resubmit, or cancel the draft
