"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrg } from "@/context/OrgContext";
import {
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
  CreditCard,
  Package,
  Sprout,
  Users,
  Receipt,
  Building2,
  Settings,
  ShieldCheck,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { currentOrg } = useOrg();

  const isFarmMode = currentOrg?.type === "FARM" || currentOrg?.type === "AGRO_ENTERPRISE";

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Invoices & Billing", href: "/invoices", icon: FileText },
    { name: "Estimates / Quotes", href: "/estimates", icon: FileSpreadsheet },
    { name: "Payments Received", href: "/payments", icon: CreditCard },
    {
      name: isFarmMode ? "Produce & Inventory" : "Products & Services",
      href: "/products",
      icon: Package,
    },
    {
      name: "Farm Batches & Crops",
      href: "/farm-batches",
      icon: Sprout,
      badge: isFarmMode ? "Agro" : undefined,
    },
    {
      name: isFarmMode ? "Buyers & Vendors" : "Customers & Clients",
      href: "/customers",
      icon: Users,
    },
    { name: "Expenses", href: "/expenses", icon: Receipt },
    { name: "Companies & Farms", href: "/organizations", icon: Building2 },
    { name: "Settings & Profile", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="no-print w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand logo & header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 font-bold text-lg">
          E
        </div>
        <div>
          <span className="font-bold text-white tracking-tight text-base">ERP Nexus</span>
          <span className="block text-[10px] text-indigo-400 font-medium uppercase tracking-widest">
            Enterprise & Farm
          </span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Organization quick status bottom card */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">Production Mode</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Multi-entity active: Invoicing currency set to{" "}
            <span className="font-semibold text-slate-200">{currentOrg?.currency || "INR"}</span>.
          </p>
        </div>
      </div>
    </aside>
  );
}
