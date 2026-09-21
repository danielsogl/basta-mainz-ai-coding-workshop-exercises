#!/usr/bin/env bash
# Stop hook: don't let a turn end until typecheck and the tests affected by
# the current change pass. Exit 2 blocks the stop; stderr goes back to
# Claude so it can act on the failure.
#
# This script ignores the Stop hook's JSON payload on stdin entirely (it
# only needs $CLAUDE_PROJECT_DIR) — malformed or missing stdin has no
# effect either way, it isn't read.
#
# Uses `test:affected` (vitest run --changed), not the full suite, and
# excludes tests tagged BASELINE: (see e.g.
# apps/api/src/server.test.ts) from the pass/fail check. Those are known,
# pre-existing, accepted-as-broken failures — recorded once, at the test
# name, as the single source of truth (see
# exercises/bonus-real-world-constraints.md) — not this hook's job to fix. A
# Stop hook that blocks every turn on unrelated, already-known breakage
# trains you to silence the hook instead of trusting it: without this
# exclusion, editing packages/pricing or apps/api (the waitlist) pulls
# in apps/api/src/server.test.ts transitively and blocks on the baseline
# failure every single time, regardless of whether the actual change is
# correct. Anything NOT tagged BASELINE: — including the flaky test when
# it genuinely fails — still blocks normally.
set -euo pipefail
cd "$CLAUDE_PROJECT_DIR"

if ! npm run --silent typecheck; then
  echo "typecheck failed — fix the errors above before stopping." >&2
  exit 2
fi

if ! npm run --silent test:affected -- -t '^(?!.*BASELINE:).*$'; then
  echo "affected tests failed — fix the failures above before stopping." >&2
  exit 2
fi

exit 0
