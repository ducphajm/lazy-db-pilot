## 1. Document Card Rendering

- [x] 1.1 Create a document-card list component to render each MongoDB document as an individual card.
- [x] 1.2 Render each document field vertically inside its card, preserving compact scalar formatting.
- [x] 1.3 Render object and array field values as indented multi-line JSON inside the card.
- [x] 1.4 Apply a distinct selected style to the selected document card.

## 2. Navigation Integration

- [x] 2.1 Add loaded-document view state for the selected document index.
- [x] 2.2 Handle `j` and `k` in the loaded-document view to move selection within document bounds.
- [x] 2.3 Reset selected document state when a new collection's documents are loaded.
- [x] 2.4 Preserve existing `h`, `q`, and `Ctrl+C` behavior in the loaded-document view.

## 3. Replace Table View

- [x] 3.1 Replace `DocumentTable` usage in the loaded collection data view with the document-card list.
- [x] 3.2 Remove or retire table-specific rendering code that is no longer used.
- [x] 3.3 Keep collection loading, empty-state, and error-state behavior unchanged.

## 4. Verification

- [x] 4.1 Update component tests for card rendering, vertical field layout, scalar values, and nested JSON values.
- [x] 4.2 Update app tests for document-card display after collection selection.
- [x] 4.3 Add navigation tests for `j` and `k` selected-document movement and boundary behavior.
- [x] 4.4 Run the relevant pnpm test suite.
