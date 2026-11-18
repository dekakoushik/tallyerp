"use client";

import React, { useState, useEffect } from "react";
import { useOrg } from "@/context/OrgContext";
import {
  Settings,
  Building,
  Save,
  ShieldCheck,
  Database,
  CheckCircle2,
  Landmark,
  FileText,
} from "lucide-react";

export default function SettingsPage() {
  const { currentOrg, refreshOrgs } = useOrg();

  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("");
  const [estimatePrefix, setEstimatePrefix] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfscSwift, setBankIfscSwift] = useState("");
  const [notesTerms, setNotesTerms] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentOrg) {
      setName(currentOrg.name);
      setLegalName(currentOrg.legalName || "");
      setTaxId(currentOrg.taxId || "");
      setEmail(currentOrg.email || "");
      setPhone(currentOrg.phone || "");
      setInvoicePrefix(currentOrg.invoicePrefix);
      setEstimatePrefix(currentOrg.estimatePrefix);
      setBankName(currentOrg.bankName || "");
      setBankAccount(currentOrg.bankAccount || "");
      setBankIfscSwift(currentOrg.bankIfscSwift || "");
      setNotesTerms(currentOrg.notesTerms || "");
    }
  }, [currentOrg]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/organizations/${currentOrg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          legalName,
          taxId,
          email,
          phone,
          invoicePrefix,
          estimatePrefix,
          bankName,
          bankAccount,
          bankIfscSwift,
          notesTerms,
        }),
      });

      if (res.ok) {
        await refreshOrgs();
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert("Failed to update organization profile");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-indigo-600" />
            <span>Settings & Organization Profile</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure profile, default invoice prefixes, bank remittances, and billing terms for{" "}
            <span className="font-semibold text-slate-700">{currentOrg?.name}</span>
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Entity Identity & Tax Profile
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Legal Registered Entity Name
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tax ID / GSTIN / VAT
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Billing Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Invoicing Sequence Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Document Numbering Schemes
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Invoice Prefix
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Next invoice will format as: {invoicePrefix}{currentOrg?.nextInvoiceNumber}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimate Prefix
              </label>
              <input
                type="text"
                value={estimatePrefix}
                onChange={(e) => setEstimatePrefix(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Next estimate will format as: {estimatePrefix}{currentOrg?.nextEstimateNumber}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Default Terms & Conditions
            </label>
            <textarea
              rows={3}
              value={notesTerms}
              onChange={(e) => setNotesTerms(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Bank Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Bank Remittance Information
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                SWIFT / IFSC Code
              </label>
              <input
                type="text"
                value={bankIfscSwift}
                onChange={(e) => setBankIfscSwift(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Database & Architecture Info */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              System Architecture & Production Readiness
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Active persistence layer: <span className="font-semibold text-white">SQLite (file:./dev.db)</span> via Prisma ORM.
            This zero-config architecture runs immediately and can be transitioned to high-availability PostgreSQL for enterprise multi-node deployments simply by updating the datasource in <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">prisma/schema.prisma</code>.
          </p>
          <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Database synchronized with all relations and cascade constraints.</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-indigo-600/30 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Configuration"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
