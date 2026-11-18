"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useOrg } from "@/context/OrgContext";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/formatters";
import {
  TrendingUp,
  CreditCard,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Package,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Tractor,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const { currentOrg, isLoading: isOrgLoading } = useOrg();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!currentOrg?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard/stats?organizationId=${currentOrg.id}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to load dashboard metrics:", e);
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isOrgLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading executive dashboard...</p>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalExpenses: 0,
    netIncome: 0,
    overdueCount: 0,
    estimatesCount: 0,
    invoicesCount: 0,
  };

  const isFarm = currentOrg?.type === "FARM" || currentOrg?.type === "AGRO_ENTERPRISE";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {currentOrg?.type === "FARM" ? "Farm Operation Center" : "Corporate Billing Dashboard"}
            </span>
            <span className="text-xs text-slate-400">• Currency: {currentOrg?.currency}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {currentOrg?.name}
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            {currentOrg?.legalName || "Complete financial, invoice, and operational overview"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/invoices/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </Link>
          <Link
            href="/estimates/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition border border-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>New Estimate</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Invoiced
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">
            {formatCurrency(metrics.totalInvoiced, currentOrg?.currency, currentOrg?.currencySymbol)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
            <span>{metrics.invoicesCount} invoices issued</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Collected Revenue
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-3">
            {formatCurrency(metrics.totalCollected, currentOrg?.currency, currentOrg?.currencySymbol)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Paid & settled funds</span>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Pending Receivables
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-3">
            {formatCurrency(metrics.totalOutstanding, currentOrg?.currency, currentOrg?.currencySymbol)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-2 font-medium">
            {metrics.overdueCount > 0 ? (
              <span className="text-rose-600 font-semibold">⚠️ {metrics.overdueCount} Overdue</span>
            ) : (
              <span>All payments on schedule</span>
            )}
          </div>
        </div>

        {/* Net Operating Balance */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Net Balance
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-3 ${metrics.netIncome >= 0 ? "text-slate-900" : "text-rose-600"}`}>
            {formatCurrency(metrics.netIncome, currentOrg?.currency, currentOrg?.currencySymbol)}
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
            <span>Expenses: {formatCurrency(metrics.totalExpenses, currentOrg?.currency, currentOrg?.currencySymbol)}</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content: Invoices Table + Farm Batches or Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Invoices</h2>
              <p className="text-xs text-slate-500">Latest billing transactions and payment statuses</p>
            </div>
            <Link
              href="/invoices"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Invoice #</th>
                  <th className="px-5 py-3">Client / Buyer</th>
                  <th className="px-5 py-3">Issue Date</th>
                  <th className="px-5 py-3">Total Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stats?.recentInvoices?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">
                      No invoices created yet for this organization.
                    </td>
                  </tr>
                ) : (
                  stats?.recentInvoices?.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        <Link href={`/invoices/${inv.id}`} className="hover:text-indigo-600">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-slate-800">
                        {inv.customer?.name || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">
                        {formatDate(inv.issueDate)}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {formatCurrency(inv.totalAmount, currentOrg?.currency, currentOrg?.currencySymbol)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="text-xs text-indigo-600 hover:text-indigo-900 font-semibold"
                        >
                          View & Print
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Farm Batches or Inventory Alerts */}
        <div className="space-y-6">
          {/* Farm Batches Card (Shown especially if Farm or Agro) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tractor className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {isFarm ? "Farm Batches & Harvest" : "Active Farm Projects"}
                </h3>
              </div>
              <Link
                href="/farm-batches"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
              >
                Manage
              </Link>
            </div>

            {stats?.farmBatches?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No active farm batches logged.
              </p>
            ) : (
              <div className="space-y-3">
                {stats?.farmBatches?.map((batch: any) => (
                  <div
                    key={batch.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900">
                        {batch.cropOrLivestock}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getStatusBadgeClass(batch.status)}`}>
                        {batch.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <span>{batch.fieldLocation || "Field Plot"}</span>
                      <span className="font-semibold text-slate-700">
                        {batch.areaAcres ? `${batch.areaAcres} Acres` : ""}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <span>Expected Yield:</span>
                      <span className="font-bold text-emerald-700">
                        {batch.expectedYield} {batch.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Inventory Status</h3>
              </div>
              <Link
                href="/products"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Catalog
              </Link>
            </div>

            {stats?.lowStockProducts?.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-emerald-600 py-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>All tracked inventory items are adequately stocked.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.lowStockProducts?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-100 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500">SKU: {item.sku || "N/A"}</p>
                    </div>
                    <span className="font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                      {item.stockQuantity} {item.unit} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
