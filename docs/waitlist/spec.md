# Spec: waitlist for sold-out events

Source: docs/waitlist/intent.md

## Behaviour
A visitor joins the waitlist of a sold-out event with
`POST /events/:id/waitlist` and body `{ "email": "..." }`. They get their
1-based position. Joining again with the same email returns the existing
position instead of adding a second entry. Joining an event that still has
tickets is rejected, so nobody queues for something they could just buy.
`GET /events/:id/waitlist` returns how many people are waiting.

## Acceptance criteria
- AC1 — Given `evt-1` is sold out and its waitlist is empty, when
  `a@example.com` joins, then the response is `201` with `{ "position": 1 }`.
- AC2 — Given `a@example.com` is on the `evt-1` waitlist, when
  `b@example.com` joins, then the response is `201` with `{ "position": 2 }`.
- AC3 — Given `a@example.com` is on the `evt-1` waitlist at position 1, when
  `a@example.com` joins again, then the response is `200` with
  `{ "position": 1 }` and the waitlist length is unchanged.
- AC4 — Given `evt-2` is not sold out, when anyone joins its waitlist, then
  the response is `409` with an `error` message.
- AC5 — Given an unknown event id, when anyone joins its waitlist or reads
  its length, then the response is `404`.
- AC6 — Given a join request without a string `email` containing `@`, when it
  is sent, then the response is `400` with an `error` message.
- AC7 — Given two people on the `evt-1` waitlist, when
  `GET /events/evt-1/waitlist` is called, then the response is `200` with
  `{ "eventId": "evt-1", "length": 2 }`.

## Non-goals
- No notifications, reservations or payments.
- No persistence across restarts.
- No leaving the waitlist.
- No listing of individual entries.

## Assumptions
- Emails are compared exactly as sent (no lower-casing) — good enough for now.
- Waitlist state lives per `createApp()` instance, like the availability cache.

## Tasks
- [ ] T1 — In-memory waitlist store with join + length (AC1, AC2, AC3)
- [ ] T2 — `POST /events/:id/waitlist` with validation (AC1–AC6)
- [ ] T3 — `GET /events/:id/waitlist` (AC5, AC7)
