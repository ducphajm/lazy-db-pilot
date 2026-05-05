## Context

The MongoDB browser renders database and collection hierarchy items in the left sidebar. The sidebar uses a fixed pane width, and collection items currently build their display label from the full collection name. When a collection name exceeds the available row width, Ink wraps the text and separates the marker from the collection name across rows.

## Goals / Non-Goals

**Goals:**
- Render each database sidebar collection item on exactly one terminal row.
- Ellipsize long collection display labels within the left sidebar width.
- Keep the full collection name available for keys, selection, tab identity, and MongoDB document loading.
- Cover the behavior with focused rendering tests.

**Non-Goals:**
- Changing MongoDB collection loading or document tab behavior.
- Adding horizontal scrolling or tooltip/detail views for full names.
- Truncating database names, document tab labels, or right-pane status text.

## Decisions

- Truncate at render time in the sidebar item component.
  Rationale: sidebar width and focus marker are presentation concerns owned by the layout, while `MongoBrowserSidebarItem.collectionName` must remain the full database identifier. Alternative considered: storing truncated labels in sidebar item state. That risks mixing display width with domain state and can accidentally reuse truncated names for navigation.

- Use a small deterministic ellipsis helper instead of relying only on wrapping behavior.
  Rationale: tests can assert the exact one-line output, including the ASCII `...` suffix requested for long names. Alternative considered: relying on Ink wrapping options alone. That may prevent wrapping but does not guarantee the requested `verylongnameever...` display form.

- Base the maximum collection label width on the actual rendered left sidebar content width, accounting for the focus marker, indentation, and list marker.
  Rationale: the label should fit inside the current sidebar pane without causing a second row, and future sidebar width changes should reveal more or less of the collection name without clipping the ellipsis suffix. Alternative considered: using terminal-wide available columns. That ignores the sidebar container and would still wrap inside the pane.

- Reserve the `...` suffix inside the computed label width whenever truncation is required.
  Rationale: the displayed truncated label must always end with `...`; if the suffix is appended after slicing to the full available width, the sidebar can clip it and show a full-looking partial name instead.

## Risks / Trade-offs

- Terminal width calculations can be off by border or padding columns -> Keep the helper conservative and test against rendered output.
- Exact visual truncation may not handle all wide Unicode characters perfectly -> Use string-level truncation for this change and avoid changing collection identity behavior.
- Very narrow future sidebar widths could leave no useful collection name characters -> Clamp helper output to the available width and keep the marker visible.
