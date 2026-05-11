## Why

Users can move through document card content with Vim-style line and page navigation, but there is no direct way to jump to the start or end of the loaded document list. Adding `gg` and `Shift+G` completes the expected Vim-style navigation pattern for long Documents views.

## What Changes

- Add `gg` navigation in the right-side Documents view to move the active cursor to the first rendered line of the loaded document content.
- Add `Shift+G` navigation in the right-side Documents view to move the active cursor to the last rendered line of the loaded document content.
- Keep the selected document card and scroll offset synchronized with the new cursor position.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mongodb-tui-browser`: Collection document display requirements will include top and bottom jump shortcuts in the Documents view.

## Impact

- Affected specs: `openspec/specs/mongodb-tui-browser/spec.md`
- Affected app code likely includes Documents view input handling and document cursor state management.
- Affected tests likely include document navigation and scroll behavior coverage.
