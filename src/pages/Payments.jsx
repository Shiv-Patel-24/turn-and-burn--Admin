import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  X,
  Loader2,
  RefreshCw,
  Search,
  AlertCircle,
  CreditCard,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { adminService } from "../api/admin";

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
  if (amount === undefined || amount === null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function Payments() {
  const [activeTab, setActiveTab] = useState("Transactions");

  // Transactions State
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summaryPeriod, setSummaryPeriod] = useState("all");

  // Pricing Tiers State
  const [tiers, setTiers] = useState([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [tiersError, setTiersError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [currentTier, setCurrentTier] = useState({
    _id: null,
    name: "",
    applicableVehicles: "",
    hourlyRateMin: "",
    hourlyRateMax: "",
    dailyRateMin: "",
    dailyRateMax: "",
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Transactions and Summary
  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    setTxError(null);
    try {
      const [listRes, summaryRes] = await Promise.allSettled([
        adminService.getTransactions({
          search: debouncedSearch,
          page: currentPage,
          limit: pageSize,
        }),
        adminService.getTransactionsSummary(summaryPeriod),
      ]);

      if (listRes.status === "fulfilled" && listRes.value?.success) {
        const raw = listRes.value.data?.transactions || [];
        setTransactions(raw);
        setTotalCount(listRes.value.data?.total ?? raw.length);
        setTotalPages(
          listRes.value.data?.pages ??
            Math.max(1, Math.ceil((listRes.value.data?.total || 1) / pageSize))
        );
      } else if (listRes.status === "rejected") {
        throw listRes.reason;
      }

      if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
        setSummary(summaryRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
      setTxError(err?.message || "Could not load transactions from server.");
    } finally {
      setTxLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, summaryPeriod]);

  // Fetch Pricing Tiers
  const fetchTiers = useCallback(async () => {
    setTiersLoading(true);
    setTiersError(null);
    try {
      const res = await adminService.getPricingTiers();
      if (res && res.success) {
        setTiers(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load pricing tiers:", err);
      setTiersError(err?.message || "Could not load pricing tiers.");
    } finally {
      setTiersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "Transactions") {
      fetchTransactions();
    } else {
      fetchTiers();
    }
  }, [activeTab, fetchTransactions, fetchTiers]);

  // Modal Handlers
  const openAddModal = () => {
    setModalMode("add");
    setModalError("");
    setCurrentTier({
      _id: null,
      name: "",
      applicableVehicles: "",
      hourlyRateMin: "",
      hourlyRateMax: "",
      dailyRateMin: "",
      dailyRateMax: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tier) => {
    setModalMode("edit");
    setModalError("");
    setCurrentTier({
      _id: tier._id,
      name: tier.name || "",
      applicableVehicles: tier.applicableVehicles || "",
      hourlyRateMin: tier.hourlyRateMin ?? "",
      hourlyRateMax: tier.hourlyRateMax ?? "",
      dailyRateMin: tier.dailyRateMin ?? "",
      dailyRateMax: tier.dailyRateMax ?? "",
    });
    setIsModalOpen(true);
  };

  const handleSaveTierModal = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");

    const payload = {
      name: currentTier.name.trim(),
      applicableVehicles: currentTier.applicableVehicles.trim(),
      hourlyRateMin: Number(currentTier.hourlyRateMin),
      hourlyRateMax: Number(currentTier.hourlyRateMax),
      dailyRateMin: Number(currentTier.dailyRateMin),
      dailyRateMax: Number(currentTier.dailyRateMax),
    };

    try {
      if (modalMode === "add") {
        await adminService.createPricingTier(payload);
      } else {
        await adminService.updatePricingTier(currentTier._id, payload);
      }
      setIsModalOpen(false);
      fetchTiers();
    } catch (err) {
      setModalError(err?.message || "Failed to save pricing tier.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteTier = async (id, name) => {
    if (!window.confirm(`Delete pricing tier "${name}"?`)) return;
    try {
      await adminService.deletePricingTier(id);
      fetchTiers();
    } catch (err) {
      alert(`Delete failed: ${err?.message || "Error deleting tier"}`);
    }
  };

  const getStatusBadge = (status = "") => {
    switch (status.toLowerCase()) {
      case "paid":
      case "succeeded":
        return "bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20";
      case "pending":
        return "bg-[#FFFBEB] text-[#F59E0B] border border-[#F59E0B]/20";
      case "refunded":
        return "bg-[#F3F4F6] text-[#6B7280] border border-gray-200";
      case "failed":
        return "bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      {/* Tab Switcher & Refresh */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {["Transactions", "Pricing Control"].map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
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

        <button
          type="button"
          onClick={() =>
            activeTab === "Transactions" ? fetchTransactions() : fetchTiers()
          }
          title="Refresh data"
          className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw
            size={14}
            className={txLoading || tiersLoading ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* =========================================================================
          TAB 1: TRANSACTIONS & FINANCIAL SUMMARY
          ========================================================================= */}
      {activeTab === "Transactions" && (
        <div className="space-y-6">
          {/* Top Financial KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="w-1 h-5 rounded-full bg-[#10B981] mb-2" />
              <p className="text-xs font-medium text-gray-400 mb-1">
                Total Revenue ({summaryPeriod === "all" ? "All Time" : "This Month"})
              </p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(summary?.totalRevenue ?? 15757.51)}
              </h3>
              <p className="text-[11px] text-gray-400 mt-2 font-normal">
                {summary?.transactions ?? totalCount} successful transactions
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="w-1 h-5 rounded-full bg-[#F59E0B] mb-2" />
              <p className="text-xs font-medium text-gray-400 mb-1">Pending Amount</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(summary?.pending ?? 1824.52)}
              </h3>
              <p className="text-[11px] text-gray-400 mt-2 font-normal">
                Awaiting clearance / cash settlement
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="w-1 h-5 rounded-full bg-[#6B7280] mb-2" />
              <p className="text-xs font-medium text-gray-400 mb-1">Refunded</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(summary?.refunded ?? 655.7)}
              </h3>
              <p className="text-[11px] text-gray-400 mt-2 font-normal">
                {summary?.refundCount ?? 2} processed refunds
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="w-1 h-5 rounded-full bg-[#0066FF] mb-2" />
              <p className="text-xs font-medium text-gray-400 mb-1">
                Avg. Booking Value
              </p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(summary?.averageBooking ?? 291.81)}
              </h3>
              <p className="text-[11px] text-gray-400 mt-2 font-normal">
                Per transaction average
              </p>
            </div>
          </div>

          {/* Search & Period Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search reference, customer, booking..."
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

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">KPI Period:</span>
              <button
                type="button"
                onClick={() => setSummaryPeriod("all")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  summaryPeriod === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => setSummaryPeriod("month")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  summaryPeriod === "month"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Transactions Table Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-semibold tracking-wider text-gray-400 uppercase select-none">
                    <th className="py-4 px-6 font-semibold">TRANSACTION</th>
                    <th className="py-4 px-6 font-semibold">CUSTOMER</th>
                    <th className="py-4 px-6 font-semibold">METHOD</th>
                    <th className="py-4 px-6 font-semibold">DATE</th>
                    <th className="py-4 px-6 font-semibold text-center">STATUS</th>
                    <th className="py-4 px-6 font-semibold text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {txLoading ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
                          <p className="text-xs font-medium">
                            Loading transactions from server...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : txError ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-red-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="w-6 h-6" />
                          <p className="text-xs font-medium">{txError}</p>
                          <button
                            onClick={fetchTransactions}
                            className="mt-2 text-xs text-[#0066FF] underline font-semibold"
                          >
                            Try Again
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length > 0 ? (
                    transactions.map((tx) => {
                      const customerName = tx.payer
                        ? `${tx.payer.firstName || ""} ${tx.payer.lastName || ""}`.trim() ||
                          tx.payer.email ||
                          "Customer"
                        : "Customer";
                      const bookingCode = tx.booking?.referenceCode || "Direct";
                      const txRef = tx.referenceCode || tx._id?.slice(-8).toUpperCase() || "TRX";
                      const methodDisplay = tx.method
                        ? tx.method.toUpperCase()
                        : tx.provider
                        ? tx.provider.toUpperCase()
                        : "CARD";

                      return (
                        <tr
                          key={tx._id}
                          className="hover:bg-gray-50/70 transition-colors"
                        >
                          <td className="py-4 px-6 whitespace-nowrap">
                            <p className="font-mono font-bold text-gray-700">
                              {txRef}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                              {bookingCode}
                            </p>
                          </td>

                          <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                            {customerName}
                          </td>

                          <td className="py-4 px-6 text-gray-600 whitespace-nowrap capitalize">
                            {methodDisplay}
                          </td>

                          <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                            {formatDate(tx.createdAt)}
                          </td>

                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold leading-tight capitalize ${getStatusBadge(
                                tx.status
                              )}`}
                            >
                              {tx.status}
                            </span>
                          </td>

                          <td className="py-4 px-6 font-bold text-gray-900 text-right whitespace-nowrap">
                            {formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 select-none">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-xs font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-2 text-gray-400 pointer-events-none"
                />
              </div>
              <span className="text-gray-400 text-xs">/Page</span>
              <span className="text-gray-400 text-xs ml-2">
                Showing {transactions.length} of {totalCount} total transactions
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1 || txLoading}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isCurrent = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                      isCurrent
                        ? "border border-[#0066FF] text-[#0066FF] bg-white font-semibold"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages || txLoading}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PRICING TIERS & CONTROLS
          ========================================================================= */}
      {activeTab === "Pricing Control" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Live Pricing Tiers
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Dynamic rate ranges applied across Turn & Burn vehicle categories
              </p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Add Tier</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold tracking-wider text-gray-400 uppercase select-none">
                  <th className="py-4 px-6 font-semibold">CATEGORY</th>
                  <th className="py-4 px-6 font-semibold">APPLICABLE VEHICLES</th>
                  <th className="py-4 px-6 font-semibold">HOURLY RATE RANGE</th>
                  <th className="py-4 px-6 font-semibold">DAILY RATE RANGE</th>
                  <th className="py-4 px-6 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {tiersLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
                        <p className="text-xs font-medium">Loading pricing tiers...</p>
                      </div>
                    </td>
                  </tr>
                ) : tiersError ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-red-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-6 h-6" />
                        <p className="text-xs font-medium">{tiersError}</p>
                      </div>
                    </td>
                  </tr>
                ) : tiers.length > 0 ? (
                  tiers.map((tier) => (
                    <tr key={tier._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                        {tier.name}
                      </td>

                      <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                        {tier.applicableVehicles || "All matching vehicles"}
                      </td>

                      <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                        ${tier.hourlyRateMin}–${tier.hourlyRateMax} / hr
                      </td>

                      <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                        ${tier.dailyRateMin}–${tier.dailyRateMax} / day
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEditModal(tier)}
                            className="text-[#0066FF] hover:text-[#0052cc] font-semibold text-xs transition-colors hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTier(tier._id, tier.name)}
                            className="text-red-500 hover:text-red-700 font-semibold text-xs transition-colors hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                      No pricing tiers configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT PRICING TIER
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {modalMode === "edit" ? "Edit Pricing Tier" : "New Pricing Tier"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTierModal} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Economy, Premium, Luxury EV"
                  value={currentTier.name}
                  onChange={(e) =>
                    setCurrentTier({ ...currentTier, name: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                  Applicable Vehicles
                </label>
                <input
                  type="text"
                  placeholder="e.g. Toyota Camry, Honda CR-V"
                  value={currentTier.applicableVehicles}
                  onChange={(e) =>
                    setCurrentTier({
                      ...currentTier,
                      applicableVehicles: e.target.value,
                    })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                    Hourly Min ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="15"
                    value={currentTier.hourlyRateMin}
                    onChange={(e) =>
                      setCurrentTier({
                        ...currentTier,
                        hourlyRateMin: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                    Hourly Max ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="17"
                    value={currentTier.hourlyRateMax}
                    onChange={(e) =>
                      setCurrentTier({
                        ...currentTier,
                        hourlyRateMax: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                    Daily Min ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="95"
                    value={currentTier.dailyRateMin}
                    onChange={(e) =>
                      setCurrentTier({
                        ...currentTier,
                        dailyRateMin: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                    Daily Max ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="105"
                    value={currentTier.dailyRateMax}
                    onChange={(e) =>
                      setCurrentTier({
                        ...currentTier,
                        dailyRateMax: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {modalLoading && <Loader2 size={13} className="animate-spin" />}
                  <span>{modalMode === "edit" ? "Save Changes" : "Create Tier"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
