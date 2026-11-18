"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useOrg } from "@/context/OrgContext";
import { Customer, Product } from "@/lib/types";
import { calculateInvoiceTotals, formatCurrency } from "@/lib/formatters";
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  UserPlus,
} from "lucide-react";

interface EstimateItemRow {
  productId: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
}

export default function NewEstimatePage() {
  const router = useRouter();
  const { currentOrg, refreshOrgs } = useOrg();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [estimateNumber, setEstimateNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  const [items, setItems] = useState<EstimateItemRow[]>([
    {
      productId: "",
      itemName: "",
      description: "",
      quantity: 1,
      unit: "unit",
      unitPrice: 0,
      discountPercent: 0,
      taxRate: 0,
    },
  ]);

  const fetchData = useCallback(async () => {
    if (!currentOrg?.id) return;
    try {
      setLoading(true);
      const [custRes, prodRes] = await Promise.all([
        fetch(`/api/customers?organizationId=${currentOrg.id}`),
        fetch(`/api/products?organizationId=${currentOrg.id}`),
      ]);

      if (custRes.ok) {
        const custData = await custRes.json();
        setCustomers(custData);
        if (custData.length > 0 && !customerId) {
          setCustomerId(custData[0].id);
        }
      }

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      setEstimateNumber(`${currentOrg.estimatePrefix}${currentOrg.nextEstimateNumber}`);
      setTerms("This estimate is valid for 30 days from the date of issue. Prices subject to delivery schedule.");
    } catch (e) {
      console.error("Error loading setup data:", e);
    } finally {
      setLoading(false);
    }
  }, [currentOrg, customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProductSelect = (index: number, prodId: string) => {
    const updated = [...items];
    const selectedProd = products.find((p) => p.id === prodId);

    if (selectedProd) {
      updated[index] = {
        ...updated[index],
        productId: selectedProd.id,
        itemName: selectedProd.name,
        description: selectedProd.description || "",
        unit: selectedProd.unit,
        unitPrice: selectedProd.salePrice,
        taxRate: selectedProd.taxRate,
      };
    } else {
      updated[index] = {
        ...updated[index],
        productId: "",
      };
    }
    setItems(updated);
  };

  const handleItemChange = (index: number, field: keyof EstimateItemRow, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setItems(updated);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        productId: "",
        itemName: "",
        description: "",
        quantity: 1,
        unit: currentOrg?.type === "FARM" ? "quintal" : "unit",
        unitPrice: 0,
        discountPercent: 0,
        taxRate: 0,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totals = calculateInvoiceTotals(items, discountType, discountValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !customerId) {
      alert("Please select a valid customer.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        organizationId: currentOrg.id,
        customerId,
        estimateNumber: estimateNumber.trim() || undefined,
        referenceNumber: referenceNumber.trim() || undefined,
        issueDate,
        expiryDate,
        discountType,
        discountValue,
        notes,
        terms,
        items,
      };

      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newEstimate = await res.json();
        await refreshOrgs();
        router.push(`/estimates/${newEstimate.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create estimate");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/estimates"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create New Estimate / Quote
            </h1>
            <p className="text-xs text-slate-500">
              For: <span className="font-semibold text-slate-700">{currentOrg?.name}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-md shadow-indigo-600/30 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Generating Quote..." : "Save Estimate"}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Client / Prospective Buyer *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimate # *
                </label>
                <input
                  type="text"
                  required
                  value={estimateNumber}
                  onChange={(e) => setEstimateNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Proposal Ref #
                </label>
                <input
                  type="text"
                  placeholder="QUO-OPT-01"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quote Date
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Expiry / Valid Until
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Proposed Products & Services
            </h2>
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 w-64">Item / Service</th>
                  <th className="px-3 py-2.5 w-24">Qty</th>
                  <th className="px-3 py-2.5 w-24">Unit</th>
                  <th className="px-3 py-2.5 w-32">Price ({currentOrg?.currencySymbol})</th>
                  <th className="px-3 py-2.5 w-20">Disc %</th>
                  <th className="px-3 py-2.5 w-20">Tax %</th>
                  <th className="px-4 py-2.5 w-32 text-right">Amount</th>
                  <th className="px-2 py-2.5 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((row, idx) => {
                  const base = (row.quantity || 0) * (row.unitPrice || 0);
                  const disc = base * ((row.discountPercent || 0) / 100);
                  const taxable = Math.max(0, base - disc);
                  const tax = taxable * ((row.taxRate || 0) / 100);
                  const total = taxable + tax;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 align-top">
                        <select
                          value={row.productId}
                          onChange={(e) => handleProductSelect(idx, e.target.value)}
                          className="w-full px-2 py-1.5 mb-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
                        >
                          <option value="">-- Custom or Catalog Item --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku || p.unit})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          required
                          placeholder="Item name / title *"
                          value={row.itemName}
                          onChange={(e) => handleItemChange(idx, "itemName", e.target.value)}
                          className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold"
                        />
                      </td>

                      <td className="px-3 py-3 align-top">
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          required
                          value={row.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-center"
                        />
                      </td>

                      <td className="px-3 py-3 align-top">
                        <input
                          type="text"
                          value={row.unit}
                          placeholder="unit, kg"
                          onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-center"
                        />
                      </td>

                      <td className="px-3 py-3 align-top">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={row.unitPrice}
                          onChange={(e) => handleItemChange(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-right font-semibold"
                        />
                      </td>

                      <td className="px-3 py-3 align-top">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={row.discountPercent}
                          onChange={(e) => handleItemChange(idx, "discountPercent", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-center"
                        />
                      </td>

                      <td className="px-3 py-3 align-top">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={row.taxRate}
                          onChange={(e) => handleItemChange(idx, "taxRate", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-center"
                        />
                      </td>

                      <td className="px-4 py-3 align-top text-right font-bold text-slate-900 text-sm">
                        {formatCurrency(total, currentOrg?.currency, currentOrg?.currencySymbol)}
                      </td>

                      <td className="px-2 py-3 align-top text-center">
                        <button
                          type="button"
                          disabled={items.length <= 1}
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculations and Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Remarks / Scope of Work
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Scope details or harvest conditions..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Quote Terms & Expiry Clause
              </label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
              Estimate Summary
            </h3>

            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(totals.subTotal, currentOrg?.currency, currentOrg?.currencySymbol)}
              </span>
            </div>

            <div className="flex justify-between text-sm text-slate-600">
              <span>Tax Amount:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(totals.taxAmount, currentOrg?.currency, currentOrg?.currencySymbol)}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-base font-bold text-slate-900">
              <span className="text-lg">Estimated Total:</span>
              <span className="text-xl text-amber-600 font-extrabold">
                {formatCurrency(totals.totalAmount, currentOrg?.currency, currentOrg?.currencySymbol)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            href="/estimates"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-100 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Generating Quote..." : "Create Estimate"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
