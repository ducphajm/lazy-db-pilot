## 1. MongoDB Service

- [x] 1.1 Add a collection document-loading service function with URL, database name, collection name, and optional limit arguments
- [x] 1.2 Default collection document loading to a limit of 25 when no limit is provided
- [x] 1.3 Add a collection data MongoDB operation error and credential-safe display message
- [x] 1.4 Add service tests for successful document loading, default limit application, and client cleanup on failure

## 2. Terminal UI State

- [x] 2.1 Add collection data phases for loading, loaded, empty, and error states
- [x] 2.2 Track selected collection name and loaded collection documents in app state
- [x] 2.3 Route entered or selected collection names through the collection data loader
- [x] 2.4 Preserve back navigation from collection data views to the loaded collection list

## 3. Datatable Rendering

- [x] 3.1 Add a terminal datatable renderer for MongoDB documents
- [x] 3.2 Derive table columns from the loaded documents with stable field ordering
- [x] 3.3 Format nested, null, date, ObjectId, and unknown values safely for terminal display
- [x] 3.4 Render loading, empty, success, and error collection data views in `AppView`

## 4. Verification

- [x] 4.1 Add app tests for entering or selecting a collection and seeing collection data
- [x] 4.2 Add app tests for collection data empty, loading failure, and back-navigation behavior
- [x] 4.3 Run `pnpm test` and `pnpm typecheck`
