"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrg } from "@/context/OrgContext";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/formatters";
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Eye,
  CheckCircle,
} from "lucide-react";

export default function EstimatesPage() {
  const router = useRouter();
  const { currentOrg, refreshOrgs } = useOrg();
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const fetchEstimates = useCallback(async () => {
    if (!currentOrg?.id) return;
    try {
      setLoading(true);
      let url = `/api/estimates?organizationId=${currentOrg.id}`;
      if (statusFilter !== "ALL") url += `&status=${statusFilter}`;
      if (search.trim()) url += `&q=${encodeURIComponent(search.trim())}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEstimates(data);
      }
    } catch (e) {
      console.error("Error loading estimates:", e);
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id, statusFilter, search]);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  const handleConvertToInvoice = async (estimateId: string) => {
    try {
      setConvertingId(estimateId);
      const res = await fetch(`/api/estimates/${estimateId}/convert`, {
        method: "POST",
      });

      if (res.ok) {
        const invoice = await res.json();
        await refreshOrgs();
        router.push(`/invoices/${invoice.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to convert estimate to invoice");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-amber-600" />
            <span>Estimates & Quotes</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Send pricing estimates, advance crop proposals, and convert them to active invoices
          </p>
        </div>

        <Link
          href="/estimates/new"
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-md shadow-indigo-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Estimate</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search estimate #, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {["ALL", "PENDING", "ACCEPTED", "CONVERTED", "REJECTED"].map((st) => (
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

      {/* Estimates Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading estimates...</p>
          </div>
        ) : estimates.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No estimates found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Draft estimates and pricing proposals for clients or prospective crop buyers.
            </p>
            <Link
              href="/estimates/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Estimate</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Estimate #</th>
                  <th className="px-5 py-3">Customer / Buyer</th>
                  <th className="px-5 py-3">Dates</th>
                  <th className="px-5 py-3">Estimated Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estimates.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/estimates/${est.id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 transition"
                      >
                        {est.estimateNumber}
                      </Link>
                      {est.referenceNumber && (
                        <span className="text-[11px] text-slate-400 block">
                          Ref: {est.referenceNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-900 block">
                        {est.customer?.name}
                      </span>
                      {est.customer?.companyName && (
                        <span className="text-xs text-slate-400 block">
                          {est.customer.companyName}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      <div>Issued: {formatDate(est.issueDate)}</div>
                      <div className="text-slate-400">Valid until: {formatDate(est.expiryDate)}</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {formatCurrency(est.totalAmount, currentOrg?.currency, currentOrg?.currencySymbol)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(est.status)}`}>
                        {est.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      {est.status !== "CONVERTED" ? (
                        <button
                          onClick={() => handleConvertToInvoice(est.id)}
                          disabled={convertingId === est.id}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md border border-indigo-200 transition disabled:opacity-50"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>{convertingId === est.id ? "Converting..." : "Convert to Invoice"}</span>
                        </button>
                      ) : (
                        <Link
                          href={`/invoices/${est.convertedInvoiceId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 rounded-md border border-purple-200"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>View Invoice</span>
                        </Link>
                      )}
                      <Link
                        href={`/estimates/${est.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
