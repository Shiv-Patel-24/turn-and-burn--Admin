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
  CheckCircle2,
  Send,
  Building2,
  User,
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

  const [payouts, setPayouts] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [payoutsError, setPayoutsError] = useState(null);
  const [payoutFilter, setPayoutFilter] = useState("all"); // "all" | "pending" | "paid" | "failed"
  const [hostsList, setHostsList] = useState([]);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutModalLoading, setPayoutModalLoading] = useState(false);
  const [payoutModalError, setPayoutModalError] = useState("");
  const [markingPaidId, setMarkingPaidId] = useState(null);
  const [newPayout, setNewPayout] = useState({
    hostId: "",
    amount: "",
    method: "bank_transfer",
    note: "",
    periodStart: "",
    periodEnd: "",
  });

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
            Math.max(1, Math.ceil((listRes.value.data?.total || 1) / pageSize)),
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

  const fetchPayouts = useCallback(async () => {
    setPayoutsLoading(true);
    setPayoutsError(null);
    try {
      const res = await adminService.getPayouts({
        status: payoutFilter !== "all" ? payoutFilter : undefined,
      });
      if (res && res.success) {
        setPayouts(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load payouts:", err);
      setPayoutsError(err?.message || "Could not load payouts from server.");
    } finally {
      setPayoutsLoading(false);
    }
  }, [payoutFilter]);

  // Fetch Hosts for Payout modal
  const fetchHostsForPayout = async () => {
    try {
      const res = await adminService.getHosts({ limit: 100 });
      if (res?.data?.hosts) {
        setHostsList(res.data.hosts);
      }
    } catch (err) {
      console.error("Failed to load hosts:", err);
    }
  };

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
    } else if (activeTab === "Host Payouts") {
      fetchPayouts();
      fetchHostsForPayout();
    } else {
      fetchTiers();
    }
  }, [activeTab, fetchTransactions, fetchPayouts, fetchTiers]);

  const handleMarkPaid = async (payoutId) => {
    if (
      !window.confirm(
        "Are you sure you want to mark this payout as PAID? The host will receive a real-time notification.",
      )
    ) {
      return;
    }
    setMarkingPaidId(payoutId);
    try {
      await adminService.markPayoutPaid(payoutId);
      fetchPayouts();
    } catch (err) {
      alert(`Could not mark payout as paid: ${err?.message}`);
    } finally {
      setMarkingPaidId(null);
    }
  };

  const handleCreatePayout = async (e) => {
    e.preventDefault();
    setPayoutModalLoading(true);
    setPayoutModalError("");

    if (!newPayout.hostId) {
      setPayoutModalError("Please select a host.");
      setPayoutModalLoading(false);
      return;
    }

    try {
      const payload = {
        hostId: newPayout.hostId,
        amount: Number(newPayout.amount),
        method: newPayout.method,
        note: newPayout.note || "",
        periodStart: newPayout.periodStart
          ? new Date(newPayout.periodStart)
          : undefined,
        periodEnd: newPayout.periodEnd
          ? new Date(newPayout.periodEnd)
          : undefined,
      };

      await adminService.createPayout(payload);
      setIsPayoutModalOpen(false);
      setNewPayout({
        hostId: "",
        amount: "",
        method: "bank_transfer",
        note: "",
        periodStart: "",
        periodEnd: "",
      });
      fetchPayouts();
    } catch (err) {
      console.error("Error creating payout:", err);
      setPayoutModalError(err?.message || "Failed to create payout.");
    } finally {
      setPayoutModalLoading(false);
    }
  };

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

  const handleSaveTier = async (e) => {
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

  const totalPayoutPending = payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPayoutPaid = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {["Transactions", "Host Payouts", "Pricing Control"].map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
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
          onClick={() => {
            if (activeTab === "Transactions") fetchTransactions();
            else if (activeTab === "Host Payouts") fetchPayouts();
            else fetchTiers();
          }}
          className="border border-gray-200/80 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          title="Refresh current data"
        >
          <RefreshCw
            size={13}
            className={
              (activeTab === "Transactions" && txLoading) ||
              (activeTab === "Host Payouts" && payoutsLoading) ||
              (activeTab === "Pricing Control" && tiersLoading)
                ? "animate-spin"
                : ""
            }
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {activeTab === "Transactions" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  Total Revenue
                </span>
                <span className="p-2 rounded-xl bg-blue-50 text-[#0066FF]">
                  <DollarSign size={16} />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {summary ? formatCurrency(summary.totalRevenue) : "$0.00"}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                <span>{summary?.successfulCount ?? 0} successful charges</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  Net Processed
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <TrendingUp size={16} />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {summary ? formatCurrency(summary.netRevenue) : "$0.00"}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1">
                <span>Gross revenue less refunds</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  Total Refunded
                </span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <RotateCcw size={16} />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {summary ? formatCurrency(summary.totalRefunded) : "$0.00"}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-1">
                <span>{summary?.refundCount ?? 0} refunded charges</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  Timeframe Filter
                </span>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Clock size={16} />
                </span>
              </div>
              <div className="mt-2">
                <select
                  value={summaryPeriod}
                  onChange={(e) => setSummaryPeriod(e.target.value)}
                  className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All-Time Metrics</option>
                  <option value="month">Current Month</option>
                </select>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Controls summary calculation
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Transaction History
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  All customer card charges, trip authorizations, and settled
                  refunds
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search ref, customer, or trip..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                      TRANSACTION REF
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                      CUSTOMER
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                      METHOD
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                      DATE
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px] text-center">
                      STATUS
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px] text-right">
                      AMOUNT
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {txLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-400"
                      >
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
                      <td
                        colSpan={6}
                        className="py-12 text-center text-red-500"
                      >
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
                      const txRef =
                        tx.referenceCode ||
                        tx._id?.slice(-8).toUpperCase() ||
                        "TRX";
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
                                tx.status,
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
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-400 text-xs"
                      >
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100 select-none">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <span className="text-gray-300">•</span>
                <span>{totalCount} total transactions</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1 || txLoading}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages || txLoading}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Host Payouts" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <span className="text-xs font-medium text-gray-400">
                Pending Payouts
              </span>
              <p className="text-2xl font-bold text-amber-600 mt-2">
                {formatCurrency(totalPayoutPending)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                {payouts.filter((p) => p.status === "pending").length} awaiting
                clearance
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <span className="text-xs font-medium text-gray-400">
                Settled to Hosts
              </span>
              <p className="text-2xl font-bold text-emerald-600 mt-2">
                {formatCurrency(totalPayoutPaid)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                {payouts.filter((p) => p.status === "paid").length} successfully
                disbursed
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-gray-400">
                  Create Payout
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Issue an earnings disbursement to a host partner.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPayoutModalError("");
                  setIsPayoutModalOpen(true);
                }}
                className="mt-3 bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Plus size={14} />
                <span>Issue Host Payout</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Host Payout Disbursements
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Earnings settlements disbursed to host accounts and bank
                  details
                </p>
              </div>

              <div className="flex items-center gap-2">
                {["all", "pending", "paid"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setPayoutFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                      payoutFilter === st
                        ? "bg-[#0066FF] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                      REFERENCE CODE
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                      HOST PARTNER
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                      METHOD
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                      CREATED / PAID AT
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px] text-center">
                      STATUS
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px] text-right">
                      AMOUNT
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px] text-right">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payoutsLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-gray-400"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
                          <p className="text-xs font-medium">
                            Loading host payouts...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : payoutsError ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-rose-500"
                      >
                        <p className="text-xs font-medium">{payoutsError}</p>
                        <button
                          onClick={fetchPayouts}
                          className="mt-2 text-xs text-[#0066FF] underline font-semibold"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : payouts.length > 0 ? (
                    payouts.map((po) => {
                      const hostName = po.host
                        ? `${po.host.firstName || ""} ${po.host.lastName || ""}`.trim() ||
                          po.host.email
                        : "Host Partner";
                      const hostEmail = po.host?.email || "";

                      return (
                        <tr
                          key={po._id}
                          className="hover:bg-gray-50/70 transition-colors"
                        >
                          <td className="py-4 px-6 whitespace-nowrap font-mono font-bold text-gray-800">
                            {po.referenceCode ||
                              `PO-${po._id.slice(-6).toUpperCase()}`}
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            <p className="font-semibold text-gray-900">
                              {hostName}
                            </p>
                            {hostEmail && (
                              <p className="text-[11px] text-gray-400">
                                {hostEmail}
                              </p>
                            )}
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap text-gray-600 capitalize">
                            {(po.method || "bank_transfer").replace("_", " ")}
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap text-gray-400">
                            <p>{formatDate(po.createdAt)}</p>
                            {po.paidAt && (
                              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                Paid {formatDate(po.paidAt)}
                              </p>
                            )}
                          </td>

                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold leading-tight capitalize ${
                                po.status === "paid"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {po.status}
                            </span>
                          </td>

                          <td className="py-4 px-6 font-bold text-gray-900 text-right whitespace-nowrap text-sm">
                            {formatCurrency(po.amount)}
                          </td>

                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            {po.status === "pending" ? (
                              <button
                                type="button"
                                disabled={markingPaidId === po._id}
                                onClick={() => handleMarkPaid(po._id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                              >
                                {markingPaidId === po._id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={12} />
                                )}
                                <span>Mark Paid</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-gray-400 font-medium">
                                Cleared
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-gray-400 text-xs"
                      >
                        No host payouts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Pricing Control" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Live Pricing Tiers
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Dynamic rate ranges applied across Turn &amp; Burn vehicle
                categories
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
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                    TIER NAME
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                    VEHICLES APPLICABLE
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                    HOURLY RANGE
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                    DAILY RANGE
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px] text-right">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tiersLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
                        <p className="text-xs font-medium">
                          Loading pricing tiers from server...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : tiersError ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-red-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-6 h-6" />
                        <p className="text-xs font-medium">{tiersError}</p>
                        <button
                          onClick={fetchTiers}
                          className="mt-2 text-xs text-[#0066FF] underline font-semibold"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : tiers.length > 0 ? (
                  tiers.map((t) => (
                    <tr
                      key={t._id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                        {t.name}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {t.applicableVehicles || "All standard fleet"}
                      </td>
                      <td className="py-4 px-6 text-gray-700 whitespace-nowrap font-medium">
                        ${t.hourlyRateMin} – ${t.hourlyRateMax} /hr
                      </td>
                      <td className="py-4 px-6 text-gray-700 whitespace-nowrap font-medium">
                        ${t.dailyRateMin} – ${t.dailyRateMax} /day
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(t)}
                          className="text-[#0066FF] hover:underline font-semibold"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTier(t._id, t.name)}
                          className="text-red-500 hover:underline font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-gray-400 text-xs"
                    >
                      No pricing tiers found. Click &quot;Add Tier&quot; to
                      create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Disburse Host Payout
              </h3>
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {payoutModalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{payoutModalError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePayout} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                  Host Partner *
                </label>
                <select
                  required
                  value={newPayout.hostId}
                  onChange={(e) =>
                    setNewPayout({ ...newPayout, hostId: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Select Host --</option>
                  {hostsList.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.firstName} {h.lastName} ({h.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 850.00"
                    value={newPayout.amount}
                    onChange={(e) =>
                      setNewPayout({ ...newPayout, amount: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                    Disbursement Method
                  </label>
                  <select
                    value={newPayout.method}
                    onChange={(e) =>
                      setNewPayout({ ...newPayout, method: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="bank_transfer">
                      Bank Transfer (ACH / Wire)
                    </option>
                    <option value="card">Card Payout</option>
                    <option value="apple_pay">Apple Pay</option>
                    <option value="google_pay">Google Pay</option>
                    <option value="cash">Cash / Cheque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                    Period Start
                  </label>
                  <input
                    type="date"
                    value={newPayout.periodStart}
                    onChange={(e) =>
                      setNewPayout({
                        ...newPayout,
                        periodStart: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                    Period End
                  </label>
                  <input
                    type="date"
                    value={newPayout.periodEnd}
                    onChange={(e) =>
                      setNewPayout({ ...newPayout, periodEnd: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                  Internal Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. October monthly earnings settlement after platform fee"
                  value={newPayout.note}
                  onChange={(e) =>
                    setNewPayout({ ...newPayout, note: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutModalLoading}
                  className="px-5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {payoutModalLoading && (
                    <Loader2 size={13} className="animate-spin" />
                  )}
                  <span>Release Payout</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {modalMode === "edit"
                  ? "Edit Pricing Tier"
                  : "Add New Pricing Tier"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTier} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                  Tier Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Economy, Luxury, SUV"
                  value={currentTier.name}
                  onChange={(e) =>
                    setCurrentTier({ ...currentTier, name: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                  Applicable Vehicles
                </label>
                <input
                  type="text"
                  placeholder="e.g. Toyota Corolla, Honda Civic, Nissan Altima"
                  value={currentTier.applicableVehicles}
                  onChange={(e) =>
                    setCurrentTier({
                      ...currentTier,
                      applicableVehicles: e.target.value,
                    })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    placeholder="12"
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
                  {modalLoading && (
                    <Loader2 size={13} className="animate-spin" />
                  )}
                  <span>
                    {modalMode === "edit" ? "Save Changes" : "Create Tier"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
