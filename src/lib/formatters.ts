export function formatCurrency(amount: number | null | undefined, currency: string = "INR", symbol: string = "₹"): string {
  const val = amount ?? 0;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  } catch {
    return `${symbol || "₹"}${val.toFixed(2)}`;
  }
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function calculateItemTotal(
  quantity: number,
  unitPrice: number,
  discountPercent: number = 0,
  taxRate: number = 0
) {
  const basePrice = (quantity || 0) * (unitPrice || 0);
  const discountAmt = basePrice * ((discountPercent || 0) / 100);
  const taxableAmt = Math.max(0, basePrice - discountAmt);
  const taxAmt = taxableAmt * ((taxRate || 0) / 100);
  const total = taxableAmt + taxAmt;

  return {
    basePrice,
    discountAmt,
    taxableAmt,
    taxAmt,
    total: Math.round(total * 100) / 100,
  };
}

export function calculateInvoiceTotals(
  items: Array<{ quantity: number; unitPrice: number; discountPercent?: number; taxRate?: number }>,
  discountType: "FIXED" | "PERCENTAGE" = "FIXED",
  discountValue: number = 0
) {
  let subTotal = 0;
  let totalItemTax = 0;

  for (const item of items) {
    const itemCalc = calculateItemTotal(
      item.quantity || 0,
      item.unitPrice || 0,
      item.discountPercent || 0,
      item.taxRate || 0
    );
    subTotal += itemCalc.taxableAmt;
    totalItemTax += itemCalc.taxAmt;
  }

  let overallDiscountAmt = 0;
  if (discountType === "PERCENTAGE") {
    overallDiscountAmt = subTotal * ((discountValue || 0) / 100);
  } else {
    overallDiscountAmt = discountValue || 0;
  }

  overallDiscountAmt = Math.min(overallDiscountAmt, subTotal);
  const finalTaxable = Math.max(0, subTotal - overallDiscountAmt);
  const totalAmount = finalTaxable + totalItemTax;

  return {
    subTotal: Math.round(subTotal * 100) / 100,
    discountAmount: Math.round(overallDiscountAmt * 100) / 100,
    taxAmount: Math.round(totalItemTax * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

export function getStatusBadgeClass(status: string): string {
  switch (status?.toUpperCase()) {
    case "PAID":
    case "ACCEPTED":
    case "HARVESTED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20";
    case "PARTIAL":
    case "GROWING":
      return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20";
    case "PENDING":
    case "SENT":
    case "PLANNED":
      return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20";
    case "OVERDUE":
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20";
    case "CONVERTED":
      return "bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20";
  }
}
