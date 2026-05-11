## Context

The Documents view already supports Vim-style cursor movement for loaded document cards with `j`, `k`, `Ctrl+d`, and `Ctrl+u`. Input for the right data container is centralized in `useAppInput`, while cursor position, selected document index, and scroll offset are maintained by document tab state helpers.

## Goals / Non-Goals

**Goals:**
- Add `gg` to jump to the first rendered line of the active loaded document tab.
- Add `Shift+G` to jump to the last rendered line of the active loaded document tab.
- Reuse the existing cursor, selected document, and scroll synchronization behavior.
- Scope the shortcuts to the focused right data container when loaded document content can move.

**Non-Goals:**
- Change existing `j`, `k`, `Ctrl+d`, or `Ctrl+u` behavior.
- Add numeric prefixes such as `10G`.
- Add similar top or bottom jumps to the left sidebar or connection list.

## Decisions

- Represent document cursor commands with a fixed enum rather than overloading large deltas. This keeps top and bottom jumps explicit and avoids relying on sentinel numbers.
- Extend the existing document cursor update path so all cursor movement continues to calculate selected document and scroll offset from the same document card metrics.
- Track a pending first `g` inside right-container input handling and execute the top jump only when the next key is also `g`. Any unrelated key clears the pending state before processing that key normally.
- Treat uppercase `G` as the `Shift+G` bottom jump, matching Ink's normal shifted character input.

## Risks / Trade-offs

- Pending `g` state can consume a single `g` key that has no current action in the Documents view. This matches the requested Vim-style chord and avoids adding a timeout.
- Terminal input libraries can vary in shifted-key reporting. Cover `Shift+G` with an input test that writes uppercase `G` through the existing Ink test harness.
