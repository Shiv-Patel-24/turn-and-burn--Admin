import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  DollarSign,
  Car,
  User,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { adminService } from "../api/admin";

const TABS = ["All", "Charged", "Pending", "Disputed"];

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount) {
  if (amount === undefined || amount === null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Damage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Inspector modal for a damage report
  const [selectedReport, setSelectedReport] = useState(null);
  const [chargeAmountInput, setChargeAmountInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch damage reports & summary from backend
  const fetchDamageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, summaryRes] = await Promise.allSettled([
        adminService.getDamageReports({
          status: activeTab,
          search: debouncedSearch,
          page: currentPage,
          limit: pageSize,
        }),
        adminService.getDamageSummary(),
      ]);

      if (listRes.status === "fulfilled" && listRes.value?.success) {
        const raw = Array.isArray(listRes.value.data)
          ? listRes.value.data
          : listRes.value.data?.reports || [];
        setReports(raw);
        setTotalCount(listRes.value.data?.total ?? raw.length);
        setTotalPages(
          listRes.value.data?.pages ??
            Math.max(1, Math.ceil((listRes.value.data?.total || raw.length) / pageSize))
        );
      } else if (listRes.status === "rejected") {
        throw listRes.reason;
      }

      if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
        setSummary(summaryRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load damage reports:", err);
      setError(err?.message || "Could not load damage reports from server.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, currentPage, pageSize]);

  useEffect(() => {
    fetchDamageData();
  }, [fetchDamageData]);

  // Handle Charge Driver
  const handleChargeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    const amount = Number(chargeAmountInput || selectedReport.chargeAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid positive charge amount.");
      return;
    }

    setActionLoading(true);
    try {
      await adminService.chargeDamage(
        selectedReport.bookingId,
        selectedReport.reportId,
        amount
      );
      // Update local state
      setReports((prev) =>
        prev.map((r) =>
          r.reportId === selectedReport.reportId
            ? { ...r, status: "charged", chargeAmount: amount }
            : r
        )
      );
      setSelectedReport((prev) => ({
        ...prev,
        status: "charged",
        chargeAmount: amount,
      }));
      fetchDamageData();
    } catch (err) {
      alert(`Charge failed: ${err?.message || "Error processing damage charge"}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Mark Disputed
  const handleDispute = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      await adminService.disputeDamage(
        selectedReport.bookingId,
        selectedReport.reportId
      );
      setReports((prev) =>
        prev.map((r) =>
          r.reportId === selectedReport.reportId ? { ...r, status: "disputed" } : r
        )
      );
      setSelectedReport((prev) => ({ ...prev, status: "disputed" }));
      fetchDamageData();
    } catch (err) {
      alert(`Dispute failed: ${err?.message || "Error marking disputed"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status = "") => {
    switch (status.toLowerCase()) {
      case "charged":
        return "bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20";
      case "pending":
        return "bg-[#FFFBEB] text-[#F59E0B] border border-[#F59E0B]/20";
      case "disputed":
        return "bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      {/* Top 4 KPI Metrics from Damage Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="w-1 h-5 rounded-full bg-[#0066FF] mb-2" />
          <p className="text-xs font-medium text-gray-400 mb-1">Total Reports</p>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            {summary?.totalReports ?? reports.length}
          </h3>
          <p className="text-[11px] text-gray-400 mt-2 font-normal">All filed incidents</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="w-1 h-5 rounded-full bg-[#10B981] mb-2" />
          <p className="text-xs font-medium text-gray-400 mb-1">Total Charged</p>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            {formatCurrency(summary?.totalCharged ?? 895)}
          </h3>
          <p className="text-[11px] text-gray-400 mt-2 font-normal">
            {summary?.charged ?? 3} charged cases
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="w-1 h-5 rounded-full bg-[#F59E0B] mb-2" />
          <p className="text-xs font-medium text-gray-400 mb-1">Pending Review</p>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            {summary?.pending ?? 2}
          </h3>
          <p className="text-[11px] text-gray-400 mt-2 font-normal">
            Awaiting claim decision
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="w-1 h-5 rounded-full bg-[#EF4444] mb-2" />
          <p className="text-xs font-medium text-gray-400 mb-1">Disputed Reports</p>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            {summary?.disputed ?? 1}
          </h3>
          <p className="text-[11px] text-gray-400 mt-2 font-normal">
            Disputed by guest/renter
          </p>
        </div>
      </div>

      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {TABS.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                  isSelected
                    ? "bg-[#0066FF] text-white shadow-blue-500/20"
                    : "bg-white text-gray-700 border border-gray-200/80 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search report, vehicle, guest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchDamageData}
            title="Refresh damage reports"
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Damage Reports Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold tracking-wider text-gray-400 uppercase select-none">
                <th className="py-4 px-6 font-semibold">REPORT</th>
                <th className="py-4 px-6 font-semibold">DATE</th>
                <th className="py-4 px-6 font-semibold">VEHICLE</th>
                <th className="py-4 px-6 font-semibold">DRIVER</th>
                <th className="py-4 px-6 font-semibold">TYPE</th>
                <th className="py-4 px-6 font-semibold">SEVERITY</th>
                <th className="py-4 px-6 font-semibold text-center">STATUS</th>
                <th className="py-4 px-6 font-semibold text-right">CHARGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
                      <p className="text-xs font-medium">Loading damage reports...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-red-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6" />
                      <p className="text-xs font-medium">{error}</p>
                      <button
                        onClick={fetchDamageData}
                        className="mt-2 text-xs text-[#0066FF] underline font-semibold"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((report) => {
                  const reportCode = report.reportCode || "DR";
                  const dateStr = formatDate(report.reportedAt || report.createdAt);
                  const v = report.vehicle || {};
                  const vehicleName = `${v.year || ""} ${v.make || ""} ${v.model || ""}`.trim() || "Vehicle";
                  const driverName = report.guest
                    ? `${report.guest.firstName || ""} ${report.guest.lastName || ""}`.trim() ||
                      report.guest.email ||
                      "Driver"
                    : "Driver";
                  const chargeStr = formatCurrency(report.chargeAmount);

                  return (
                    <tr
                      key={report.reportId || report._id}
                      onClick={() => {
                        setSelectedReport(report);
                        setChargeAmountInput(report.chargeAmount ? String(report.chargeAmount) : "");
                      }}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-gray-900 whitespace-nowrap">
                        {reportCode}
                      </td>

                      <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-4 px-6 font-medium text-gray-800 whitespace-nowrap">
                        {vehicleName}
                      </td>

                      <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                        {driverName}
                      </td>

                      <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                        {report.damageType || "Exterior Scratch"}
                      </td>

                      <td className="py-4 px-6 font-semibold whitespace-nowrap">
                        <span
                          className={`capitalize ${
                            report.severity?.toLowerCase() === "major"
                              ? "text-red-600"
                              : report.severity?.toLowerCase() === "moderate"
                              ? "text-amber-600"
                              : "text-gray-700"
                          }`}
                        >
                          {report.severity || "Minor"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold leading-tight capitalize ${getStatusBadge(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-gray-900 text-right whitespace-nowrap">
                        {chargeStr}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                    No damage reports found matching "{activeTab}" filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          DAMAGE REPORT INSPECTOR & CLAIM RESOLUTION MODAL
          ========================================================================= */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  DAMAGE INCIDENT REPORT
                </p>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight mt-0.5 font-mono">
                  {selectedReport.reportCode || "DR Incident"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Photo Evidence Preview */}
              {selectedReport.photoUrls && selectedReport.photoUrls.length > 0 && (
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 h-44 flex items-center justify-center relative">
                  <img
                    src={selectedReport.photoUrls[0]}
                    alt="Damage Evidence"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <ImageIcon size={10} />
                    <span>Evidence Photo</span>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">
                  Incident Description
                </p>
                <p className="text-gray-800 text-xs leading-relaxed">
                  {selectedReport.description || "No description provided by inspector."}
                </p>
              </div>

              {/* Vehicle & Driver Details */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Vehicle</p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {selectedReport.vehicle?.year} {selectedReport.vehicle?.make}{" "}
                    {selectedReport.vehicle?.model}
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    {selectedReport.vehicle?.licensePlate}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Driver</p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {selectedReport.guest?.firstName} {selectedReport.guest?.lastName}
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Booking: {selectedReport.bookingReference || "Direct"}
                  </p>
                </div>
              </div>

              {/* Status & Resolution Form */}
              <div className="bg-[#12141F] rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Charge Assessment
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      selectedReport.status === "charged"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : selectedReport.status === "disputed"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {selectedReport.status}
                  </span>
                </div>

                <form onSubmit={handleChargeSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                        $
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={chargeAmountInput}
                        onChange={(e) => setChargeAmountInput(e.target.value)}
                        placeholder="Enter charge amount"
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-7 pr-3 py-2 text-white placeholder-gray-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-[#0066FF] hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {actionLoading && <Loader2 size={12} className="animate-spin" />}
                      <span>Apply Charge</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between gap-2 pt-2">
                {selectedReport.status !== "disputed" && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleDispute}
                    className="text-red-600 hover:text-red-700 font-semibold text-xs transition-colors hover:underline"
                  >
                    Mark as Disputed
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-5 py-2 rounded-xl transition-colors ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
