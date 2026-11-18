"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useOrg } from "@/context/OrgContext";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  Building,
  User,
  X,
} from "lucide-react";

export default function PaymentsPage() {
  const { currentOrg } = useOrg();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // New Payment Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!currentOrg?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/payments?organizationId=${currentOrg.id}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (e) {
      console.error("Error loading payments:", e);
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id]);

  const fetchCustomerData = useCallback(async () => {
    if (!currentOrg?.id) return;
    try {
      const [custRes, invRes] = await Promise.all([
        fetch(`/api/customers?organizationId=${currentOrg.id}`),
        fetch(`/api/invoices?organizationId=${currentOrg.id}&status=UNPAID`),
      ]);
      if (custRes.ok) setCustomers(await custRes.json());
      if (invRes.ok) setInvoices(await invRes.json());
    } catch (e) {}
  }, [currentOrg?.id]);

  useEffect(() => {
    fetchPayments();
    fetchCustomerData();
  }, [fetchPayments, fetchCustomerData]);

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !selectedCustomerId || !amount) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          customerId: selectedCustomerId,
          invoiceId: selectedInvoiceId || null,
          amount: parseFloat(amount),
          paymentMethod: method,
          reference,
          notes,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setAmount("");
        setReference("");
        setNotes("");
        await fetchPayments();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to record payment");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>Payments & Collections Ledger</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track received remittances, customer reconciliations, and wire transactions
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-md shadow-emerald-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-6 rounded-2xl text-white border border-emerald-900 shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Total Revenue Collected
          </span>
          <p className="text-3xl font-extrabold text-white mt-1">
            {formatCurrency(totalCollected, currentOrg?.currency, currentOrg?.currencySymbol)}
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Recorded across {payments.length} transactions in {currentOrg?.name}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading payment entries...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No payment records yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Payments recorded when settling invoices or advance customer receipts will show here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Receipt #</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Customer / Buyer</th>
                  <th className="px-5 py-3">Linked Invoice</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Reference / Txn ID</th>
                  <th className="px-5 py-3 text-right">Amount Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {p.paymentNumber}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {p.customer?.name}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      {p.invoice ? (
                        <Link
                          href={`/invoices/${p.invoice.id}`}
                          className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <span>{p.invoice.invoiceNumber}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-slate-400">Direct / Account Credit</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {p.paymentMethod.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-500">
                      {p.reference || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-700 text-sm">
                      {formatCurrency(p.amount, currentOrg?.currency, currentOrg?.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Record Payment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Customer / Buyer *
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ""} - Balance: {formatCurrency(c.currentBalance, currentOrg?.currency, currentOrg?.currencySymbol)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Link to Invoice (Optional)
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = invoices.find((i) => i.id === e.target.value);
                    if (inv) {
                      setAmount(inv.balanceAmount.toString());
                      setSelectedCustomerId(inv.customerId);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">-- General Account Payment --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} ({inv.customer?.name}) - Due: {formatCurrency(inv.balanceAmount, currentOrg?.currency, currentOrg?.currencySymbol)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount Received ({currentOrg?.currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
