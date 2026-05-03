## 1. Tab State

- [x] 1.1 Add a helper that returns the next active document tab id for forward and backward movement, including wrap-around.
- [x] 1.2 Add a `moveActiveDocumentTab` callback in `useDocumentTabs` that updates the active tab id and phase from the newly active tab.
- [x] 1.3 Return early without changing state when there are fewer than two open document tabs or no active tab.

## 2. Input Handling

- [x] 2.1 Pass `moveActiveDocumentTab` from `App` into `useAppInput`.
- [x] 2.2 Handle `Tab` in the right data container to activate the next document tab.
- [x] 2.3 Handle `Shift+Tab` in the right data container to activate the previous document tab.
- [x] 2.4 Keep `Tab` and `Shift+Tab` scoped away from non-browser views such as the connection form.

## 3. UI Copy

- [x] 3.1 Update the MongoDB browser footer help text to include `Tab` and `Shift+Tab` document tab navigation.

## 4. Verification

- [x] 4.1 Add tests for next-tab activation, previous-tab activation, and wrap-around behavior.
- [x] 4.2 Add or update tests confirming tab switching preserves loaded tab data without duplicate document loads.
- [x] 4.3 Run the focused document tab tests and the full TypeScript/test validation command used by the project.
