---
name: openspec-review-change
description: Review an active OpenSpec change for unresolved questions, ambiguity, missing decisions, and inconsistencies before implementation or verification. Use when the user asks to review the current change, find open questions, decide what can be decided from project context, or ask only for decisions that require user input.
---

# OpenSpec Review Change

Review a change as a decision filter: resolve what can be resolved from the artifacts and codebase, then ask the user only for decisions that remain genuinely ambiguous.

## Workflow

1. Identify the change.
   - If the user named a change, use it.
   - Otherwise run `openspec list --json`.
   - If exactly one active change exists, use it.
   - If multiple active changes exist, ask the user to choose.
   - If no active changes exist, state that there is no current OpenSpec change to review and stop.

2. Load authoritative context.
   - Run `openspec status --change "<name>" --json` to identify the schema and artifact availability.
   - Run `openspec instructions apply --change "<name>" --json` to get `contextFiles`.
   - Read every file listed in `contextFiles`.
   - Read relevant main specs under `openspec/specs/` when delta specs refer to existing capabilities.
   - Search the codebase for implementation patterns only when artifact context is insufficient.

3. Review for open questions.
   - Scope gaps: unclear goals, excluded behavior, migration expectations, compatibility assumptions.
   - Requirement ambiguity: vague actors, inputs, outputs, states, error handling, edge cases, or scenarios.
   - Design uncertainty: undecided architecture, ownership boundaries, data flow, APIs, persistence, rendering, CLI behavior, testing strategy.
   - Artifact mismatch: proposal, design, tasks, and specs saying different things.
   - Implementation blockers: tasks that cannot be executed without a missing decision.

4. Decide what can be decided.
   - Prefer decisions already implied by accepted specs, current code patterns, package constraints, and existing project conventions.
   - Do not preserve backward compatibility unless the user explicitly asks for it.
   - Do not ask about choices that have a clear local precedent.
   - Record each inferred decision with the evidence that supports it.
   - Treat weak preference, product intent, naming, or UX behavior with no precedent as user decisions.

5. Ask only for unresolved decisions.
   - Ask concise, numbered questions.
   - For each question, include the practical impact of each plausible answer.
   - Do not ask broad preference questions when a conservative implementation path is available.
   - If there are no unresolved decisions, say so and list the decisions made from context.

## Output

Use this structure:

```markdown
Using change: <name>

Resolved decisions:

- <decision> - <evidence>

Open questions:

1. <question>
   Impact: <why this blocks or changes implementation>

No user decision needed:

- <issue considered> - <why it can be decided locally>
```

Omit empty sections. Keep the report short and action-oriented.
