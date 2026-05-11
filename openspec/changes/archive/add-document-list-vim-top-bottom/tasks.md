## 1. Input Handling

- [x] 1.1 Add an explicit document cursor command enum for relative movement, jump to top, and jump to bottom.
- [x] 1.2 Update right-container input handling to recognize `gg` as jump to top and uppercase `G` as jump to bottom.
- [x] 1.3 Ensure unrelated right-container input clears any pending first `g` before normal processing continues.

## 2. Cursor State

- [x] 2.1 Extend document cursor state updates to resolve top and bottom jumps through existing document card metrics.
- [x] 2.2 Keep selected document index and scroll offset synchronized after top and bottom jumps.
- [x] 2.3 Preserve existing `j`, `k`, `Ctrl+d`, and `Ctrl+u` behavior.

## 3. Verification

- [x] 3.1 Add input handling tests for `gg`, uppercase `G`, and pending `g` clearing.
- [x] 3.2 Add document tab cursor tests for top and bottom jumps, including scroll offset updates.
- [x] 3.3 Run the relevant pnpm test suite for document navigation.
