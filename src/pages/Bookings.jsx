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
  Calendar,
  DollarSign,
  Car,
  User,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { adminService } from "../api/admin";

const TABS = ["All", "Active", "Completed", "Pending", "Cancelled"];

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

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal / Inspector state for a booking
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Debounce search query by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch bookings dynamically from backend
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getBookings({
        status: activeTab,
        search: debouncedSearch,
        page: currentPage,
        limit: pageSize,
      });

      if (res && res.success && res.data) {
        const raw = res.data.bookings || [];
        setBookings(raw);
        setTotalCount(res.data.total ?? raw.length);
        setTotalPages(
          res.data.pages ??
            Math.max(1, Math.ceil((res.data.total || 1) / pageSize))
        );
      } else {
        setBookings([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setError(err?.message || "Could not load bookings from server.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, currentPage, pageSize]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Update Booking Status directly (e.g. Confirm / Cancel)
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setStatusUpdating(true);
    try {
      await adminService.updateBookingStatus(bookingId, newStatus);
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(`Status update failed: ${err?.message || "Error saving status"}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusBadge = (status = "") => {
    switch (status.toLowerCase()) {
      case "active":
      case "confirmed":
        return "bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20";
      case "completed":
        return "bg-[#EFF6FF] text-[#0066FF] border border-[#0066FF]/20";
      case "pending":
        return "bg-[#FFFBEB] text-[#F59E0B] border border-[#F59E0B]/20";
      case "cancelled":
        return "bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-10 select-none">
      {/* Top Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
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
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm whitespace-nowrap ${
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

        {/* Search Input + Refresh Button */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search reference, customer, vehicle..."
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
            onClick={fetchBookings}
            title="Refresh bookings"
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Bookings Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold tracking-wider text-gray-400 uppercase select-none">
                <th className="py-4 px-6 font-semibold">BOOKING</th>
                <th className="py-4 px-6 font-semibold">CUSTOMER</th>
                <th className="py-4 px-6 font-semibold">VEHICLE</th>
                <th className="py-4 px-6 font-semibold">DATES</th>
                <th className="py-4 px-6 font-semibold text-center">STATUS</th>
                <th className="py-4 px-6 font-semibold text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
                      <p className="text-xs font-medium">Loading live bookings...</p>
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
                        onClick={fetchBookings}
                        className="mt-2 text-xs text-[#0066FF] underline font-semibold"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => {
                  const refCode = booking.referenceCode || booking._id?.slice(-8).toUpperCase() || "BK";
                  const guestName = booking.guest
                    ? `${booking.guest.firstName || ""} ${booking.guest.lastName || ""}`.trim() ||
                      booking.guest.email ||
                      "Guest User"
                    : "Guest User";
                  const v = booking.vehicle || {};
                  const vehicleName = `${v.year || ""} ${v.make || ""} ${v.model || ""}`.trim() || "Vehicle";
                  const pickupDate = formatDate(booking.pickup?.dateTime);
                  const dropoffDate = formatDate(booking.dropoff?.dateTime);
                  const datesString = `${pickupDate} – ${dropoffDate}`;
                  const amount = formatCurrency(booking.pricing?.totalAmount);

                  return (
                    <tr
                      key={booking._id}
                      onClick={() => setSelectedBooking(booking)}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-gray-800 whitespace-nowrap">
                        {refCode}
                      </td>

                      <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                        {guestName}
                      </td>

                      <td className="py-4 px-6 text-gray-700 whitespace-nowrap font-medium">
                        {vehicleName}
                      </td>

                      <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                        {datesString}
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold leading-tight capitalize ${getStatusBadge(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-gray-900 text-right whitespace-nowrap">
                        {amount}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                    No bookings found matching "{activeTab}" filter.
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
            Showing {bookings.length} of {totalCount} total bookings
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
          BOOKING DETAILS INSPECTOR MODAL
          ========================================================================= */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  BOOKING RESERVATION
                </p>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight mt-0.5 font-mono">
                  {selectedBooking.referenceCode || selectedBooking._id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Vehicle & Customer Info */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">
                    Vehicle
                  </p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {selectedBooking.vehicle?.year} {selectedBooking.vehicle?.make}{" "}
                    {selectedBooking.vehicle?.model}
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                    {selectedBooking.vehicle?.licensePlate || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">
                    Customer
                  </p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {selectedBooking.guest?.firstName}{" "}
                    {selectedBooking.guest?.lastName}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {selectedBooking.guest?.email}
                  </p>
                </div>
              </div>

              {/* Trip Dates & Itinerary */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Pickup</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(selectedBooking.pickup?.dateTime)} (
                    {selectedBooking.pickup?.location || "N/A"})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Dropoff</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(selectedBooking.dropoff?.dateTime)} (
                    {selectedBooking.dropoff?.location || "N/A"})
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                  <span className="text-gray-500">Trip Type</span>
                  <span className="font-bold text-gray-900 capitalize">
                    {selectedBooking.tripType || "Daily"}
                  </span>
                </div>
              </div>

              {/* Financial Pricing Breakdown */}
              <div className="bg-[#12141F] rounded-2xl p-4 text-white">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                  Pricing Breakdown
                </p>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedBooking.pricing?.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Taxes & Fees</span>
                    <span>{formatCurrency(selectedBooking.pricing?.taxesAndFees)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-white/10">
                    <span>Total Amount</span>
                    <span>{formatCurrency(selectedBooking.pricing?.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Actions & Status Updates */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {selectedBooking.status === "pending" && (
                    <button
                      type="button"
                      disabled={statusUpdating}
                      onClick={() => handleUpdateStatus(selectedBooking._id, "active")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      Confirm Booking
                    </button>
                  )}
                  {selectedBooking.status !== "cancelled" && (
                    <button
                      type="button"
                      disabled={statusUpdating}
                      onClick={() => handleUpdateStatus(selectedBooking._id, "cancelled")}
                      className="bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-5 py-2 rounded-xl transition-colors"
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
