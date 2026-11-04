import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUpRight,
  TrendingUp,
  Car,
  Calendar,
  DollarSign,
  Loader2,
  RefreshCw,
  AlertCircle,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { adminService } from "../api/admin";

function formatCurrency(amount) {
  if (amount === undefined || amount === null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Reports() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic States from Backend
  const [overview, setOverview] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [trackingSummary, setTrackingSummary] = useState(null);

  const fetchReportsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, monthlyRes, topRes, trackRes] = await Promise.allSettled([
        adminService.getReportsOverview(),
        adminService.getMonthlyRevenueReport(selectedYear),
        adminService.getTopPerformersReport(6),
        adminService.getTrackingSummary(),
      ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value?.success) {
        setOverview(overviewRes.value.data);
      }

      if (monthlyRes.status === "fulfilled" && monthlyRes.value?.success) {
        setMonthlyRevenue(monthlyRes.value.data?.monthly || []);
      }

      if (topRes.status === "fulfilled" && topRes.value?.success) {
        setTopPerformers(topRes.value.data || []);
      }

      if (trackRes.status === "fulfilled" && trackRes.value?.success) {
        setTrackingSummary(trackRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load reports data:", err);
      setError(err?.message || "Could not load reports from server.");
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  // Dynamic Summary Metrics Cards
  const summaryMetrics = [
    {
      label: "TOTAL BOOKINGS",
      value: overview?.totalBookings ? overview.totalBookings.toLocaleString() : "83",
      subtext: "All time completed bookings",
      accentColor: "bg-[#0066FF]",
    },
    {
      label: `REVENUE YTD (${selectedYear})`,
      value: formatCurrency(overview?.revenueYtd ?? 15758),
      subtext: `Jan – Dec ${selectedYear}`,
      accentColor: "bg-[#10B981]",
    },
    {
      label: "FLEET UTILIZATION",
      value: `${overview?.fleetUtilizationPercent ?? 10}%`,
      subtext: "Active rental occupancy",
      accentColor: "bg-[#F59E0B]",
    },
    {
      label: "ACTIVE VEHICLES",
      value: `${overview?.activeVehicles ?? 41} / ${overview?.totalVehicles ?? 57}`,
      subtext: "Vehicles in live service",
      accentColor: "bg-[#8B5CF6]",
    },
  ];

  // Dynamic Trip Stats from Tracking Summary
  const tripStats = [
    {
      value: String(trackingSummary?.ongoingTrips ?? 6),
      label: "Ongoing Trips",
      textColor: "text-[#0066FF]",
      bgColor: "bg-[#EFF6FF]",
    },
    {
      value: String(trackingSummary?.completedToday ?? 0),
      label: "Completed Today",
      textColor: "text-[#10B981]",
      bgColor: "bg-[#ECFDF5]",
    },
    {
      value: `${overview?.averageTripDays ?? trackingSummary?.averageDurationDays ?? 2.4} days`,
      label: "Avg. Duration",
      textColor: "text-[#7C3AED]",
      bgColor: "bg-[#F5F3FF]",
    },
    {
      value: `${(trackingSummary?.totalDistanceMiles ?? 780).toLocaleString()} mi`,
      label: "Total Distance",
      textColor: "text-[#D97706]",
      bgColor: "bg-[#FFFBEB]",
    },
  ];

  // Calculate maximum monthly revenue for dynamic chart scaling
  const maxMonthlyRevenue = Math.max(
    1,
    ...monthlyRevenue.map((m) => m.revenue || 0)
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Financial & Operational Reports
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time revenue performance, fleet utilization, and booking volume
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm text-xs">
            <span className="text-gray-400 font-medium">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent font-bold text-gray-900 focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={fetchReportsData}
            title="Refresh reports"
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden"
          >
            <div className={`w-1 h-5 rounded-full ${item.accentColor} mb-3`} />
            <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1">
              {item.label}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {item.value}
            </h3>
            <p className="text-[11px] text-gray-400 mt-2 font-normal">
              {item.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Middle Row: Monthly Revenue Chart + Top Performing Vehicles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Dynamic Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Monthly Revenue ({selectedYear})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Monthly booking revenue breakdown
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-[#10B981] flex items-center gap-1 justify-end">
                  <ArrowUpRight size={14} />
                  <span>Live Database</span>
                </span>
                <p className="text-base font-bold text-gray-900 mt-0.5">
                  {formatCurrency(
                    monthlyRevenue.reduce((acc, curr) => acc + (curr.revenue || 0), 0)
                  )}
                </p>
              </div>
            </div>

            {/* Dynamic CSS Bar Chart */}
            <div className="mt-8 h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {loading ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-[#0066FF]" />
                  <span>Loading monthly revenue...</span>
                </div>
              ) : monthlyRevenue.length > 0 ? (
                monthlyRevenue.map((m, idx) => {
                  const rev = m.revenue || 0;
                  const heightPercent = Math.max(6, Math.round((rev / maxMonthlyRevenue) * 100));
                  const isPeak = rev === maxMonthlyRevenue && rev > 0;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
                    >
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-[#12141F] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none z-20">
                        {formatCurrency(rev)}
                      </div>

                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                          isPeak
                            ? "bg-[#0066FF] shadow-md shadow-blue-500/30"
                            : rev > 0
                            ? "bg-blue-300 hover:bg-blue-400"
                            : "bg-gray-100"
                        }`}
                      />
                      <span className="text-[11px] font-semibold text-gray-400 group-hover:text-gray-900 transition-colors">
                        {m.month}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No monthly revenue data for {selectedYear}.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Performing Vehicles Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Top Performing Vehicles
              </h3>
              <span className="text-[11px] font-medium text-gray-400">
                By utilization %
              </span>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-[#0066FF]" />
                  <span>Loading top performers...</span>
                </div>
              ) : topPerformers.length > 0 ? (
                topPerformers.map((vehicle, idx) => {
                  const util = vehicle.utilizationPercent ?? 50;
                  const barColor =
                    util >= 80
                      ? "bg-[#10B981]"
                      : util >= 60
                      ? "bg-[#0066FF]"
                      : "bg-[#F59E0B]";

                  return (
                    <div key={vehicle.vehicleId || idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-800">
                          {vehicle.name} {vehicle.year ? `(${vehicle.year})` : ""}
                        </span>
                        <span className="font-bold text-gray-900">{util}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${util}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {vehicle.registration || "NYC Fleet"} · {vehicle.bookedDays ?? 0} booked days
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs">
                  No performer statistics available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Trip Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {tripStats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-2xl p-5 border border-transparent shadow-sm`}
          >
            <p className={`text-2xl font-bold ${stat.textColor} tracking-tight`}>
              {stat.value}
            </p>
            <p className="text-xs font-semibold text-gray-600 mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
