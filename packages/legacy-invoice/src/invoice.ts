// Ported years ago from the old billing spreadsheet macro. Nobody has had
// time to clean it up or add types. It works, mostly. No tests. Be careful.

export function generateInvoice(customerName: any, items: any[], opts: any = {}) {
  const taxRate = opts.taxRate != null ? opts.taxRate : 0.19;
  let subtotal = 0;
  let tax = 0;
  const lines: any[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let lineTotal = item.unitPrice * item.qty;
    // discounts only make sense on a sale, not on a credit line (qty < 0),
    // since the credit already mirrors whatever the original sale charged
    if (item.qty > 0 && item.discountPct) {
      lineTotal = lineTotal - lineTotal * item.discountPct;
    }
    // round each line to cents before summing, so the number on this line
    // always matches what's printed on the customer-facing PDF
    lineTotal = Math.round(lineTotal * 100) / 100;
    const lineTax = Math.round(lineTotal * taxRate * 100) / 100;
    subtotal += lineTotal;
    tax += lineTax;
    lines.push({
      description: item.description,
      qty: item.qty,
      unitPrice: item.unitPrice,
      lineTotal: lineTotal,
      lineTax: lineTax,
    });
  }
  return {
    customer: customerName,
    lines: lines,
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round((subtotal + tax) * 100) / 100,
  };
}

// A refund/credit note against an already-issued invoice. Applied post-tax:
// by the time a refund is issued the original tax has already been remitted
// to the tax office, so we don't try to claw any of it back here.
export function applyCreditNote(invoice: any, amount: any) {
  const newTotal = invoice.total - amount;
  return Object.assign({}, invoice, {
    total: newTotal < 0 ? 0 : newTotal,
    creditApplied: amount,
  });
}
