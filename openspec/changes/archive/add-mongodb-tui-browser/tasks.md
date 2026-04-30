## 1. Project Setup

- [x] 1.1 Initialize the TypeScript/Node CLI project structure if it does not already exist
- [x] 1.2 Add required runtime dependencies for Ink, `@inkjs/ui`, React, and the MongoDB Node.js driver
- [x] 1.3 Add development tooling for TypeScript execution, building, linting, and tests

## 2. MongoDB Service

- [x] 2.1 Implement MongoDB URL validation that rejects empty input
- [x] 2.2 Implement a database-listing service that connects with the provided URL, reads available database names, and closes the client after completion
- [x] 2.3 Add credential-safe error handling so service errors never require rendering the full submitted URL
- [x] 2.4 Implement a collection-listing service that connects with the provided URL and selected database name, reads collection names, and closes the client after completion
- [x] 2.5 Add unit tests for URL validation, successful database mapping, successful collection mapping, and client cleanup on failure

## 3. Terminal UI

- [x] 3.1 Implement the TUI entrypoint that renders the Ink app from the CLI
- [x] 3.2 Implement the MongoDB URL prompt and empty-input validation feedback
- [x] 3.3 Implement loading, success, empty-state, and error views for database loading
- [x] 3.4 Implement database selection from the loaded database list
- [x] 3.5 Implement loading, success, empty-state, and error views for collection loading
- [x] 3.6 Allow the user to retry with a new MongoDB URL after validation, connection, database-listing, or collection-loading failures
- [x] 3.7 Ensure submitted URLs with credentials are not displayed after submission

## 4. Verification

- [x] 4.1 Add component or integration tests for prompt submission, database loading and selection, collection rendering, empty states, and retry after failure
- [x] 4.2 Run the full test suite and typecheck
- [x] 4.3 Manually verify the TUI against the provided external MongoDB URL using `MONGODB_URI`, with no Docker-based MongoDB setup
  - Verification URI: `mongodb://localhost:9617/?directConnection=true&replicaSet=rs0`
