## ADDED Requirements

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
