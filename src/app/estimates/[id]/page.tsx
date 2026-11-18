"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/formatters";
import {
  Printer,
  ArrowLeft,
  ArrowRight,
  Building2,
  Tractor,
  Mail,
  Phone,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";

export default function EstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);

  const fetchEstimate = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/estimates/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEstimate(data);
      }
    } catch (e) {
      console.error("Error fetching estimate:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEstimate();
  }, [fetchEstimate]);

  const handlePrint = () => {
    window.print();
  };

  const handleConvert = async () => {
    try {
      setConverting(true);
      const res = await fetch(`/api/estimates/${id}/convert`, { method: "POST" });
      if (res.ok) {
        const invoice = await res.json();
        router.push(`/invoices/${invoice.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to convert estimate");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setConverting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!estimate) return;
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchEstimate();
      }
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this estimate?")) return;
    try {
      const res = await fetch(`/api/estimates/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/estimates");
      }
    } catch (e) {
      alert("Failed to delete estimate");
    }
  };

  if (loading || !estimate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading estimate document...</p>
      </div>
    );
  }

  const org = estimate.organization;
  const customer = estimate.customer;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Action Bar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/estimates"
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{estimate.estimateNumber}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(estimate.status)}`}>
                {estimate.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">Quote for {customer.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {estimate.status !== "CONVERTED" ? (
            <button
              onClick={handleConvert}
              disabled={converting}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>{converting ? "Converting to Invoice..." : "Convert to Invoice"}</span>
            </button>
          ) : (
            <Link
              href={`/invoices/${estimate.convertedInvoiceId}`}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold rounded-lg hover:bg-purple-100 transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>View Generated Invoice</span>
            </Link>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <select
            value={estimate.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={estimate.status === "CONVERTED"}
            className="text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500"
          >
            <option value="PENDING">Status: Pending</option>
            <option value="ACCEPTED">Status: Accepted</option>
            <option value="REJECTED">Status: Rejected</option>
            {estimate.status === "CONVERTED" && <option value="CONVERTED">Status: Converted</option>}
          </select>

          <button
            onClick={handleDelete}
            title="Delete Estimate"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Estimate Sheet */}
      <div className="printable-invoice bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-12 space-y-8">
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
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              Estimate / Quote
            </h1>
            <p className="text-sm font-mono font-bold text-amber-600 mt-1">
              #{estimate.estimateNumber}
            </p>

            <div className="mt-4 space-y-1 text-xs">
              <div className="flex justify-end gap-3 text-slate-500">
                <span>Estimate Date:</span>
                <span className="font-semibold text-slate-800">{formatDate(estimate.issueDate)}</span>
              </div>
              <div className="flex justify-end gap-3 text-slate-500">
                <span>Valid Until:</span>
                <span className="font-semibold text-slate-800">{formatDate(estimate.expiryDate)}</span>
              </div>
              {estimate.referenceNumber && (
                <div className="flex justify-end gap-3 text-slate-500">
                  <span>Reference:</span>
                  <span className="font-mono text-slate-800">{estimate.referenceNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="py-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Proposed For:
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
              {customer.country}
            </p>
            {customer.email && <p>{customer.email}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-2 w-10 text-center">#</th>
                <th className="py-3 px-3">Item / Service Description</th>
                <th className="py-3 px-3 text-center w-16">Qty</th>
                <th className="py-3 px-3 text-center w-20">Unit</th>
                <th className="py-3 px-3 text-right w-24">Rate ({org.currencySymbol})</th>
                <th className="py-3 px-3 text-right w-16">Disc %</th>
                <th className="py-3 px-3 text-right w-16">Tax %</th>
                <th className="py-3 px-3 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {estimate.items?.map((item: any, i: number) => (
                <tr key={item.id || i} className="py-3">
                  <td className="py-3 px-2 text-center text-slate-400 font-mono">{i + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 text-sm">{item.itemName}</p>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
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

        {/* Summary */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(estimate.subTotal, org.currency, org.currencySymbol)}
              </span>
            </div>

            {estimate.discountAmount > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Discount:</span>
                <span className="font-semibold">
                  -{formatCurrency(estimate.discountAmount, org.currency, org.currencySymbol)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Tax Amount:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(estimate.taxAmount, org.currency, org.currencySymbol)}
              </span>
            </div>

            <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-base font-bold text-slate-900">
              <span>Estimated Total:</span>
              <span className="text-xl text-amber-600">
                {formatCurrency(estimate.totalAmount, org.currency, org.currencySymbol)}
              </span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="border-t border-slate-100 pt-6 text-xs text-slate-500">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Estimate Terms & Remarks</h4>
          <p className="leading-relaxed">{estimate.terms}</p>
          {estimate.notes && <p className="mt-2 text-slate-600">{estimate.notes}</p>}
        </div>
      </div>
    </div>
  );
}
