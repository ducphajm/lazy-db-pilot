## 1. Document Card Rendering

- [x] 1.1 Remove the top-level document field-count cap from `DocumentCardList`.
- [x] 1.2 Remove hidden-field count calculation and summary rendering.
- [x] 1.3 Keep `_id`-first field ordering and existing value formatting/truncation behavior unchanged.

## 2. Layout Verification

- [x] 2.1 Verify the Documents right-side container still clips overflowing document content with hidden overflow.
- [x] 2.2 Avoid adding card-level scrolling or changing document loading limits.

## 3. Tests

- [x] 3.1 Update document card tests to assert all top-level fields render for documents with many fields.
- [x] 3.2 Update tests to assert hidden-field count summaries are no longer rendered.
- [x] 3.3 Run the relevant pnpm test suite.
