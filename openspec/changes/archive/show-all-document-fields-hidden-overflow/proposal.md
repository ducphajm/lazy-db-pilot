## Why

Documents with more fields than the current card display limit hide data behind a summary message. The Documents view should preserve access to every field in the loaded document while keeping the terminal layout bounded.

## What Changes

- Display all fields for each loaded document card in the Documents view.
- Remove behavior that hides additional document fields behind a "more fields hidden" message.
- Keep overflowing document content clipped by the existing Documents view container instead of expanding beyond the available terminal area.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mongodb-tui-browser`: Collection document cards display every field while the Documents view keeps overflow hidden.

## Impact

- Affects the TUI document card rendering in `src/tui/DocumentCardList.tsx`.
- Affects document card rendering tests in `src/tui/DocumentCardList.test.tsx`.
- No API or dependency changes expected.
