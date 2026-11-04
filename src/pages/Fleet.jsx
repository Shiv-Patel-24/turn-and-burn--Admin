import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { adminService } from "../api/admin";

export default function Fleet() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchFleet();
  }, [activeFilter, currentPage, pageSize]);

  const handleDelete = async (vehicle) => {
    const vehicleName = `${vehicle.year || ""} ${vehicle.make || ""} ${vehicle.model || ""}`.trim();
    if (!window.confirm(`Are you sure you want to delete ${vehicleName || "this vehicle"}?`)) {
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

  // Helper to render pagination page numbers: 1, 2, 3, 4, ...
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      const isActive = p === currentPage;
      buttons.push(
        <button
          key={p}
          onClick={() => setCurrentPage(p)}
          className={`w-7 h-7 flex items-center justify-center text-xs font-medium rounded transition-colors ${
            isActive
              ? "bg-[#0066FF] text-white font-semibold"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {p}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="space-y-4 max-w-full font-sans">
      {/* Top Filter Buttons & Add Vehicle CTA */}
      <div className="flex items-center justify-between">
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

        <Link
          to="/fleet/new"
          className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus size={14} className="stroke-[2.5]" />
          <span>Add Vehicle</span>
        </Link>
      </div>

      {/* Main Table Card Container matching Figma */}
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
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#0066FF] mb-2" />
                    <span>Loading vehicles...</span>
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    No vehicles found in this category.
                  </td>
                </tr>
              ) : (
                vehicles.map((v, idx) => {
                  const vehicleName = `${v.year || ""} ${v.make || ""} ${v.model || ""}`.trim();
                  // V-001 subcode matching Figma design
                  const subId = `V-${String((currentPage - 1) * pageSize + idx + 1).padStart(3, "0")}`;
                  const regNo = v.licensePlate || "NYC-0000";
                  const fuel = v.fuelType || "Gasoline";
                  const mileage = formatMileage(v.odometer || 12000);
                  const dailyRate = formatCurrency(v.pricing?.dailyRate || 95);
                  const hourlyRate = v.pricing?.hourlyRate
                    ? `$${Number(v.pricing.hourlyRate).toFixed(0)}/hr`
                    : "$15/hr";
                  const statusInfo = getStatusBadge(v.operationalStatus);

                  return (
                    <tr
                      key={v._id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* VEHICLE Column */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <Link
                          to={`/fleet/${v._id}`}
                          className="font-bold text-gray-900 hover:text-[#0066FF] transition-colors block text-xs"
                        >
                          {vehicleName || "Vehicle"}
                        </Link>
                        <span className="text-[11px] text-gray-400 font-normal">
                          {subId}
                        </span>
                      </td>

                      {/* REG. NO. Column */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-gray-500 font-medium text-xs tracking-tight">
                          {regNo}
                        </span>
                      </td>

                      {/* FUEL Column */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-gray-500 font-medium text-xs">
                          {fuel}
                        </span>
                      </td>

                      {/* MILEAGE Column */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-gray-500 font-medium text-xs">
                          {mileage}
                        </span>
                      </td>

                      {/* DAILY / HOURLY Column */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-xs leading-none">
                            {dailyRate}
                            <span className="text-gray-400 font-normal text-[11px]">
                              /day
                            </span>
                          </span>
                          <span className="text-[11px] text-gray-400 mt-1 font-normal">
                            {hourlyRate}
                          </span>
                        </div>
                      </td>

                      {/* STATUS Column */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* ACTIONS Column */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3 text-gray-400">
                          <Link
                            to={`/fleet/${v._id}`}
                            className="hover:text-gray-700 transition-colors p-1"
                            title="Edit Vehicle"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(v)}
                            className="hover:text-rose-600 transition-colors p-1"
                            title="Delete Vehicle"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Toolbar matching Figma */}
        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-400 text-xs">/Page</span>
          </div>

          {/* Page Navigators */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>

            {renderPaginationButtons()}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
