"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useOrg } from "@/context/OrgContext";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import {
  Package,
  Plus,
  Search,
  Filter,
  Tractor,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  Tag,
  CheckCircle,
} from "lucide-react";

export default function ProductsPage() {
  const { currentOrg } = useOrg();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("unit");
  const [salePrice, setSalePrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [hsnSacCode, setHsnSacCode] = useState("");
  const [stockQuantity, setStockQuantity] = useState("100");
  const [lowStockAlert, setLowStockAlert] = useState("10");
  const [isAgricultural, setIsAgricultural] = useState(false);
  const [grade, setGrade] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!currentOrg?.id) return;
    try {
      setLoading(true);
      let url = `/api/products?organizationId=${currentOrg.id}`;
      if (search.trim()) url += `&q=${encodeURIComponent(search.trim())}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error("Error loading products:", e);
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName("");
    setSku("");
    setDescription("");
    setUnit(currentOrg?.type === "FARM" ? "quintal" : "unit");
    setSalePrice("");
    setCostPrice("");
    setTaxRate(currentOrg?.type === "FARM" ? "0" : "10");
    setHsnSacCode("");
    setStockQuantity("100");
    setLowStockAlert("10");
    setIsAgricultural(currentOrg?.type === "FARM");
    setGrade("");
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku || "");
    setDescription(p.description || "");
    setUnit(p.unit);
    setSalePrice(p.salePrice.toString());
    setCostPrice(p.costPrice.toString());
    setTaxRate(p.taxRate.toString());
    setHsnSacCode(p.hsnSacCode || "");
    setStockQuantity(p.stockQuantity.toString());
    setLowStockAlert(p.lowStockAlert.toString());
    setIsAgricultural(p.isAgricultural);
    setGrade(p.grade || "");
    setShowModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !name.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        organizationId: currentOrg.id,
        name: name.trim(),
        sku: sku.trim() || undefined,
        description: description.trim() || undefined,
        unit,
        salePrice: parseFloat(salePrice) || 0,
        costPrice: parseFloat(costPrice) || 0,
        taxRate: parseFloat(taxRate) || 0,
        hsnSacCode: hsnSacCode.trim() || undefined,
        stockQuantity: parseFloat(stockQuantity) || 0,
        lowStockAlert: parseFloat(lowStockAlert) || 5,
        isAgricultural,
        grade: grade.trim() || undefined,
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        await fetchProducts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save product");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product from the catalog?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchProducts();
      }
    } catch (e) {
      alert("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filterType === "AGRI") return p.isAgricultural;
    if (filterType === "COMMERCIAL") return !p.isAgricultural;
    if (filterType === "LOW_STOCK") return p.stockQuantity <= p.lowStockAlert;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Package className="w-6 h-6 text-indigo-600" />
            <span>Product Catalog & Farm Produce</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage commodities, inventory units, bulk harvest grains, and service pricing
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-md shadow-indigo-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product / Produce</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search items, SKU, description..."
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
            { id: "ALL", label: "All Items" },
            { id: "AGRI", label: "🌾 Farm Produce" },
            { id: "COMMERCIAL", label: "Commercial / Services" },
            { id: "LOW_STOCK", label: "⚠️ Low Stock" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                filterType === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading inventory catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No products found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your harvest produce, crop grades, tech solutions, or consulting services.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Product</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Item Name & SKU</th>
                  <th className="px-5 py-3">Type / Grade</th>
                  <th className="px-5 py-3">Sale Price</th>
                  <th className="px-5 py-3">Cost Price</th>
                  <th className="px-5 py-3">Tax Rate</th>
                  <th className="px-5 py-3">Stock Available</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isLow = p.trackInventory && p.stockQuantity <= p.lowStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{p.name}</p>
                          {p.isAgricultural && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                              Agro
                            </span>
                          )}
                        </div>
                        {p.sku && (
                          <span className="text-xs text-slate-400 font-mono block">
                            SKU: {p.sku} {p.hsnSacCode ? `• HSN: ${p.hsnSacCode}` : ""}
                          </span>
                        )}
                        {p.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {p.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.grade ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {p.grade}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Standard</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {formatCurrency(p.salePrice, currentOrg?.currency, currentOrg?.currencySymbol)}
                        <span className="text-xs text-slate-400 font-normal"> / {p.unit}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {formatCurrency(p.costPrice, currentOrg?.currency, currentOrg?.currencySymbol)}
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <span className="font-semibold text-slate-700">{p.taxRate}%</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {p.trackInventory ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                isLow ? "text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200" : "text-slate-800"
                              }`}
                            >
                              {p.stockQuantity} {p.unit}
                            </span>
                            {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Service / Unlimited</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete"
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
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? "Edit Product / Produce" : "Add Product or Farm Produce"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Item / Produce Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hard Red Winter Wheat, or Cloud ERP License"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WHT-HD-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Unit of Measurement *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="quintal">quintal (100 kg)</option>
                    <option value="kg">kilogram (kg)</option>
                    <option value="metric_ton">metric ton (1000 kg)</option>
                    <option value="box">box / crate</option>
                    <option value="bag">bag (50 kg)</option>
                    <option value="liter">liter</option>
                    <option value="acre">acre (custom service)</option>
                    <option value="unit">unit / piece</option>
                    <option value="hr">hour</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Cost Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current Stock Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={lowStockAlert}
                    onChange={(e) => setLowStockAlert(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Grade / Harvest Classification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grade A Extra, Organic"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    HSN / SAC Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1001 for wheat, 9983"
                    value={hsnSacCode}
                    onChange={(e) => setHsnSacCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isAgricultural}
                    onChange={(e) => setIsAgricultural(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Mark as Agricultural Farm Produce (Grain, Livestock, Dairy, Crop)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
                  {submitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
