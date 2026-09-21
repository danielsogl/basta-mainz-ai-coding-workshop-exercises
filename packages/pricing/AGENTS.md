# packages/pricing

- Money is always an integer number of **cents** (`...Cents`). Never floats, never euros.
- Each step (group rate, promo code, VAT) rounds to whole cents with `Math.round`, as `pricing.ts` does.
- VAT is 19 % and applied after discounts.
