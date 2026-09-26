import { describe, expect, it } from 'vitest';
import { GROUP_DISCOUNT_THRESHOLD, VAT_RATE, calculateOrderTotalCents } from './pricing.ts';

describe('calculateOrderTotalCents', () => {
  it('charges unit price times quantity with VAT for a single ticket', () => {
    const total = calculateOrderTotalCents({ unitPriceCents: 1000, quantity: 1 });
    expect(total).toBe(Math.round(1000 * (1 + VAT_RATE)));
  });

  it('applies the group discount at the threshold quantity', () => {
    const subtotal = 1000 * GROUP_DISCOUNT_THRESHOLD;
    const discounted = subtotal * 0.9;
    const total = calculateOrderTotalCents({
      unitPriceCents: 1000,
      quantity: GROUP_DISCOUNT_THRESHOLD,
    });
    expect(total).toBe(Math.round(discounted * (1 + VAT_RATE)));
  });

  it('does not apply the group discount one ticket below the threshold', () => {
    const total = calculateOrderTotalCents({
      unitPriceCents: 1000,
      quantity: GROUP_DISCOUNT_THRESHOLD - 1,
    });
    const subtotal = 1000 * (GROUP_DISCOUNT_THRESHOLD - 1);
    expect(total).toBe(Math.round(subtotal * (1 + VAT_RATE)));
  });

  it('applies a promo code for small orders', () => {
    const total = calculateOrderTotalCents({
      unitPriceCents: 1000,
      quantity: 1,
      promoCode: 'EARLY10',
    });
    expect(total).toBe(Math.round(1000 * 0.9 * (1 + VAT_RATE)));
  });

  it('rounds fractional VAT to the nearest cent', () => {
    const total = calculateOrderTotalCents({ unitPriceCents: 999, quantity: 1 });
    expect(total).toBe(Math.round(999 * (1 + VAT_RATE)));
    expect(Number.isInteger(total)).toBe(true);
  });

  it('rejects a non-positive quantity', () => {
    expect(() => calculateOrderTotalCents({ unitPriceCents: 1000, quantity: 0 })).toThrow();
  });

  it('rejects a negative unit price', () => {
    expect(() => calculateOrderTotalCents({ unitPriceCents: -1, quantity: 1 })).toThrow();
  });
});
