# Spec: <name>

## Intent

One paragraph. What outcome does this change need to produce, and for whom?
Not "add a function" — the actual goal (e.g. "customers who miss a sold-out
event's tickets can queue for a refund/cancellation instead of losing the
sale entirely").

## Spec

### Behavior

Describe the behavior in plain language. What should happen, in what order,
for the normal case and for the edge cases you already know about.

### Acceptance criteria (Given-When-Then)

- Given `<starting state>`, when `<action>`, then `<observable result>`.
- Given `<starting state>`, when `<action>`, then `<observable result>`.
- Given `<edge case>`, when `<action>`, then `<observable result>`.

(Write at least one criterion for the happy path and at least one for an
edge case or error path. Each one should be turned into a test almost
verbatim — see Ü5 and the red-green skill.)

### Non-goals

What this change explicitly does NOT do. Cutting scope here is as important
as the behavior above — an agent without stated non-goals will happily
build the bigger thing.

## Tasks

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

(Keep tasks small enough that each one maps to roughly one commit.)
