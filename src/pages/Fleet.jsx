import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  AlertCircle,
  Eye,
  X,
  Loader2,
  User,
} from "lucide-react";
import { adminService } from "../api/admin";

export default function Fleet() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("fleet"); // "fleet" | "pending"
  const [vehicles, setVehicles] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState(null);
  const [reviewModalVehicle, setReviewModalVehicle] = useState(null);
  const [reviewAction, setReviewAction] = useState("approved"); // "approved" | "rejected"
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchFleet = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getFleet({
        status: activeFilter,
        page: currentPage,
        limit: pageSize,
      });

      if (res?.data) {
        setVehicles(res.data.vehicles || []);
        setTotalPages(res.data.pages || 1);
        setTotalRecords(res.data.total || 0);
      }
    } catch (err) {
      setError(err.message || "Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingVehicles = useCallback(async () => {
    setPendingLoading(true);
    setPendingError(null);
    try {
      const res = await adminService.getPendingVehicles();
      if (res && res.success) {
        setPendingVehicles(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load pending vehicles:", err);
      setPendingError(
        err?.message || "Failed to load pending vehicle reviews.",
      );
    } finally {
      setPendingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "fleet") {
      fetchFleet();
    } else {
      fetchPendingVehicles();
    }
  }, [activeTab, activeFilter, currentPage, pageSize, fetchPendingVehicles]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModalVehicle) return;
    setReviewSubmitting(true);
    try {
      await adminService.reviewVehicle(
        reviewModalVehicle._id,
        reviewAction,
        rejectionReason.trim(),
      );
      setReviewModalVehicle(null);
      setRejectionReason("");
      fetchPendingVehicles();
      fetchFleet();
    } catch (err) {
      alert(`Review action failed: ${err?.message}`);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDelete = async (vehicle) => {
    const vehicleName =
      `${vehicle.year || ""} ${vehicle.make || ""} ${vehicle.model || ""}`.trim();
    if (
      !window.confirm(
        `Are you sure you want to delete ${vehicleName || "this vehicle"}?`,
      )
    ) {
      return;
    }
    try {
      await adminService.deleteFleetVehicle(vehicle._id);
      fetchFleet();
    } catch (err) {
      alert(`Could not delete: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || "available").toLowerCase();
    if (s === "available") {
      return {
        label: "Available",
        className: "bg-[#E6F8EF] text-[#10B981]",
      };
    }
    if (s === "rented") {
      return {
        label: "Rented",
        className: "bg-[#EFF6FF] text-[#0066FF]",
      };
    }
    if (s === "maintenance") {
      return {
        label: "Maintenance",
        className: "bg-[#FEF3C7] text-[#D97706]",
      };
    }
    return {
      label: status,
      className: "bg-gray-100 text-gray-600",
    };
  };

  const formatMileage = (odometer) => {
    if (!odometer && odometer !== 0) return "--";
    return `${Number(odometer).toLocaleString()} mi`;
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "--";
    return `$${Number(amount).toFixed(0)}`;
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "available", label: "Available" },
    { id: "rented", label: "Rented" },
    { id: "maintenance", label: "Maintenance" },
  ];

  return (
    <div className="space-y-5 max-w-full font-sans select-none pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("fleet")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "fleet"
                ? "bg-[#0066FF] text-white shadow-sm shadow-blue-500/20"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Car size={15} />
            <span>Active Fleet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-[#0066FF] text-white shadow-sm shadow-blue-500/20"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Clock size={15} />
            <span>Host Submissions</span>
            {pendingVehicles.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {pendingVehicles.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (activeTab === "fleet") fetchFleet();
              else fetchPendingVehicles();
            }}
            className="border border-gray-200/80 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition"
            title="Refresh list"
          >
            <RefreshCw
              size={13}
              className={
                (activeTab === "fleet" && loading) ||
                (activeTab === "pending" && pendingLoading)
                  ? "animate-spin"
                  : ""
              }
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {activeTab === "fleet" && (
            <Link
              to="/fleet/new"
              className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>Add Vehicle</span>
            </Link>
          )}
        </div>
      </div>

      {activeTab === "fleet" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveFilter(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-2xs ${
                    active
                      ? "bg-[#0066FF] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/80"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      VEHICLE
                    </th>
                    <th className="py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      REG. NO.
                    </th>
                    <th className="py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      FUEL
                    </th>
                    <th className="py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      MILEAGE
                    </th>
                    <th className="py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      DAILY / HOURLY
                    </th>
                    <th className="py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="py-4 px-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {loading && vehicles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-16 text-center text-gray-400"
                      >
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#0066FF] mb-2" />
                        <span>Loading vehicles...</span>
                      </td>
                    </tr>
                  ) : vehicles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-16 text-center text-gray-400"
                      >
                        No vehicles found in this category.
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((v) => {
                      const badge = getStatusBadge(v.operationalStatus);
                      const primaryPhoto =
                        v.photos?.find((p) => p.isPrimary)?.url ||
                        v.photos?.[0]?.url ||
                        v.photoUrl ||
                        "https://placehold.co/100x60/png?text=Car";

                      return (
                        <tr
                          key={v._id}
                          onClick={() => navigate(`/fleet/${v._id}`)}
                          className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                        >
                          <td className="py-4 px-6 flex items-center gap-3 min-w-[200px]">
                            <img
                              src={primaryPhoto}
                              alt={`${v.make} ${v.model}`}
                              className="w-12 h-8 rounded-lg object-cover bg-gray-100 flex-shrink-0 border border-gray-100"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://placehold.co/100x60/png?text=Car";
                              }}
                            />
                            <div>
                              <p className="font-semibold text-gray-800 group-hover:text-[#0066FF] transition-colors">
                                {v.year} {v.make} {v.model}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {v.category || "Sedan"}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-mono font-medium text-gray-600 uppercase">
                            {v.licensePlate || "--"}
                          </td>
                          <td className="py-4 px-6 text-gray-600 capitalize">
                            {v.fuelType || "Gasoline"}
                          </td>
                          <td className="py-4 px-6 text-gray-600 font-medium">
                            {formatMileage(v.mileage)}
                          </td>
                          <td className="py-4 px-6 font-semibold text-gray-800">
                            {formatCurrency(
                              v.pricing?.dailyRate || v.dailyRate,
                            )}{" "}
                            /day
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-semibold leading-tight inline-block ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/fleet/${v._id}`);
                              }}
                              className="p-1 text-gray-400 hover:text-[#0066FF] transition-colors rounded hover:bg-blue-50"
                              title="Edit Vehicle"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(v);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-red-50"
                              title="Delete Vehicle"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100 text-xs text-gray-500">
                <span>
                  Showing {vehicles.length} of {totalRecords} records
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage <= 1 || loading}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="p-1 rounded border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="font-semibold text-gray-700 px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages || loading}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    className="p-1 rounded border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "pending" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Host Vehicle Approval Queue
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Vehicles submitted by registered hosts requiring compliance
                  verification before going live.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                {pendingVehicles.length} Awaiting Verification
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                      VEHICLE
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                      HOST OWNER
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                      VIN / REGISTRATION
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                      REQUESTED RATE
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                      SUBMITTED ON
                    </th>
                    <th className="py-3.5 px-6 font-semibold text-gray-400 uppercase tracking-wider text-[11px] text-right">
                      REVIEW ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-gray-400"
                      >
                        <Loader2 className="w-6 h-6 animate-spin text-[#0066FF] mx-auto mb-2" />
                        <p className="text-xs font-medium">
                          Loading pending vehicle approvals...
                        </p>
                      </td>
                    </tr>
                  ) : pendingError ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-rose-500"
                      >
                        <p className="text-xs font-medium">{pendingError}</p>
                        <button
                          onClick={fetchPendingVehicles}
                          className="mt-2 text-xs text-[#0066FF] underline font-semibold"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : pendingVehicles.length > 0 ? (
                    pendingVehicles.map((pv) => {
                      const hostName = pv.host
                        ? `${pv.host.firstName || ""} ${pv.host.lastName || ""}`.trim() ||
                          pv.host.email
                        : "Host Partner";
                      const primaryPhoto =
                        pv.photos?.find((p) => p.isPrimary)?.url ||
                        pv.photos?.[0]?.url ||
                        pv.photoUrl ||
                        "https://placehold.co/100x60/png?text=Car";

                      return (
                        <tr
                          key={pv._id}
                          className="hover:bg-gray-50/70 transition-colors"
                        >
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={primaryPhoto}
                                alt="Car"
                                className="w-14 h-9 rounded-lg object-cover bg-gray-100 border border-gray-100"
                              />
                              <div>
                                <p className="font-bold text-gray-900">
                                  {pv.year} {pv.make} {pv.model}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  {pv.category || "Sedan"} •{" "}
                                  {pv.transmission || "Automatic"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            <p className="font-semibold text-gray-900">
                              {hostName}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {pv.host?.email}
                            </p>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            <p className="font-mono text-gray-800 uppercase font-semibold">
                              {pv.licensePlate || "No Plate"}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              VIN:{" "}
                              {pv.vin
                                ? `${pv.vin.slice(0, 6)}...${pv.vin.slice(-4)}`
                                : "--"}
                            </p>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap font-bold text-gray-900">
                            {formatCurrency(
                              pv.pricing?.dailyRate || pv.dailyRate || 0,
                            )}{" "}
                            /day
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap text-gray-400 text-[11px]">
                            {pv.createdAt
                              ? new Date(pv.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "--"}
                          </td>

                          <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReviewModalVehicle(pv);
                                setReviewAction("approved");
                                setRejectionReason("");
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
                            >
                              <CheckCircle2 size={13} />
                              <span>Approve</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setReviewModalVehicle(pv);
                                setReviewAction("rejected");
                                setRejectionReason("");
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-sm"
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-gray-400"
                      >
                        <CheckCircle2
                          size={24}
                          className="mx-auto text-emerald-500 mb-2"
                        />
                        <p className="text-sm font-semibold text-gray-800">
                          Queue is clean!
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          There are currently no host vehicles pending approval.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reviewModalVehicle && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                {reviewAction === "approved" ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>Approve Host Vehicle</span>
                  </>
                ) : (
                  <>
                    <XCircle size={18} className="text-rose-600" />
                    <span>Reject Host Vehicle</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalVehicle(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 flex items-center gap-3">
                <img
                  src={
                    reviewModalVehicle.photos?.[0]?.url ||
                    reviewModalVehicle.photoUrl ||
                    "https://placehold.co/100x60/png?text=Car"
                  }
                  alt="Car"
                  className="w-16 h-11 rounded-lg object-cover border border-gray-200"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {reviewModalVehicle.year} {reviewModalVehicle.make}{" "}
                    {reviewModalVehicle.model}
                  </p>
                  <p className="text-xs text-gray-500">
                    Host: {reviewModalVehicle.host?.firstName}{" "}
                    {reviewModalVehicle.host?.lastName}
                  </p>
                </div>
              </div>

              {reviewAction === "approved" ? (
                <p className="text-xs text-gray-600 leading-relaxed">
                  Approving this vehicle will publish it to the active fleet.
                  The host will receive an instant notification that their car
                  is ready for customer reservations.
                </p>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                    Rejection Reason (will be sent to host) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Unclear registration photos, mileage exceeds allowable threshold, or cosmetic damage."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none leading-relaxed"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReviewModalVehicle(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
                    reviewAction === "approved"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {reviewSubmitting && (
                    <Loader2 size={13} className="animate-spin" />
                  )}
                  <span>
                    {reviewAction === "approved"
                      ? "Confirm Approval"
                      : "Confirm Rejection"}
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
