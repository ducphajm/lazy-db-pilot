## Context

The MongoDB browser is an Ink React TUI with a split layout: databases and collections on the left, opened collection document tabs on the right. Document tabs already track an active tab, preserve per-tab state, activate existing tabs without duplication, and close the active tab with `x`.

The missing behavior is keyboard navigation between already-open tabs from the Documents view. Ink's `useInput` key object exposes `tab` and `shift`, so the implementation can detect `Tab` and `Shift+Tab` without adding dependencies.

## Goals / Non-Goals

**Goals:**
- Allow `Tab` to activate the next open document tab when the right data container is focused.
- Allow `Shift+Tab` to activate the previous open document tab when the right data container is focused.
- Wrap tab activation at the first and last open tab.
- Preserve each tab's existing documents, selected document, loading, empty, or error state when switching.
- Keep the bottom help text accurate.

**Non-Goals:**
- Do not change how tabs are opened, closed, rendered, or loaded.
- Do not add mouse interaction or direct numeric tab shortcuts.
- Do not change focus movement between the left sidebar and right data container.

## Decisions

- Add a document-tab movement helper beside the existing tab helpers.
  - Rationale: active tab index calculations belong with tab state utilities, and this keeps `useAppInput` focused on input routing.
  - Alternative considered: calculate the next tab directly in `useAppInput`; rejected because input handling should not duplicate tab ordering rules.

- Expose a `moveActiveDocumentTab(direction)` callback from `useDocumentTabs`.
  - Rationale: the hook owns `activeDocumentTabId`, phase updates, and tab state, so it can switch tabs and set the phase from the newly active tab consistently.
  - Alternative considered: pass `setActiveDocumentTabId` through `App`; rejected because it leaks hook internals and makes phase synchronization easier to miss.

- Handle `Tab` and `Shift+Tab` only when the right data container is focused and at least one document tab is open.
  - Rationale: this scopes the shortcut to the Documents view requested by the change and avoids interfering with connection form field traversal.
  - Alternative considered: make tab navigation global across the browser; rejected because `Tab` already has form-navigation meaning elsewhere in the TUI.

## Risks / Trade-offs

- `Shift+Tab` input can vary by terminal protocol -> Use Ink's typed `key.shift` and `key.tab` fields and cover the behavior in Ink render tests.
- Switching to loading, empty, or error tabs could display the wrong phase -> Reuse `getDocumentTabPhase` when activating a tab.
- Single-tab navigation could create noisy state updates -> Return early when fewer than two tabs are open.
