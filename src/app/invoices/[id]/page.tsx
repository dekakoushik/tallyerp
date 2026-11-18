"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/formatters";
import {
  Printer,
  ArrowLeft,
  CreditCard,
  Building2,
  Tractor,
  Mail,
  Phone,
  Globe,
  Trash2,
  CheckCircle,
  Clock,
  X,
  Share2,
} from "lucide-react";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/invoices/${id}`);
      if (res.ok) {
        const data = await res.json();
        setInvoice(data);
        setPaymentAmount(data.balanceAmount.toString());
      }
    } catch (e) {
      console.error("Error fetching invoice:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handlePrint = () => {
    window.print();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    try {
      setRecordingPayment(true);
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: invoice.organizationId,
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          amount: parseFloat(paymentAmount),
          paymentMethod,
          reference: paymentRef,
          notes: paymentNotes,
        }),
      });

      if (res.ok) {
        setShowPaymentModal(false);
        await fetchInvoice();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to record payment");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!invoice) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchInvoice();
      }
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice? Stock and customer balances will be restored.")) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/invoices");
      }
    } catch (e) {
      alert("Failed to delete invoice");
    }
  };

  if (loading || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading invoice document...</p>
      </div>
    );
  }

  const org = invoice.organization;
  const customer = invoice.customer;
  const isOverdue = invoice.balanceAmount > 0 && new Date(invoice.dueDate) < new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{invoice.invoiceNumber}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(isOverdue ? "OVERDUE" : invoice.status)}`}>
                {isOverdue ? "OVERDUE" : invoice.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">Issued to {customer.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {invoice.balanceAmount > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <select
            value={invoice.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500"
          >
            <option value="UNPAID">Mark as Unpaid</option>
            <option value="SENT">Mark as Sent</option>
            <option value="PAID">Mark as Paid</option>
            <option value="CANCELLED">Mark as Cancelled</option>
          </select>

          <button
            onClick={handleDelete}
            title="Delete Invoice"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Professional Printable Invoice Sheet */}
      <div className="printable-invoice bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-12 space-y-8">
        {/* Invoice Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                {org.type === "FARM" ? <Tractor className="w-5 h-5 text-emerald-400" /> : <Building2 className="w-5 h-5 text-indigo-400" />}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{org.name}</h2>
                {org.legalName && <p className="text-xs text-slate-500">{org.legalName}</p>}
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-0.5 mt-3">
              {org.address && <p>{org.address}</p>}
              <p>
                {org.city && `${org.city}, `}
                {org.state && `${org.state} `}
                {org.zipCode && `${org.zipCode} `}
                {org.country}
              </p>
              {org.email && (
                <p className="flex items-center gap-1.5 pt-0.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{org.email}</span>
                </p>
              )}
              {org.phone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{org.phone}</span>
                </p>
              )}
              {org.taxId && (
                <p className="font-mono text-slate-700 font-medium pt-1">
                  Tax / Reg ID: {org.taxId}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              {invoice.type === "FARM_SALE"
                ? "Farm Produce Bill"
                : invoice.type === "PROFORMA"
                ? "Proforma Invoice"
                : "Tax Invoice"}
            </h1>
            <p className="text-sm font-mono font-bold text-indigo-600 mt-1">
              #{invoice.invoiceNumber}
            </p>

            <div className="mt-4 space-y-1 text-xs">
              <div className="flex justify-end gap-3 text-slate-500">
                <span>Issue Date:</span>
                <span className="font-semibold text-slate-800">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-end gap-3 text-slate-500">
                <span>Payment Due:</span>
                <span className="font-semibold text-slate-800">{formatDate(invoice.dueDate)}</span>
              </div>
              {invoice.referenceNumber && (
                <div className="flex justify-end gap-3 text-slate-500">
                  <span>Reference:</span>
                  <span className="font-mono text-slate-800">{invoice.referenceNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Billed To / Shipping Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-2">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Billed To
            </span>
            <h3 className="text-base font-bold text-slate-900">{customer.name}</h3>
            {customer.companyName && (
              <p className="text-xs font-medium text-slate-600">{customer.companyName}</p>
            )}
            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
              {customer.billingAddress && <p>{customer.billingAddress}</p>}
              <p>
                {customer.city && `${customer.city}, `}
                {customer.state && `${customer.state} `}
                {customer.zipCode && `${customer.zipCode} `}
                {customer.country}
              </p>
              {customer.email && <p>{customer.email}</p>}
              {customer.phone && <p>{customer.phone}</p>}
              {customer.taxId && (
                <p className="font-mono text-slate-700 font-medium pt-1">
                  Tax ID: {customer.taxId}
                </p>
              )}
            </div>
          </div>

          {customer.shippingAddress && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Ship / Delivery To
              </span>
              <div className="text-xs text-slate-600 space-y-0.5">
                <p>{customer.shippingAddress}</p>
                <p>
                  {customer.city && `${customer.city}, `}
                  {customer.state && `${customer.state} `}
                  {customer.country}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-2 w-10 text-center">#</th>
                <th className="py-3 px-3">Item Description</th>
                <th className="py-3 px-3 text-center w-16">Qty</th>
                <th className="py-3 px-3 text-center w-20">Unit</th>
                <th className="py-3 px-3 text-right w-24">Rate ({org.currencySymbol})</th>
                <th className="py-3 px-3 text-right w-16">Disc %</th>
                <th className="py-3 px-3 text-right w-16">Tax %</th>
                <th className="py-3 px-3 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items?.map((item: any, i: number) => (
                <tr key={item.id || i} className="py-3">
                  <td className="py-3 px-2 text-center text-slate-400 font-mono">{i + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 text-sm">{item.itemName}</p>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                    )}
                    {item.product?.hsnSacCode && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        HSN/SAC: {item.product.hsnSacCode}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-800">{item.quantity}</td>
                  <td className="py-3 px-3 text-center text-slate-500">{item.unit}</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-800">
                    {formatCurrency(item.unitPrice, org.currency, org.currencySymbol)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500">
                    {item.discountPercent ? `${item.discountPercent}%` : "—"}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500">
                    {item.taxRate ? `${item.taxRate}%` : "0%"}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 text-sm">
                    {formatCurrency(item.total, org.currency, org.currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pt-4 border-t border-slate-200">
          {/* Bank Payment Information */}
          <div className="max-w-md text-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Remittance & Bank Details
            </span>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
              {org.bankName && <p><span className="font-semibold text-slate-900">Bank:</span> {org.bankName}</p>}
              {org.bankAccount && <p><span className="font-semibold text-slate-900">Account #:</span> {org.bankAccount}</p>}
              {org.bankIfscSwift && <p><span className="font-semibold text-slate-900">SWIFT / IFSC:</span> {org.bankIfscSwift}</p>}
              {org.bankBranch && <p><span className="font-semibold text-slate-900">Branch:</span> {org.bankBranch}</p>}
              {org.upiId && <p><span className="font-semibold text-slate-900">UPI / QR ID:</span> {org.upiId}</p>}
            </div>
          </div>

          {/* Amount Calculation Box */}
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(invoice.subTotal, org.currency, org.currencySymbol)}
              </span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Discount:</span>
                <span className="font-semibold">
                  -{formatCurrency(invoice.discountAmount, org.currency, org.currencySymbol)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Tax Amount:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(invoice.taxAmount, org.currency, org.currencySymbol)}
              </span>
            </div>

            <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-sm font-bold text-slate-900">
              <span className="text-base">Total Amount:</span>
              <span className="text-base">
                {formatCurrency(invoice.totalAmount, org.currency, org.currencySymbol)}
              </span>
            </div>

            <div className="flex justify-between text-emerald-700 font-semibold pt-1">
              <span>Amount Paid:</span>
              <span>
                {formatCurrency(invoice.paidAmount, org.currency, org.currencySymbol)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 text-white flex justify-between items-center text-sm font-bold mt-2">
              <span>Balance Due:</span>
              <span className="text-base text-amber-400">
                {formatCurrency(invoice.balanceAmount, org.currency, org.currencySymbol)}
              </span>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-500">
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Terms & Conditions</h4>
            <p className="leading-relaxed">{invoice.terms || org.notesTerms}</p>
            {invoice.notes && (
              <div className="mt-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Remarks</h4>
                <p className="leading-relaxed">{invoice.notes}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end items-end text-right">
            <div className="w-48 border-b border-slate-300 pb-1 mb-1 text-center font-cursive text-sm text-slate-800 italic">
              {org.name}
            </div>
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Authorized Signature
            </p>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Record Payment Received</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex justify-between items-center text-xs">
                <span className="font-medium text-emerald-900">Current Balance Due:</span>
                <span className="text-base font-bold text-emerald-700">
                  {formatCurrency(invoice.balanceAmount, org.currency, org.currencySymbol)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount Received ({org.currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={invoice.balanceAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Wire / ACH / Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="UPI">UPI / Instant Pay</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="ONLINE">Online Portal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reference / Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wire confirmation, Chq #, etc."
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  {recordingPayment ? "Saving..." : "Confirm & Update Balance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
