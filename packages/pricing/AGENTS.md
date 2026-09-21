# packages/pricing

- Money is always an integer number of **cents** (`...Cents`). Never floats, never euros.
- Round only once, at the end (`Math.round`), as `calculateOrderTotalCents` does.
- VAT is 19 % and applied after discounts.
