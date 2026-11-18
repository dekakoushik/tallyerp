import type { Metadata } from "next";
import "./globals.css";
import { OrgProvider } from "@/context/OrgContext";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "ERP Nexus | Professional Billing & Farm Management System",
  description: "Enterprise multi-company and farm billing, invoicing, estimate, and financial operations system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <OrgProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              <Navbar />
              <main className="flex-1 p-4 md:p-8 bg-slate-50/60 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </OrgProvider>
      </body>
    </html>
  );
}
