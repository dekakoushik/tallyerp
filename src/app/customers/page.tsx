"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useOrg } from "@/context/OrgContext";
import { Customer } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit2,
  Trash2,
  X,
  CreditCard,
} from "lucide-react";

export default function CustomersPage() {
  const { currentOrg } = useOrg();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [type, setType] = useState("CUSTOMER");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [taxId, setTaxId] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("India");
  const [creditLimit, setCreditLimit] = useState("10000");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    if (!currentOrg?.id) return;
    try {
      setLoading(true);
      let url = `/api/customers?organizationId=${currentOrg.id}`;
      if (search.trim()) url += `&q=${encodeURIComponent(search.trim())}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (e) {
      console.error("Error loading customers:", e);
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName("");
    setCompanyName("");
    setType(currentOrg?.type === "FARM" ? "FARM_BUYER" : "CUSTOMER");
    setEmail("");
    setPhone("");
    setTaxId("");
    setBillingAddress("");
    setShippingAddress("");
    setCity("");
    setState("");
    setZipCode("");
    setCountry("India");
    setCreditLimit("25000");
    setNotes("");
    setShowModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setCompanyName(c.companyName || "");
    setType(c.type);
    setEmail(c.email || "");
    setPhone(c.phone || "");
    setTaxId(c.taxId || "");
    setBillingAddress(c.billingAddress || "");
    setShippingAddress(c.shippingAddress || "");
    setCity(c.city || "");
    setState(c.state || "");
    setZipCode(c.zipCode || "");
    setCountry(c.country || "United States");
    setCreditLimit((c.creditLimit || 0).toString());
    setNotes(c.notes || "");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !name.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        organizationId: currentOrg.id,
        name: name.trim(),
        companyName: companyName.trim() || undefined,
        type,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        taxId: taxId.trim() || undefined,
        billingAddress: billingAddress.trim() || undefined,
        shippingAddress: shippingAddress.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        zipCode: zipCode.trim() || undefined,
        country,
        creditLimit: parseFloat(creditLimit) || 0,
        notes: notes.trim() || undefined,
      };

      const url = editingCustomer
        ? `/api/customers/${editingCustomer.id}`
        : "/api/customers";
      const method = editingCustomer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        await fetchCustomers();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save customer");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer? This will fail if they have existing invoices.")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchCustomers();
      } else {
        const err = await res.json();
        alert(err.error || "Cannot delete customer with active billing history.");
      }
    } catch (e) {
      alert("Failed to delete customer");
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (typeFilter === "FARM_BUYER") return c.type === "FARM_BUYER";
    if (typeFilter === "CUSTOMER") return c.type === "CUSTOMER";
    if (typeFilter === "BALANCE") return c.currentBalance > 0;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Customers, Clients & Farm Buyers</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Directory of buyers, commercial clients, credit limits, and outstanding receivable balances
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-md shadow-indigo-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client / Buyer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          {[
            { id: "ALL", label: "All Contacts" },
            { id: "FARM_BUYER", label: "🌾 Farm Buyers" },
            { id: "CUSTOMER", label: "Corporate Clients" },
            { id: "BALANCE", label: "💰 Has Outstanding Due" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                typeFilter === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Cards / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading contacts directory...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No customers found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your agricultural crop buyers, grain merchants, or corporate enterprise clients.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Customer / Company</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Contact Details</th>
                  <th className="px-5 py-3">Location / Address</th>
                  <th className="px-5 py-3">Outstanding Due</th>
                  <th className="px-5 py-3">Credit Limit</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{c.name}</p>
                      {c.companyName && (
                        <p className="text-xs text-slate-500">{c.companyName}</p>
                      )}
                      {c.taxId && (
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Tax ID: {c.taxId}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                        c.type === "FARM_BUYER"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}>
                        {c.type === "FARM_BUYER" ? "Farm Buyer" : "Customer"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 space-y-0.5">
                      {c.email && (
                        <p className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{c.email}</span>
                        </p>
                      )}
                      {c.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      <p>{c.city ? `${c.city}, ${c.state || ""}` : "—"}</p>
                      <p className="text-slate-400">{c.country}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`font-bold text-sm ${
                          c.currentBalance > 0 ? "text-amber-700" : "text-emerald-700"
                        }`}
                      >
                        {formatCurrency(c.currentBalance, currentOrg?.currency, currentOrg?.currencySymbol)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-600">
                      {formatCurrency(c.creditLimit, currentOrg?.currency, currentOrg?.currencySymbol)}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingCustomer ? "Edit Customer Profile" : "Add Client or Farm Buyer"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact / Individual Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robert Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Golden Millers Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Entity Classification
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="CUSTOMER">Standard Customer / Client</option>
                    <option value="FARM_BUYER">Farm Produce Buyer / Grain Merchant</option>
                    <option value="DISTRIBUTOR">Wholesale Distributor</option>
                    <option value="VENDOR">Vendor / Supplier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tax ID / GSTIN / VAT
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. US-EIN-88402"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Billing Address
                </label>
                <input
                  type="text"
                  placeholder="Street address, suite, or silo address"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
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
                    State / Region
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
                    Postal / Zip Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Credit Limit ({currentOrg?.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                  />
                </div>
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
                  {submitting ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
