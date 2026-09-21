import { describe, expect, it } from 'vitest';
import { applyPromoCode } from './discounts.ts';

// NOTE: this suite hits every line and branch in discounts.ts (100% line
// coverage) but only checks loose shape, not exact numbers or boundaries.
// Coverage percentage is not the same as test quality — see exercises/bonus-real-world-constraints.md.
describe('applyPromoCode', () => {
  it('returns a number for a known code', () => {
    const result = applyPromoCode(1000, 1, 'EARLY10');
    expect(typeof result).toBe('number');
  });

  it('returns a number for an unknown code', () => {
    const result = applyPromoCode(1000, 1, 'NOPE');
    expect(typeof result).toBe('number');
  });

  it('returns a number with no code', () => {
    const result = applyPromoCode(1000, 1);
    expect(typeof result).toBe('number');
  });

  it('returns a number for a large order', () => {
    const result = applyPromoCode(1000, 10, 'EARLY10');
    expect(typeof result).toBe('number');
  });
});
