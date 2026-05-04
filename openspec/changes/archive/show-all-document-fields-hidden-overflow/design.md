## Context

The Documents view renders loaded MongoDB documents as vertically stacked cards in the right data container. `DocumentCardList` currently limits each document to a fixed number of visible fields and appends a hidden-field summary, while the surrounding MongoDB browser layout already constrains the right-side content with hidden overflow.

## Goals / Non-Goals

**Goals:**

- Render every top-level field in each document card.
- Preserve the existing `_id`-first field ordering.
- Keep the right-side Documents view bounded by hidden overflow so large documents do not resize the terminal layout.
- Keep existing scalar, nested JSON, long-line, and long-multiline value handling.

**Non-Goals:**

- Add scrolling inside an individual document card.
- Change MongoDB document loading limits.
- Change tab navigation or selected-document navigation.
- Change nested value depth, line truncation, or long-line truncation rules.

## Decisions

- Remove the document field-count cap from `DocumentCardList`.
  - Rationale: the user requirement is to display all document fields; field omission is the behavior to eliminate.
  - Alternative considered: increase the cap. This still hides fields for sufficiently large documents and does not satisfy the requirement.

- Keep value-level truncation for long lines and multiline values.
  - Rationale: field presence and value expansion are separate concerns. Existing value truncation prevents a single field from monopolizing the terminal.
  - Alternative considered: render full field values. That would expand the blast radius and could make large nested values unusable in a bounded TUI.

- Rely on the existing right data container overflow clipping.
  - Rationale: the layout already owns viewport bounds, so document cards should render their content and let the container clip unavailable vertical space.
  - Alternative considered: add card-level overflow behavior. This would duplicate layout responsibility and risk inconsistent clipping between cards and tabs.

## Risks / Trade-offs

- Very wide or tall documents may place lower fields outside the visible terminal area -> Keep hidden overflow at the Documents container and retain existing selected-document navigation.
- Rendering all fields increases output size for large documents -> Preserve the existing MongoDB document limit and value truncation.
- Tests that assert hidden-field summaries will fail -> Replace them with coverage that all fields render and no hidden-field summary appears.
