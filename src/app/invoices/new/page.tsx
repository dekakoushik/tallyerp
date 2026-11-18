"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useOrg } from "@/context/OrgContext";
import { Customer, Product } from "@/lib/types";
import { calculateInvoiceTotals, formatCurrency } from "@/lib/formatters";
import {
  FileText,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Building,
  UserPlus,
} from "lucide-react";

interface InvoiceItemRow {
  productId: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { currentOrg, refreshOrgs } = useOrg();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0]
  );
  const [invoiceType, setInvoiceType] = useState("TAX_INVOICE");
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  // Items State
  const [items, setItems] = useState<InvoiceItemRow[]>([
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

  // Quick Customer Creation
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustCompany, setNewCustCompany] = useState("");

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

      // Default invoice number preview & terms
      setInvoiceNumber(`${currentOrg.invoicePrefix}${currentOrg.nextInvoiceNumber}`);
      setTerms(currentOrg.notesTerms || "Payment is due within 15 days of invoice date.");
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

  const handleItemChange = (index: number, field: keyof InvoiceItemRow, value: any) => {
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

  const handleQuickCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !newCustName.trim()) return;

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          name: newCustName.trim(),
          companyName: newCustCompany.trim() || null,
          email: newCustEmail.trim() || null,
          phone: newCustPhone.trim() || null,
          type: currentOrg.type === "FARM" ? "FARM_BUYER" : "CUSTOMER",
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setCustomers((prev) => [created, ...prev]);
        setCustomerId(created.id);
        setShowQuickCustomerModal(false);
        setNewCustName("");
        setNewCustEmail("");
        setNewCustPhone("");
        setNewCustCompany("");
      }
    } catch (e) {
      alert("Failed to create customer: " + e);
    }
  };

  const totals = calculateInvoiceTotals(items, discountType, discountValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !customerId) {
      alert("Please select a valid customer.");
      return;
    }

    const invalidItem = items.find((i) => !i.itemName.trim() || i.quantity <= 0);
    if (invalidItem) {
      alert("Please ensure all invoice items have a valid name and quantity greater than 0.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        organizationId: currentOrg.id,
        customerId,
        invoiceNumber: invoiceNumber.trim() || undefined,
        referenceNumber: referenceNumber.trim() || undefined,
        issueDate,
        dueDate,
        type: invoiceType,
        discountType,
        discountValue,
        notes,
        terms,
        items,
      };

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newInvoice = await res.json();
        await refreshOrgs();
        router.push(`/invoices/${newInvoice.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create invoice");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === customerId);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header with back navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create New Invoice
            </h1>
            <p className="text-xs text-slate-500">
              Billing entity: <span className="font-semibold text-slate-700">{currentOrg?.name}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-md shadow-indigo-600/30 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Generating Invoice..." : "Save & View Invoice"}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Client / Farm Buyer *
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickCustomerModal(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Quick Add</span>
                </button>
              </div>

              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              >
                {customers.length === 0 ? (
                  <option value="">No customers available - create one</option>
                ) : (
                  customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ""}
                    </option>
                  ))
                )}
              </select>

              {selectedCustomer && (
                <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-800">{selectedCustomer.name}</p>
                  {selectedCustomer.billingAddress && <p>{selectedCustomer.billingAddress}</p>}
                  <p>
                    {selectedCustomer.city && `${selectedCustomer.city}, `}
                    {selectedCustomer.state && `${selectedCustomer.state} `}
                    {selectedCustomer.country}
                  </p>
                  {selectedCustomer.taxId && (
                    <p className="font-mono text-slate-500">Tax ID: {selectedCustomer.taxId}</p>
                  )}
                </div>
              )}
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Invoice # *
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reference # (PO/Challan)
                </label>
                <input
                  type="text"
                  placeholder="PO-2026-001"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Issue Date
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
                  Payment Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Invoice Type
                </label>
                <select
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                >
                  <option value="TAX_INVOICE">Tax Invoice (Standard Commercial)</option>
                  <option value="FARM_SALE">Agricultural Farm Produce Bill</option>
                  <option value="PROFORMA">Proforma Invoice</option>
                  <option value="BILL_OF_SUPPLY">Bill of Supply (Zero-rated / Exempt)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Line Items & Services
            </h2>
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 w-64">Item / Product</th>
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
                          className="w-full px-2 py-1.5 mb-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="">-- Custom Item or Choose Catalog --</option>
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
                          className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Optional specifications or batch info"
                          value={row.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                          className="w-full px-2.5 py-1 mt-1 border border-slate-200 rounded text-[11px] text-slate-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
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
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-semibold text-center focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>

                      <td className="px-3 py-3 align-top">
                        <input
                          type="text"
                          value={row.unit}
                          placeholder="unit, kg, etc."
                          onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-center focus:ring-1 focus:ring-indigo-500 focus:outline-none"
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
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-semibold text-right focus:ring-1 focus:ring-indigo-500 focus:outline-none"
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
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-center focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>

                      <td className="px-3 py-3 align-top">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={row.taxRate}
                          onChange={(e) => handleItemChange(idx, "taxRate", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-center focus:ring-1 focus:ring-indigo-500 focus:outline-none"
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
                          className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition"
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

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Item Row</span>
            </button>
          </div>
        </div>

        {/* Calculations and Terms Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notes and Terms */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Client Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thanks for doing business with us!..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Terms & Conditions
              </label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Default terms and late payment clauses..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Grand Totals Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
              Invoice Calculation Summary
            </h3>

            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(totals.subTotal, currentOrg?.currency, currentOrg?.currencySymbol)}
              </span>
            </div>

            {/* Discount row */}
            <div className="flex items-center justify-between text-sm text-slate-600 gap-3">
              <div className="flex items-center gap-2">
                <span>Discount:</span>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="px-1.5 py-0.5 text-xs border border-slate-200 rounded bg-slate-50"
                >
                  <option value="FIXED">Fixed ({currentOrg?.currencySymbol})</option>
                  <option value="PERCENTAGE">%</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-16 px-1.5 py-0.5 text-xs border border-slate-200 rounded text-right font-medium"
                />
              </div>
              <span className="font-semibold text-amber-700">
                -{formatCurrency(totals.discountAmount, currentOrg?.currency, currentOrg?.currencySymbol)}
              </span>
            </div>

            <div className="flex justify-between text-sm text-slate-600">
              <span>Total Tax:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(totals.taxAmount, currentOrg?.currency, currentOrg?.currencySymbol)}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-base font-bold text-slate-900">
              <span className="text-lg">Total Amount:</span>
              <span className="text-xl text-indigo-700">
                {formatCurrency(totals.totalAmount, currentOrg?.currency, currentOrg?.currencySymbol)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            href="/invoices"
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
            <span>{saving ? "Generating Invoice..." : "Create Invoice"}</span>
          </button>
        </div>
      </form>

      {/* Quick Customer Add Modal */}
      {showQuickCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Customer / Buyer</h3>
            <form onSubmit={handleQuickCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer / Buyer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Miller or AgriCorp"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Miller Grain Processors"
                  value={newCustCompany}
                  onChange={(e) => setNewCustCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickCustomerModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
