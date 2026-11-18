"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useOrg } from "@/context/OrgContext";
import {
  Building2,
  Tractor,
  Wheat,
  ChevronDown,
  Plus,
  FileText,
  FileSpreadsheet,
  Package,
  Users,
  Sprout,
  Check,
  Building,
} from "lucide-react";

export default function Navbar() {
  const { organizations, currentOrg, setCurrentOrgId } = useOrg();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const orgRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setIsOrgDropdownOpen(false);
      }
      if (createRef.current && !createRef.current.contains(event.target as Node)) {
        setIsCreateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getOrgIcon = (type: string) => {
    switch (type) {
      case "FARM":
        return <Tractor className="w-4 h-4 text-emerald-600" />;
      case "AGRO_ENTERPRISE":
        return <Wheat className="w-4 h-4 text-amber-600" />;
      default:
        return <Building2 className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getOrgBadge = (type: string) => {
    switch (type) {
      case "FARM":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "AGRO_ENTERPRISE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
  };

  return (
    <header className="no-print h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        {/* Active Organization Switcher */}
        <div className="relative" ref={orgRef}>
          <button
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
              {currentOrg ? getOrgIcon(currentOrg.type) : <Building className="w-4 h-4 text-slate-500" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 line-clamp-1 max-w-[180px] sm:max-w-[240px]">
                  {currentOrg ? currentOrg.name : "Select Entity"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wider ${getOrgBadge(currentOrg?.type || "COMPANY")}`}>
                  {currentOrg?.type === "FARM" ? "Farm / Agro" : currentOrg?.type === "AGRO_ENTERPRISE" ? "Agro Wholesale" : "Company"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentOrg?.currency} ({currentOrg?.currencySymbol})
                </span>
              </div>
            </div>
          </button>

          {/* Org Dropdown */}
          {isOrgDropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Switch Active Entity
                </span>
                <Link
                  href="/organizations"
                  onClick={() => setIsOrgDropdownOpen(false)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Manage All
                </Link>
              </div>

              <div className="max-h-72 overflow-y-auto py-1">
                {organizations.map((org) => {
                  const isSelected = org.id === currentOrg?.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => {
                        setCurrentOrgId(org.id);
                        setIsOrgDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-indigo-50/60" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                          {getOrgIcon(org.type)}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isSelected ? "text-indigo-900 font-semibold" : "text-slate-800"}`}>
                            {org.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                              {org.type}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {org.currency} • {org.taxId || "No Tax ID"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-slate-100 mt-1">
                <Link
                  href="/organizations?action=new"
                  onClick={() => setIsOrgDropdownOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Company or Farm
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-3">
        {/* Quick Create Dropdown */}
        <div className="relative" ref={createRef}>
          <button
            onClick={() => setIsCreateOpen(!isCreateOpen)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {isCreateOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <Link
                href="/invoices/new"
                onClick={() => setIsCreateOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>New Invoice</span>
              </Link>
              <Link
                href="/estimates/new"
                onClick={() => setIsCreateOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <span>New Estimate / Quote</span>
              </Link>
              <div className="my-1 border-t border-slate-100" />
              <Link
                href="/products?action=new"
                onClick={() => setIsCreateOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
              >
                <Package className="w-4 h-4 text-blue-600" />
                <span>New Product / Produce</span>
              </Link>
              <Link
                href="/customers?action=new"
                onClick={() => setIsCreateOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>New Customer / Buyer</span>
              </Link>
              {currentOrg?.type === "FARM" && (
                <Link
                  href="/farm-batches?action=new"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                >
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>New Crop / Farm Batch</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
