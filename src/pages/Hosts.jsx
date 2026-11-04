import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Search,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Car,
  RefreshCw,
  Award,
} from "lucide-react";
import { adminService } from "../api/admin";

const TABS = ["All", "Verified", "Pending", "Blocked"];

// Deterministic vibrant avatar background color picker based on host name
const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-indigo-600",
  "bg-purple-600",
  "bg-amber-600",
  "bg-teal-600",
  "bg-rose-600",
  "bg-sky-600",
];

function getAvatarBg(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function getInitials(firstName = "", lastName = "") {
  const f = (firstName || "").charAt(0).toUpperCase();
  const l = (lastName || "").charAt(0).toUpperCase();
  return `${f}${l}` || "H";
}

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

export default function Hosts() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);

  // Pagination states from backend
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal / Drawer state for "View ID / Host KYC Details"
  const [selectedHostForId, setSelectedHostForId] = useState(null);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch hosts dynamically from backend API
  const fetchHosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getHosts({
        status: activeTab,
        search: debouncedSearch,
        page: currentPage,
        limit: pageSize,
      });

      if (res && res.success && res.data) {
        setHosts(res.data.users || []);
        setTotalCount(res.data.total ?? (res.data.users || []).length);
        setTotalPages(
          res.data.pages ??
            Math.max(1, Math.ceil((res.data.total || 1) / pageSize))
        );
      } else {
        setHosts([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch hosts:", err);
      setError(err?.message || "Could not load hosts from server.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, currentPage, pageSize]);

  useEffect(() => {
    fetchHosts();
  }, [fetchHosts]);

  // Block / Unblock host action
  const handleToggleBlock = async (host) => {
    const isCurrentlyBlocked =
      !host.isActive || host.accountStatus === "blocked";
    const nextStatus = isCurrentlyBlocked ? "verified" : "blocked";
    setActionLoadingId(host._id);

    try {
      if (isCurrentlyBlocked) {
        await adminService.unblockHost(host._id);
      } else {
        await adminService.blockHost(host._id);
      }

      // Optimistic update local list
      setHosts((prev) =>
        prev.map((h) => {
          if (h._id === host._id) {
            const updated = {
              ...h,
              isActive: isCurrentlyBlocked,
              accountStatus: nextStatus,
            };
            if (selectedHostForId && selectedHostForId._id === host._id) {
              setSelectedHostForId(updated);
            }
            return updated;
          }
          return h;
        })
      );
    } catch (err) {
      alert(`Action failed: ${err?.message || "Could not update host status"}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Inspect host details (KYC, license, bookings as host)
  const handleInspectHost = async (host) => {
    setSelectedHostForId(host);
    try {
      const res = await adminService.getHostDetails(host._id);
      if (res && res.success && res.data) {
        setSelectedHostForId(res.data);
      }
    } catch (err) {
      console.warn("Could not load full host details, using basic info:", err);
    }
  };

  const getStatusBadge = (host) => {
    const status =
      host.accountStatus ||
      (!host.isActive
        ? "blocked"
        : host?.license?.status === "approved"
        ? "verified"
        : "pending");

    switch (status.toLowerCase()) {
      case "verified":
        return "bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20";
      case "pending":
        return "bg-[#FFFBEB] text-[#F59E0B] border border-[#F59E0B]/20";
      case "blocked":
        return "bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-10">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
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

        {/* Search Bar + Refresh Button */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
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
            onClick={fetchHosts}
            title="Refresh hosts"
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Hosts Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold tracking-wider text-gray-400 uppercase select-none">
                <th className="py-4 px-6 font-semibold">HOSTS</th>
                <th className="py-4 px-6 font-semibold">PHONE</th>
                <th className="py-4 px-6 font-semibold">JOINED</th>
                <th className="py-4 px-6 font-semibold">BOOKINGS</th>
                <th className="py-4 px-6 font-semibold text-center">STATUS</th>
                <th className="py-4 px-6 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
                      <p className="text-xs font-medium">
                        Loading hosts from backend...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-red-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6" />
                      <p className="text-xs font-medium">{error}</p>
                      <button
                        onClick={fetchHosts}
                        className="mt-2 text-xs text-[#0066FF] underline font-semibold"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : hosts.length > 0 ? (
                hosts.map((host) => {
                  const fullName =
                    `${host.firstName || ""} ${host.lastName || ""}`.trim() ||
                    "Turn & Burn Host";
                  const initials = getInitials(host.firstName, host.lastName);
                  const avatarColor = getAvatarBg(fullName);
                  const displayPhone = host.phoneNumber
                    ? `${host.phoneCountryCode || "+1"} ${host.phoneNumber}`
                    : "No phone on file";
                  const isBlocked =
                    !host.isActive || host.accountStatus === "blocked";
                  const statusLabel =
                    host.accountStatus === "verified"
                      ? "Verified"
                      : host.accountStatus === "pending"
                      ? "Pending"
                      : isBlocked
                      ? "Blocked"
                      : "Verified";

                  return (
                    <tr
                      key={host._id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Host Info */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {host.profilePhotoUrl ? (
                            <img
                              src={host.profilePhotoUrl}
                              alt={fullName}
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0 shadow-sm border border-gray-100"
                            />
                          ) : (
                            <div
                              className={`w-9 h-9 rounded-full ${avatarColor} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm`}
                            >
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 leading-tight">
                              {fullName}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {host.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                        {displayPhone}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                        {formatDate(host.createdAt)}
                      </td>

                      {/* Bookings Count */}
                      <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                        {host.bookingsCount ?? host.bookingsAsHost ?? 0}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold leading-tight capitalize ${getStatusBadge(
                            host
                          )}`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-3 justify-end">
                          <button
                            type="button"
                            onClick={() => handleInspectHost(host)}
                            className="text-[#0066FF] hover:text-[#0052cc] font-semibold text-xs transition-colors hover:underline"
                          >
                            View ID
                          </button>

                          <button
                            type="button"
                            disabled={actionLoadingId === host._id}
                            onClick={() => handleToggleBlock(host)}
                            className={`font-semibold text-xs transition-colors hover:underline flex items-center gap-1 ${
                              isBlocked
                                ? "text-[#10B981] hover:text-[#059669]"
                                : "text-[#DC2626] hover:text-[#b91c1c]"
                            } disabled:opacity-50`}
                          >
                            {actionLoadingId === host._id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : null}
                            <span>{isBlocked ? "Unblock" : "Block"}</span>
                          </button>
                        </div>
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
                    No hosts found matching "{activeTab}" filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
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
            Showing {hosts.length} of {totalCount} total hosts
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
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
            disabled={currentPage >= totalPages || loading}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW ID / HOST PROFILE & KYC INSPECTOR MODAL
          ========================================================================= */}
      {selectedHostForId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  HOST VERIFICATION & PROFILE
                </p>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight mt-0.5">
                  {`${selectedHostForId.firstName || ""} ${selectedHostForId.lastName || ""}`.trim() ||
                    "Host Details"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHostForId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Host Credentials Card Preview */}
            <div className="bg-[#12141F] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden mb-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[9px] font-semibold tracking-wider text-gray-400 uppercase">
                    HOST PROFILE
                  </p>
                  <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
                    {`${selectedHostForId.firstName || ""} ${selectedHostForId.lastName || ""}`.trim() ||
                      "N/A"}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Referral Code:{" "}
                    <span className="font-mono text-white font-semibold">
                      {selectedHostForId.referralCode || "N/A"}
                    </span>
                  </p>
                </div>
                <div
                  className={`w-9 h-9 rounded-full ${getAvatarBg(
                    selectedHostForId.firstName
                  )} text-white font-bold text-xs flex items-center justify-center shadow-md`}
                >
                  {getInitials(
                    selectedHostForId.firstName,
                    selectedHostForId.lastName
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-left">
                <div>
                  <p className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
                    LICENSE NO.
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5 tracking-wide font-mono">
                    {selectedHostForId.license?.licenseNumber || "Not Submitted"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
                    STATE / COUNTRY
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {selectedHostForId.license?.state || "N/A"},{" "}
                    {selectedHostForId.license?.issuingCountry ||
                      selectedHostForId.country ||
                      "USA"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
                    PAYOUT METHOD
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5 capitalize">
                    {selectedHostForId.payoutMethod || "Card / Online"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
                    TIMEZONE
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {selectedHostForId.timeZone || "UTC"}
                  </p>
                </div>
              </div>

              {/* Status footer inside card */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">KYC Status:</span>
                <span
                  className={`font-semibold capitalize px-2 py-0.5 rounded text-[10px] ${
                    selectedHostForId.license?.status === "approved"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : selectedHostForId.license?.status === "rejected"
                      ? "bg-red-500/20 text-red-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {selectedHostForId.license?.status || "Not Submitted"}
                </span>
              </div>
            </div>

            {/* Quick Details List */}
            <div className="space-y-2.5 text-xs mb-5 px-1 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Mail size={13} className="text-gray-400" /> Email
                </span>
                <span className="font-semibold text-gray-900 select-all">
                  {selectedHostForId.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-400" /> Phone
                </span>
                <span className="font-semibold text-gray-900 select-all">
                  {selectedHostForId.phoneNumber
                    ? `${selectedHostForId.phoneCountryCode || "+1"} ${selectedHostForId.phoneNumber}`
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Car size={13} className="text-gray-400" /> Host Bookings
                </span>
                <span className="font-bold text-gray-900">
                  {selectedHostForId.bookingsAsHost ??
                    selectedHostForId.bookingsCount ??
                    0}{" "}
                  completed
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" /> Host Since
                </span>
                <span className="font-semibold text-gray-900">
                  {formatDate(selectedHostForId.createdAt)}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedHostForId(null)}
                className="w-full bg-[#F3F4F6] hover:bg-gray-200 text-gray-800 text-xs font-bold py-2.5 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
