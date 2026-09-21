# Intent: waitlist for sold-out events

## What
When an event is sold out, visitors can put themselves on a waitlist with
their email address and see which position they are in. Joining twice does
not create a second entry.

## Why
Conference Day 1 sells out weeks in advance. Today a visitor who comes too
late just gets "sold out" and leaves; organisers have no idea how much demand
they turned away and no one to offer returned tickets to.

## Constraints
- Everything that works today (prices, availability, invoices) keeps working
  exactly as before.
- An email address is the only personal data we store.

## Non-goals
- No notification when a ticket becomes available (follow-up).
- No reservation or payment for waitlisted visitors.
- Surviving a restart of the service (for now).
- No leaving the waitlist yet (follow-up).

## Open questions
- Should organisers see the full list or only its length? → only the length for now.
