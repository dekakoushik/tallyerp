"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useOrg } from "@/context/OrgContext";
import { Organization } from "@/lib/types";
import {
  Building2,
  Tractor,
  Wheat,
  Plus,
  Check,
  Edit2,
  Trash2,
  Globe,
  Mail,
  Phone,
  Landmark,
  FileText,
  X,
  ShieldCheck,
} from "lucide-react";

export default function OrganizationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading organizations...</div>}>
      <OrganizationsContent />
    </Suspense>
  );
}

function OrganizationsContent() {
  const searchParams = useSearchParams();
  const { organizations, currentOrg, setCurrentOrgId, refreshOrgs } = useOrg();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [type, setType] = useState<"COMPANY" | "FARM" | "AGRO_ENTERPRISE" | "BRANCH">("COMPANY");
  const [legalName, setLegalName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [zipCode, setZipCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfscSwift, setBankIfscSwift] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [upiId, setUpiId] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  const [estimatePrefix, setEstimatePrefix] = useState("EST-");
  const [notesTerms, setNotesTerms] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      handleOpenAdd();
    }
  }, [searchParams]);

  const handleOpenAdd = () => {
    setEditingOrg(null);
    setName("");
    setType("COMPANY");
    setLegalName("");
    setTaxId("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setCurrency("INR");
    setCurrencySymbol("₹");
    setAddress("");
    setCity("");
    setState("");
    setCountry("India");
    setZipCode("");
    setBankName("");
    setBankAccount("");
    setBankIfscSwift("");
    setBankBranch("");
    setUpiId("");
    setInvoicePrefix("INV-");
    setEstimatePrefix("EST-");
    setNotesTerms("Payment is due within 15 days of invoice date.");
    setIsDefault(false);
    setShowModal(true);
  };

  const handleOpenEdit = (org: Organization) => {
    setEditingOrg(org);
    setName(org.name);
    setType(org.type);
    setLegalName(org.legalName || "");
    setTaxId(org.taxId || "");
    setEmail(org.email || "");
    setPhone(org.phone || "");
    setWebsite(org.website || "");
    setCurrency(org.currency);
    setCurrencySymbol(org.currencySymbol);
    setAddress(org.address || "");
    setCity(org.city || "");
    setState(org.state || "");
    setCountry(org.country || "United States");
    setZipCode(org.zipCode || "");
    setBankName(org.bankName || "");
    setBankAccount(org.bankAccount || "");
    setBankIfscSwift(org.bankIfscSwift || "");
    setBankBranch(org.bankBranch || "");
    setUpiId(org.upiId || "");
    setInvoicePrefix(org.invoicePrefix);
    setEstimatePrefix(org.estimatePrefix);
    setNotesTerms(org.notesTerms || "");
    setIsDefault(org.isDefault);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        type,
        legalName: legalName.trim() || undefined,
        taxId: taxId.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        currency,
        currencySymbol,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        country: country.trim() || undefined,
        zipCode: zipCode.trim() || undefined,
        bankName: bankName.trim() || undefined,
        bankAccount: bankAccount.trim() || undefined,
        bankIfscSwift: bankIfscSwift.trim() || undefined,
        bankBranch: bankBranch.trim() || undefined,
        upiId: upiId.trim() || undefined,
        invoicePrefix: invoicePrefix.trim() || "INV-",
        estimatePrefix: estimatePrefix.trim() || "EST-",
        notesTerms: notesTerms.trim() || undefined,
        isDefault,
      };

      const url = editingOrg ? `/api/organizations/${editingOrg.id}` : "/api/organizations";
      const method = editingOrg ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        await refreshOrgs();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save organization");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this organization/farm? All associated invoices, batches, and records will be deleted.")) return;
    try {
      const res = await fetch(`/api/organizations/${id}`, { method: "DELETE" });
      if (res.ok) {
        await refreshOrgs();
      } else {
        const err = await res.json();
        alert(err.error || "Cannot delete organization");
      }
    } catch (e) {
      alert("Failed to delete organization");
    }
  };

  const getOrgIcon = (t: string) => {
    switch (t) {
      case "FARM":
        return <Tractor className="w-6 h-6 text-emerald-600" />;
      case "AGRO_ENTERPRISE":
        return <Wheat className="w-6 h-6 text-amber-600" />;
      default:
        return <Building2 className="w-6 h-6 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <span>Multi-Company & Farm Operations Center</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and switch between multiple companies, farms, agro-traders, and regional branches
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-md shadow-indigo-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Company / Farm</span>
        </button>
      </div>

      {/* Grid of Organizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org: any) => {
          const isActive = org.id === currentOrg?.id;

          return (
            <div
              key={org.id}
              className={`bg-white rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between shadow-2xs ${
                isActive
                  ? "border-indigo-600 ring-2 ring-indigo-600/20 shadow-lg"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs">
                      {getOrgIcon(org.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {org.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {org.type.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  ) : null}
                </div>

                {/* Details */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  {org.legalName && (
                    <p className="font-medium text-slate-700 line-clamp-1">{org.legalName}</p>
                  )}
                  {org.taxId && (
                    <p className="font-mono text-slate-600">Tax ID: {org.taxId}</p>
                  )}
                  <p>
                    {org.city ? `${org.city}, ` : ""}
                    {org.state ? `${org.state}, ` : ""}
                    {org.country}
                  </p>
                  <p className="font-semibold text-slate-700">
                    Currency: {org.currency} ({org.currencySymbol})
                  </p>
                </div>

                {/* Bank Preview */}
                {org.bankName && (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-0.5">
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Landmark className="w-3 h-3 text-slate-400" />
                      <span>{org.bankName}</span>
                    </p>
                    {org.bankAccount && (
                      <p className="font-mono text-slate-500">A/C: ••••{org.bankAccount.slice(-4)}</p>
                    )}
                  </div>
                )}

                {/* Activity Counts */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                  <div className="p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-400 block uppercase">Invoices</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {org._count?.invoices || 0}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-400 block uppercase">Clients</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {org._count?.customers || 0}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-400 block uppercase">Catalog</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {org._count?.products || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                {!isActive ? (
                  <button
                    onClick={() => setCurrentOrgId(org.id)}
                    className="flex-1 py-2 px-3 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition"
                  >
                    Switch to this Entity
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic">Currently operating here</span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(org)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                    title="Edit Entity Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {organizations.length > 1 && (
                    <button
                      onClick={() => handleDelete(org.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingOrg ? "Edit Company / Farm Details" : "Register New Company or Farm"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              {/* Type and Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Entity Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                  >
                    <option value="COMPANY">🏢 Company / Commercial Corporation</option>
                    <option value="FARM">🚜 Agricultural Farm / Dairy / Produce</option>
                    <option value="AGRO_ENTERPRISE">🌾 Agro Trading & Fertilizer Enterprise</option>
                    <option value="BRANCH">🏬 Branch Office / Depot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Entity Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global Tech or Highland Organic Farm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Legal Name & Tax ID */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Legal Registered Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Global Technologies LLC"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tax / GST / VAT / EIN Registration #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GSTIN / EIN / VAT"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              {/* Currency & Symbol */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Currency Code
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      const symbols: any = { USD: "$", INR: "₹", EUR: "€", GBP: "£", CAD: "$", AUD: "$", AED: "AED" };
                      setCurrencySymbol(symbols[e.target.value] || "$");
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                  >
                    <option value="USD">USD - United States Dollar ($)</option>
                    <option value="INR">INR - Indian Rupee (₹)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="GBP">GBP - British Pound (£)</option>
                    <option value="CAD">CAD - Canadian Dollar ($)</option>
                    <option value="AUD">AUD - Australian Dollar ($)</option>
                    <option value="AED">AED - UAE Dirham</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-center"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Physical / Farm Plot Address
                </label>
                <input
                  type="text"
                  placeholder="Street address, rural route, or corporate building"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Bank Remittance Details */}
              <div className="border-t border-slate-200 pt-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Bank Remittance & Settlement Account
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. JPMorgan Chase or Wells Fargo"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SWIFT / IFSC / Routing
                    </label>
                    <input
                      type="text"
                      value={bankIfscSwift}
                      onChange={(e) => setBankIfscSwift(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      UPI ID / Quick QR Handle
                    </label>
                    <input
                      type="text"
                      placeholder="business@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Prefixes */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Invoice Number Prefix
                  </label>
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Estimate Number Prefix
                  </label>
                  <input
                    type="text"
                    value={estimatePrefix}
                    onChange={(e) => setEstimatePrefix(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Default Invoice Terms & Remarks
                </label>
                <textarea
                  rows={2}
                  value={notesTerms}
                  onChange={(e) => setNotesTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Entity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
