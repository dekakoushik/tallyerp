"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useOrg } from "@/context/OrgContext";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/formatters";
import {
  FileText,
  Plus,
  Search,
  Filter,
  CreditCard,
  Printer,
  ChevronRight,
  Clock,
  CheckCircle2,
  DollarSign,
  X,
} from "lucide-react";

export default function InvoicesPage() {
  const { currentOrg } = useOrg();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Payment modal state
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const fetchInvoices = useCallback(async () => {
    if (!currentOrg?.id) return;
    try {
      setLoading(true);
      let url = `/api/invoices?organizationId=${currentOrg.id}`;
      if (statusFilter !== "ALL") url += `&status=${statusFilter}`;
      if (search.trim()) url += `&q=${encodeURIComponent(search.trim())}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (e) {
      console.error("Error loading invoices:", e);
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id, statusFilter, search]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleOpenPayment = (inv: any) => {
    setSelectedInvoiceForPayment(inv);
    setPaymentAmount(inv.balanceAmount.toString());
    setPaymentRef("");
    setPaymentNotes("");
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment || !currentOrg) return;

    try {
      setIsSubmittingPayment(true);
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          invoiceId: selectedInvoiceForPayment.id,
          customerId: selectedInvoiceForPayment.customerId,
          amount: parseFloat(paymentAmount),
          paymentMethod,
          reference: paymentRef,
          notes: paymentNotes,
        }),
      });

      if (res.ok) {
        setSelectedInvoiceForPayment(null);
        await fetchInvoices();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to record payment");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>Invoices & Billing</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, issue, track, and record payments for {currentOrg?.name}
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-md shadow-indigo-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {["ALL", "UNPAID", "PARTIAL", "PAID", "OVERDUE"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No invoices found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Get started by creating your first bill or professional invoice for this company/farm.
            </p>
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Invoice</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Customer / Buyer</th>
                  <th className="px-5 py-3">Dates</th>
                  <th className="px-5 py-3">Total Amount</th>
                  <th className="px-5 py-3">Balance Due</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => {
                  const isOverdue = inv.balanceAmount > 0 && new Date(inv.dueDate) < new Date();
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition flex items-center gap-1.5"
                        >
                          <span>{inv.invoiceNumber}</span>
                        </Link>
                        {inv.referenceNumber && (
                          <span className="text-[11px] text-slate-400 block font-mono">
                            Ref: {inv.referenceNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-900 block">
                          {inv.customer?.name}
                        </span>
                        {inv.customer?.companyName && (
                          <span className="text-xs text-slate-400 block">
                            {inv.customer.companyName}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        <div>
                          <span>Issued: </span>
                          <span className="text-slate-700 font-medium">{formatDate(inv.issueDate)}</span>
                        </div>
                        <div className="mt-0.5">
                          <span>Due: </span>
                          <span className={isOverdue ? "text-rose-600 font-bold" : "text-slate-700"}>
                            {formatDate(inv.dueDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {formatCurrency(inv.totalAmount, currentOrg?.currency, currentOrg?.currencySymbol)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`font-semibold ${
                            inv.balanceAmount > 0 ? "text-amber-700 font-bold" : "text-emerald-600"
                          }`}
                        >
                          {formatCurrency(inv.balanceAmount, currentOrg?.currency, currentOrg?.currencySymbol)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                            isOverdue ? "OVERDUE" : inv.status
                          )}`}
                        >
                          {isOverdue ? "OVERDUE" : inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        {inv.balanceAmount > 0 && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md border border-emerald-200 transition"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay</span>
                          </button>
                        )}
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Payment</h3>
                <p className="text-xs text-slate-500">
                  Invoice #{selectedInvoiceForPayment.invoiceNumber} • {selectedInvoiceForPayment.customer?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 flex justify-between items-center">
                <span className="text-xs font-medium text-indigo-900">Outstanding Balance:</span>
                <span className="text-base font-bold text-indigo-700">
                  {formatCurrency(
                    selectedInvoiceForPayment.balanceAmount,
                    currentOrg?.currency,
                    currentOrg?.currencySymbol
                  )}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Amount ({currentOrg?.currencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                    {currentOrg?.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    max={selectedInvoiceForPayment.balanceAmount}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional internal remarks..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-md transition disabled:opacity-50"
                >
                  {isSubmittingPayment ? "Recording..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
