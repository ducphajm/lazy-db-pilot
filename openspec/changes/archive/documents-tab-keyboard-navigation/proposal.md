## Why

Users can open multiple collection document tabs, but there is no specified keyboard flow for moving between those tabs. Adding `Tab` and `Shift+Tab` navigation makes the Documents view easier to operate without leaving the keyboard.

## What Changes

- Add keyboard navigation between open collection document tabs in the right data container.
- Use `Tab` to activate the next document tab.
- Use `Shift+Tab` to activate the previous document tab.
- Keep each tab's existing scoped state when switching tabs.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mongodb-tui-browser`: Collection document tab requirements will include forward and backward keyboard tab activation in the Documents view.

## Impact

- Affected specs: `openspec/specs/mongodb-tui-browser/spec.md`
- Affected app code likely includes `src/App.tsx`, `src/app/useAppInput.ts`, `src/app/useDocumentTabs.ts`, `src/app/documentTabs.ts`, and the document tab rendering path.
- Affected tests likely include `src/App.documentTabs.test.tsx` and related app input tests.
