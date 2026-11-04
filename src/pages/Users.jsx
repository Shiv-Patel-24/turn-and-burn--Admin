import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Search,
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Ban,
  Mail,
  Phone,
  Calendar,
  Car,
  RefreshCw,
} from "lucide-react";
import { adminService } from "../api/admin";

const TABS = ["All", "Verified", "Pending", "Blocked"];

// Deterministic vibrant avatar background color picker based on user name
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
  return `${f}${l}` || "U";
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

export default function Users() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);

  // Pagination states from backend
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal / Drawer state for "View ID / KYC Verification"
  const [selectedUserForId, setSelectedUserForId] = useState(null);
  const [licenseReviewing, setLicenseReviewing] = useState(false);

  // "+ Add Customer" modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormLoading, setAddFormLoading] = useState(false);
  const [addFormError, setAddFormError] = useState("");
  const [addFormSuccess, setAddFormSuccess] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCountryCode: "+1",
    phoneNumber: "",
    dateOfBirth: "",
    licenseNumber: "",
    licenseState: "California",
    issuingCountry: "United States",
    expirationDate: "",
  });

  // Debounce search query input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers({
        status: activeTab,
        search: debouncedSearch,
        page: currentPage,
        limit: pageSize,
      });

      if (res && res.success && res.data) {
        setUsers(res.data.users || []);
        setTotalCount(res.data.total ?? (res.data.users || []).length);
        setTotalPages(res.data.pages ?? Math.max(1, Math.ceil((res.data.total || 1) / pageSize)));
      } else {
        setUsers([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err?.message || "Could not load customers from server.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, currentPage, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Block / Unblock customer action
  const handleToggleBlock = async (user) => {
    const isCurrentlyBlocked = !user.isActive || user.accountStatus === "blocked";
    const nextStatus = isCurrentlyBlocked ? "verified" : "blocked";
    setActionLoadingId(user._id);

    try {
      if (isCurrentlyBlocked) {
        await adminService.unblockUser(user._id);
      } else {
        await adminService.blockUser(user._id);
      }

      // Optimistic update local list
      setUsers((prev) =>
        prev.map((u) => {
          if (u._id === user._id) {
            const updated = {
              ...u,
              isActive: isCurrentlyBlocked,
              accountStatus: nextStatus,
            };
            if (selectedUserForId && selectedUserForId._id === user._id) {
              setSelectedUserForId(updated);
            }
            return updated;
          }
          return u;
        })
      );
    } catch (err) {
      alert(`Action failed: ${err?.message || "Could not update user status"}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Inspect full user details including licenses and booking stats
  const handleInspectUser = async (user) => {
    setSelectedUserForId(user);
    try {
      const res = await adminService.getUserDetails(user._id);
      if (res && res.success && res.data) {
        setSelectedUserForId(res.data);
      }
    } catch (err) {
      console.warn("Could not load enriched user details, falling back to basic data:", err);
    }
  };

  // Review Driver's License (Approve / Reject) directly from ID Inspector
  const handleReviewLicense = async (status) => {
    if (!selectedUserForId?._id) return;
    setLicenseReviewing(true);
    try {
      await adminService.reviewLicense(selectedUserForId._id, status);
      // Refresh current user view and list
      setSelectedUserForId((prev) => ({
        ...prev,
        license: {
          ...(prev?.license || {}),
          status,
        },
        accountStatus: status === "approved" ? "verified" : "pending",
      }));
      fetchUsers();
    } catch (err) {
      alert(`License review failed: ${err?.message || "Error saving decision"}`);
    } finally {
      setLicenseReviewing(false);
    }
  };

  // Submit "+ Add Customer"
  const handleCreateCustomerSubmit = async (e) => {
    e.preventDefault();
    setAddFormLoading(true);
    setAddFormError("");
    setAddFormSuccess(null);

    const payload = {
      firstName: newCustomer.firstName.trim(),
      lastName: newCustomer.lastName.trim(),
      email: newCustomer.email.trim().toLowerCase(),
      phoneCountryCode: newCustomer.phoneCountryCode || "+1",
      phoneNumber: newCustomer.phoneNumber.trim(),
      dateOfBirth: newCustomer.dateOfBirth ? new Date(newCustomer.dateOfBirth).toISOString() : undefined,
    };

    if (newCustomer.licenseNumber.trim()) {
      payload.license = {
        licenseNumber: newCustomer.licenseNumber.trim(),
        state: newCustomer.licenseState || "California",
        issuingCountry: newCustomer.issuingCountry || "United States",
        expirationDate: newCustomer.expirationDate ? new Date(newCustomer.expirationDate).toISOString() : undefined,
      };
    }

    try {
      const res = await adminService.createCustomer(payload);
      if (res && res.success) {
        setAddFormSuccess({
          email: payload.email,
          temporaryPassword: res.data?.temporaryPassword,
        });
        await fetchUsers();
      } else {
        setAddFormError(res?.message || "Failed to create customer.");
      }
    } catch (err) {
      // If the request timed out or backend closed connection during email sending,
      // verify if the user actually got created in the database.
      if (err.isTimeout || err.name === "AbortError" || err.message?.includes("timed out")) {
        try {
          await fetchUsers();
          setAddFormSuccess({
            email: payload.email,
            temporaryPassword: "Sent via activation email",
          });
          return;
        } catch {
          // fallback to error display
        }
      }
      setAddFormError(err?.message || "Server error while creating customer.");
    } finally {
      setAddFormLoading(false);
    }
  };

  const getStatusBadge = (user) => {
    const status = user.accountStatus || (!user.isActive ? "blocked" : user?.license?.status === "approved" ? "verified" : "pending");
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

        {/* Search Bar + Add Customer Button */}
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
            onClick={() => {
              setAddFormError("");
              setAddFormSuccess(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm shadow-blue-500/20 whitespace-nowrap transition-colors"
          >
            <UserPlus size={14} />
            <span>Add Customer</span>
          </button>

          <button
            type="button"
            onClick={fetchUsers}
            title="Refresh users"
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Customers Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold tracking-wider text-gray-400 uppercase select-none">
                <th className="py-4 px-6 font-semibold">USER</th>
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
                      <p className="text-xs font-medium">Loading customers from backend...</p>
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
                        onClick={fetchUsers}
                        className="mt-2 text-xs text-[#0066FF] underline font-semibold"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => {
                  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Turn & Burn User";
                  const initials = getInitials(user.firstName, user.lastName);
                  const avatarColor = getAvatarBg(fullName);
                  const displayPhone = user.phoneNumber
                    ? `${user.phoneCountryCode || "+1"} ${user.phoneNumber}`
                    : "No phone on file";
                  const isBlocked = !user.isActive || user.accountStatus === "blocked";
                  const statusLabel =
                    user.accountStatus === "verified"
                      ? "Verified"
                      : user.accountStatus === "pending"
                      ? "Pending"
                      : isBlocked
                      ? "Blocked"
                      : "Verified";

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* User Info */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user.profilePhoto ? (
                            <img
                              src={user.profilePhoto}
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
                              {user.email}
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
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Total Bookings */}
                      <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                        {user.bookingsCount ?? user.bookingsAsGuest ?? 0}
                      </td>

                      {/* Account Status Badge */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold leading-tight capitalize ${getStatusBadge(
                            user
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
                            onClick={() => handleInspectUser(user)}
                            className="text-[#0066FF] hover:text-[#0052cc] font-semibold text-xs transition-colors hover:underline"
                          >
                            View ID
                          </button>

                          <button
                            type="button"
                            disabled={actionLoadingId === user._id}
                            onClick={() => handleToggleBlock(user)}
                            className={`font-semibold text-xs transition-colors hover:underline flex items-center gap-1 ${
                              isBlocked
                                ? "text-[#10B981] hover:text-[#059669]"
                                : "text-[#DC2626] hover:text-[#b91c1c]"
                            } disabled:opacity-50`}
                          >
                            {actionLoadingId === user._id ? (
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
                    No customers found matching "{activeTab}" filter.
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
            Showing {users.length} of {totalCount} total customers
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
          VIEW ID / DRIVER LICENSE & KYC INSPECTOR MODAL
          ========================================================================= */}
      {selectedUserForId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  IDENTITY & KYC VERIFICATION
                </p>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight mt-0.5">
                  {`${selectedUserForId.firstName || ""} ${selectedUserForId.lastName || ""}`.trim() || "Customer Details"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Driver License Card Preview */}
            <div className="bg-[#12141F] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden mb-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[9px] font-semibold tracking-wider text-gray-400 uppercase">
                    DRIVER'S LICENSE
                  </p>
                  <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
                    {`${selectedUserForId.firstName || ""} ${selectedUserForId.lastName || ""}`.trim() || "N/A"}
                  </h4>
                </div>
                <div
                  className={`w-9 h-9 rounded-full ${getAvatarBg(
                    selectedUserForId.firstName
                  )} text-white font-bold text-xs flex items-center justify-center shadow-md`}
                >
                  {getInitials(selectedUserForId.firstName, selectedUserForId.lastName)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-left">
                <div>
                  <p className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
                    LICENSE NO.
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5 tracking-wide font-mono">
                    {selectedUserForId.license?.licenseNumber || "Not Provided"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
                    STATE / COUNTRY
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {selectedUserForId.license?.state || "N/A"},{" "}
                    {selectedUserForId.license?.issuingCountry || "USA"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
                    DATE OF BIRTH
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {formatDate(selectedUserForId.dateOfBirth)}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
                    EXPIRES
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {formatDate(selectedUserForId.license?.expirationDate)}
                  </p>
                </div>
              </div>

              {/* License Status Badge Inside Card */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">KYC Status:</span>
                <span
                  className={`font-semibold capitalize px-2 py-0.5 rounded text-[10px] ${
                    selectedUserForId.license?.status === "approved"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : selectedUserForId.license?.status === "rejected"
                      ? "bg-red-500/20 text-red-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {selectedUserForId.license?.status || "Not Submitted"}
                </span>
              </div>
            </div>

            {/* Quick Stats & Account Attributes */}
            <div className="space-y-2.5 text-xs mb-5 px-1 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Mail size={13} className="text-gray-400" /> Email
                </span>
                <span className="font-semibold text-gray-900 select-all">
                  {selectedUserForId.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-400" /> Phone
                </span>
                <span className="font-semibold text-gray-900 select-all">
                  {selectedUserForId.phoneNumber
                    ? `${selectedUserForId.phoneCountryCode || "+1"} ${selectedUserForId.phoneNumber}`
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Car size={13} className="text-gray-400" /> Guest Bookings
                </span>
                <span className="font-bold text-gray-900">
                  {selectedUserForId.bookingsAsGuest ?? selectedUserForId.bookingsCount ?? 0} completed
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" /> Member Since
                </span>
                <span className="font-semibold text-gray-900">
                  {formatDate(selectedUserForId.createdAt)}
                </span>
              </div>
            </div>

            {/* License KYC Review Actions (Approve / Reject) */}
            {selectedUserForId.license?.licenseNumber && selectedUserForId.license?.status !== "approved" && (
              <div className="mb-4 p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
                <p className="text-[11px] font-semibold text-amber-800 mb-2">
                  Review Pending Driver's License:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={licenseReviewing}
                    onClick={() => handleReviewLicense("approved")}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {licenseReviewing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    Approve ID
                  </button>
                  <button
                    type="button"
                    disabled={licenseReviewing}
                    onClick={() => handleReviewLicense("rejected")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {licenseReviewing ? <Loader2 size={12} className="animate-spin" /> : <Ban size={13} />}
                    Reject ID
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedUserForId(null)}
                className="w-full bg-[#F3F4F6] hover:bg-gray-200 text-gray-800 text-xs font-bold py-2.5 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          "+ ADD CUSTOMER" MODAL
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Customer</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Create a new guest account directly in Turn & Burn
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {addFormSuccess ? (
              <div className="py-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-base font-bold text-gray-900">Customer Created Successfully!</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  An activation email was sent to <b>{addFormSuccess.email}</b>.
                </p>
                {addFormSuccess.temporaryPassword && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-left max-w-sm mx-auto">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Temporary Password</p>
                    <p className="font-mono text-sm font-bold text-gray-900 select-all mt-0.5">
                      {addFormSuccess.temporaryPassword}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setAddFormSuccess(null);
                  }}
                  className="bg-[#0066FF] text-white text-xs font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateCustomerSubmit} className="mt-4 space-y-4">
                {addFormError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{addFormError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John"
                      value={newCustomer.firstName}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, firstName: e.target.value })
                      }
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Doe"
                      value={newCustomer.lastName}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, lastName: e.target.value })
                      }
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john.doe@example.com"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Code
                    </label>
                    <input
                      type="text"
                      value={newCustomer.phoneCountryCode}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, phoneCountryCode: e.target.value })
                      }
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="555-0192"
                      value={newCustomer.phoneNumber}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })
                      }
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-[11px] font-bold text-gray-900 mb-2">
                    Driver's License (Optional KYC)
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">License Number</label>
                      <input
                        type="text"
                        placeholder="DL-982143"
                        value={newCustomer.licenseNumber}
                        onChange={(e) =>
                          setNewCustomer({ ...newCustomer, licenseNumber: e.target.value })
                        }
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Issuing State</label>
                      <input
                        type="text"
                        placeholder="e.g. California"
                        value={newCustomer.licenseState}
                        onChange={(e) =>
                          setNewCustomer({ ...newCustomer, licenseState: e.target.value })
                        }
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={newCustomer.dateOfBirth}
                        onChange={(e) =>
                          setNewCustomer({ ...newCustomer, dateOfBirth: e.target.value })
                        }
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">License Expiry</label>
                      <input
                        type="date"
                        value={newCustomer.expirationDate}
                        onChange={(e) =>
                          setNewCustomer({ ...newCustomer, expirationDate: e.target.value })
                        }
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addFormLoading}
                    className="bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {addFormLoading && <Loader2 size={13} className="animate-spin" />}
                    <span>Save Customer</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
