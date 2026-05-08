## Why

Documents with many fields or long nested JSON values can exceed the visible height of the right-side Documents view. The current behavior hides overflow, which prevents users from inspecting the full selected document content in the terminal UI.

## What Changes

- Make the right-side Documents view vertically scrollable when document card content exceeds the visible pane height.
- Keep scrolling contained within the right data container so content does not overflow into adjacent panes or footer controls.
- Keep selected document navigation behavior intact while ensuring the selected document remains visible.
- No removals or breaking changes.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mongodb-tui-browser`: Right-side collection document display changes from hidden overflow to scrollable document viewing.

## Impact

- Affected code: terminal UI rendering and keyboard handling for the MongoDB browser right data container.
- Affected specs: `mongodb-tui-browser`.
- APIs/dependencies: no API or dependency changes expected.
