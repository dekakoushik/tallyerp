"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useOrg } from "@/context/OrgContext";
import { FarmBatch } from "@/lib/types";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/formatters";
import {
  Sprout,
  Plus,
  Tractor,
  Calendar,
  MapPin,
  Scale,
  TrendingUp,
  DollarSign,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
} from "lucide-react";

export default function FarmBatchesPage() {
  const { currentOrg } = useOrg();
  const [batches, setBatches] = useState<FarmBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<FarmBatch | null>(null);
  const [batchCode, setBatchCode] = useState("");
  const [cropOrLivestock, setCropOrLivestock] = useState("");
  const [fieldLocation, setFieldLocation] = useState("");
  const [areaAcres, setAreaAcres] = useState("20");
  const [plantedDate, setPlantedDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(
    new Date(Date.now() + 120 * 86400000).toISOString().split("T")[0]
  );
  const [expectedYield, setExpectedYield] = useState("500");
  const [actualYield, setActualYield] = useState("0");
  const [unit, setUnit] = useState("quintal");
  const [status, setStatus] = useState("GROWING");
  const [costIncurred, setCostIncurred] = useState("0");
  const [revenueEarned, setRevenueEarned] = useState("0");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBatches = useCallback(async () => {
    if (!currentOrg?.id) return;
    try {
      setLoading(true);
      let url = `/api/farm-batches?organizationId=${currentOrg.id}`;
      if (statusFilter !== "ALL") url += `&status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
      }
    } catch (e) {
      console.error("Error loading batches:", e);
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id, statusFilter]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleOpenAdd = () => {
    setEditingBatch(null);
    setBatchCode("");
    setCropOrLivestock("");
    setFieldLocation("");
    setAreaAcres("25");
    setPlantedDate(new Date().toISOString().split("T")[0]);
    setExpectedHarvestDate(new Date(Date.now() + 120 * 86400000).toISOString().split("T")[0]);
    setExpectedYield("400");
    setActualYield("0");
    setUnit("quintal");
    setStatus("GROWING");
    setCostIncurred("0");
    setRevenueEarned("0");
    setNotes("");
    setShowModal(true);
  };

  const handleOpenEdit = (b: FarmBatch) => {
    setEditingBatch(b);
    setBatchCode(b.batchCode);
    setCropOrLivestock(b.cropOrLivestock);
    setFieldLocation(b.fieldLocation || "");
    setAreaAcres((b.areaAcres || 0).toString());
    setPlantedDate(b.plantedDate ? new Date(b.plantedDate).toISOString().split("T")[0] : "");
    setExpectedHarvestDate(b.expectedHarvestDate ? new Date(b.expectedHarvestDate).toISOString().split("T")[0] : "");
    setExpectedYield((b.expectedYield || 0).toString());
    setActualYield((b.actualYield || 0).toString());
    setUnit(b.unit);
    setStatus(b.status);
    setCostIncurred((b.costIncurred || 0).toString());
    setRevenueEarned((b.revenueEarned || 0).toString());
    setNotes(b.notes || "");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !cropOrLivestock.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        organizationId: currentOrg.id,
        batchCode: batchCode.trim() || undefined,
        cropOrLivestock: cropOrLivestock.trim(),
        fieldLocation: fieldLocation.trim() || undefined,
        areaAcres: parseFloat(areaAcres) || 0,
        plantedDate,
        expectedHarvestDate,
        expectedYield: parseFloat(expectedYield) || 0,
        actualYield: parseFloat(actualYield) || 0,
        unit,
        status,
        costIncurred: parseFloat(costIncurred) || 0,
        revenueEarned: parseFloat(revenueEarned) || 0,
        notes,
      };

      const url = editingBatch
        ? `/api/farm-batches/${editingBatch.id}`
        : "/api/farm-batches";
      const method = editingBatch ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        await fetchBatches();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save farm batch");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this farm batch record?")) return;
    try {
      const res = await fetch(`/api/farm-batches/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchBatches();
      }
    } catch (e) {
      alert("Failed to delete farm batch");
    }
  };

  const totalAcres = batches.reduce((sum, b) => sum + (b.areaAcres || 0), 0);
  const totalCost = batches.reduce((sum, b) => sum + (b.costIncurred || 0), 0);
  const totalRev = batches.reduce((sum, b) => sum + (b.revenueEarned || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Tractor className="w-6 h-6 text-emerald-600" />
            <span>Farm Batches & Crop Lifecycle</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track field plots, sowing dates, yield forecasts, harvest weight, and input profitability
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-md shadow-emerald-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Crop / Farm Batch</span>
        </button>
      </div>

      {/* Farm Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Cultivated Area
            </span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{totalAcres.toFixed(1)} Acres</p>
          <span className="text-xs text-slate-500 mt-1 block">Across {batches.length} tracked plots</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cumulative Crop Investment
            </span>
            <DollarSign className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-2">
            {formatCurrency(totalCost, currentOrg?.currency, currentOrg?.currencySymbol)}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Seeds, fertilizers, irrigation & labor</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Harvest Revenue Realized
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">
            {formatCurrency(totalRev, currentOrg?.currency, currentOrg?.currencySymbol)}
          </p>
          <span className="text-xs text-emerald-600 mt-1 block font-medium">From sold produce batches</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "GROWING", "HARVESTED", "SOLD", "PLANNED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === st
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Batches Grid Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading agricultural batch data...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-xl border border-slate-200">
          <Tractor className="w-10 h-10 text-emerald-600 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-slate-800">No farm batches found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Log your crop cycles to calculate yield per acre, monitor harvest milestones, and evaluate input costs.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Batch</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition p-5 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      {batch.batchCode}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {batch.cropOrLivestock}
                    </h3>
                  </div>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${getStatusBadgeClass(batch.status)}`}>
                    {batch.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{batch.fieldLocation || "Unassigned plot"}</span>
                  {batch.areaAcres ? (
                    <span className="font-semibold text-slate-900">• {batch.areaAcres} Acres</span>
                  ) : null}
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Sown / Planted</span>
                    <span className="font-medium text-slate-800">{formatDate(batch.plantedDate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Target Harvest</span>
                    <span className="font-medium text-slate-800">{formatDate(batch.expectedHarvestDate)}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expected Yield:</span>
                    <span className="font-bold text-slate-800">
                      {batch.expectedYield} {batch.unit}
                    </span>
                  </div>
                  {batch.actualYield ? (
                    <div className="flex justify-between text-emerald-700">
                      <span className="font-semibold">Actual Harvest:</span>
                      <span className="font-extrabold">
                        {batch.actualYield} {batch.unit}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Cost vs Revenue:</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(batch.costIncurred, currentOrg?.currency, currentOrg?.currencySymbol)} /{" "}
                      <span className="text-emerald-700">{formatCurrency(batch.revenueEarned, currentOrg?.currency, currentOrg?.currencySymbol)}</span>
                    </span>
                  </div>
                </div>

                {batch.notes && (
                  <p className="mt-3 text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded border border-amber-100/50">
                    "{batch.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(batch)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Update Harvest / Status</span>
                </button>
                <button
                  onClick={() => handleDelete(batch.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingBatch ? "Update Crop Batch" : "New Farm Batch"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Crop Variety / Livestock *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hard Red Winter Wheat HD-2967, Broiler Poultry Batch"
                  value={cropOrLivestock}
                  onChange={(e) => setCropOrLivestock(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Field Location / Sector
                  </label>
                  <input
                    type="text"
                    placeholder="Sector 4 Plot B"
                    value={fieldLocation}
                    onChange={(e) => setFieldLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Area (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sowing / Planting Date
                  </label>
                  <input
                    type="date"
                    value={plantedDate}
                    onChange={(e) => setPlantedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Expected Yield
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={expectedYield}
                    onChange={(e) => setExpectedYield(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Actual Yield
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={actualYield}
                    onChange={(e) => setActualYield(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="quintal">quintal</option>
                    <option value="kg">kg</option>
                    <option value="metric_ton">ton</option>
                    <option value="box">box</option>
                    <option value="bag">bag</option>
                    <option value="liter">liter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lifecycle Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="GROWING">Growing</option>
                    <option value="HARVESTED">Harvested</option>
                    <option value="SOLD">Sold</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Input Cost ({currentOrg?.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={costIncurred}
                    onChange={(e) => setCostIncurred(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Revenue Earned ({currentOrg?.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueEarned}
                    onChange={(e) => setRevenueEarned(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-emerald-700 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Field Notes & Observations
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Fertilizer applied, weather conditions, soil moisture..."
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Farm Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
