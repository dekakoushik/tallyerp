"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useOrg } from "@/context/OrgContext";
import { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  Building,
  CreditCard,
  Trash2,
  X,
} from "lucide-react";

export default function ExpensesPage() {
  const { currentOrg } = useOrg();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!currentOrg?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/expenses?organizationId=${currentOrg.id}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (e) {
      console.error("Error loading expenses:", e);
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleOpenAdd = () => {
    setTitle("");
    setVendor("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("CASH");
    setReference("");
    setDescription("");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !title.trim() || !amount) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          title: title.trim(),
          vendor: vendor.trim() || undefined,
          amount: parseFloat(amount),
          date,
          paymentMethod,
          reference: reference.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        await fetchExpenses();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to record expense");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-rose-600" />
            <span>Operational & Farm Input Expenses</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor farm inputs (seeds, fertilizer, fuel) and corporate operating overhead
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-md shadow-rose-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 rounded-2xl text-white border border-rose-900 shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-rose-300 font-semibold">
            Total Incurred Expenses
          </span>
          <p className="text-3xl font-extrabold text-white mt-1">
            {formatCurrency(totalExpense, currentOrg?.currency, currentOrg?.currencySymbol)}
          </p>
          <p className="text-xs text-slate-300 mt-1">
            {expenses.length} expense items recorded for {currentOrg?.name}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
          <TrendingDown className="w-6 h-6" />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading expense ledger...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No expenses recorded</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Track your diesel, fertilizers, irrigation parts, or software cloud infrastructure costs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Expense Title</th>
                  <th className="px-5 py-3">Vendor / Supplier</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Payment Method</th>
                  <th className="px-5 py-3">Reference / Receipt</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{exp.title}</p>
                      {exp.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">{exp.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-700">
                      {exp.vendor || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {formatDate(exp.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {exp.paymentMethod.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-500">
                      {exp.reference || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-rose-600 text-sm">
                      {formatCurrency(exp.amount, currentOrg?.currency, currentOrg?.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Record Operating Expense</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bio-Fertilizer 50 Bags, or AWS Cloud Hosting"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Vendor / Supplier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AgriSupply Co"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Amount ({currentOrg?.currencySymbol}) *
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date Incurred
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Wire / ACH</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Receipt / Invoice Ref #
                </label>
                <input
                  type="text"
                  placeholder="Receipt # or Bill reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Remarks
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on usage or agricultural plot allocation..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
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
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
