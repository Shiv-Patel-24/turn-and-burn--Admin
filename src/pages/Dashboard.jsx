import React, { useEffect, useState } from "react";
import {
  Calendar,
  Car,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminService } from "../api/admin";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState([
    {
      label: "Total Bookings",
      value: "...",
      change: "--",
      isPositive: true,
      icon: Calendar,
      iconColor: "text-[#0066FF]",
      iconBg: "bg-[#EFF6FF]",
    },
    {
      label: "Active Vehicles",
      value: "...",
      change: "--",
      isPositive: true,
      icon: Car,
      iconColor: "text-[#0066FF]",
      iconBg: "bg-[#EFF6FF]",
    },
    {
      label: "Revenue (MTD)",
      value: "...",
      change: "--",
      isPositive: true,
      icon: DollarSign,
      iconColor: "text-[#0066FF]",
      iconBg: "bg-[#EFF6FF]",
    },
    {
      label: "Active Users",
      value: "...",
      change: "--",
      isPositive: true,
      icon: Users,
      iconColor: "text-[#0066FF]",
      iconBg: "bg-[#EFF6FF]",
    },
  ]);

  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyGrowth, setWeeklyGrowth] = useState(null);
  const [fleetStats, setFleetStats] = useState({
    total: 0,
    items: [],
  });
  const [recentBookings, setRecentBookings] = useState([]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDateRange = (pickupDate, dropoffDate) => {
    if (!pickupDate) return "N/A";
    const start = new Date(pickupDate);
    const end = dropoffDate ? new Date(dropoffDate) : null;
    const startStr = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (!end) return startStr;
    const endStr = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${startStr} – ${endStr}`;
  };

  const getStatusBadgeStyle = (status) => {
    switch (String(status).toLowerCase()) {
      case "active":
      case "confirmed":
      case "approved":
        return "bg-emerald-50 text-emerald-600";
      case "completed":
        return "bg-blue-50 text-blue-600";
      case "pending":
        return "bg-amber-50 text-amber-600";
      case "cancelled":
      case "rejected":
        return "bg-rose-50 text-rose-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, weeklyRes, fleetRes, bookingsRes] =
        await Promise.allSettled([
          adminService.getDashboardStats(),
          adminService.getWeeklyBookings(),
          adminService.getFleetStatusCounts(),
          adminService.getRecentBookings(5),
        ]);

      // 1. Process Stats
      if (statsRes.status === "fulfilled" && statsRes.value?.data) {
        const d = statsRes.value.data;
        const trends = d.trends || {};

        const bookingsDelta =
          trends.bookingsPercent !== null && trends.bookingsPercent !== undefined
            ? `${trends.bookingsPercent >= 0 ? "+" : ""}${trends.bookingsPercent}% vs last month`
            : "Live data";

        const vehiclesDelta =
          trends.vehiclesDelta !== undefined
            ? `${trends.vehiclesDelta >= 0 ? "+" : ""}${trends.vehiclesDelta} vs last month`
            : "Live data";

        const revDelta =
          trends.revenuePercent !== null && trends.revenuePercent !== undefined
            ? `${trends.revenuePercent >= 0 ? "+" : ""}${trends.revenuePercent}% vs last month`
            : "Live data";

        const usersDelta =
          trends.usersDelta !== undefined
            ? `${trends.usersDelta >= 0 ? "+" : ""}${trends.usersDelta} vs last month`
            : "Live data";

        setMetrics([
          {
            label: "Total Bookings",
            value: Number(d.totalBookings || 0).toLocaleString(),
            change: bookingsDelta,
            isPositive: (trends.bookingsPercent ?? 0) >= 0,
            icon: Calendar,
            iconColor: "text-[#0066FF]",
            iconBg: "bg-[#EFF6FF]",
          },
          {
            label: "Active Vehicles",
            value: Number(d.activeVehicles || 0).toLocaleString(),
            change: vehiclesDelta,
            isPositive: (trends.vehiclesDelta ?? 0) >= 0,
            icon: Car,
            iconColor: "text-[#0066FF]",
            iconBg: "bg-[#EFF6FF]",
          },
          {
            label: "Revenue (MTD)",
            value: formatCurrency(d.revenueMtd || 0),
            change: revDelta,
            isPositive: (trends.revenuePercent ?? 0) >= 0,
            icon: DollarSign,
            iconColor: "text-[#0066FF]",
            iconBg: "bg-[#EFF6FF]",
          },
          {
            label: "Active Users",
            value: Number(d.activeUsers || 0).toLocaleString(),
            change: usersDelta,
            isPositive: (trends.usersDelta ?? 0) >= 0,
            icon: Users,
            iconColor: "text-[#0066FF]",
            iconBg: "bg-[#EFF6FF]",
          },
        ]);
      }

      // 2. Process Weekly Bookings
      if (weeklyRes.status === "fulfilled" && Array.isArray(weeklyRes.value?.data)) {
        const rawDays = weeklyRes.value.data;
        const maxCount = Math.max(...rawDays.map((d) => d.count || 0), 1);
        const mapped = rawDays.map((item, idx) => {
          const count = item.count || 0;
          const pct = Math.max(12, Math.round((count / maxCount) * 90));
          return {
            day: item.day,
            count: count,
            height: `${pct}%`,
            active: idx === rawDays.length - 1,
          };
        });
        setWeeklyData(mapped);

        const totalThisWeek = rawDays.reduce((acc, cur) => acc + (cur.count || 0), 0);
        setWeeklyGrowth(`${totalThisWeek} bookings this week`);
      }

      // 3. Process Fleet Counts
      if (fleetRes.status === "fulfilled" && fleetRes.value?.data) {
        const fc = fleetRes.value.data;
        const total = fc.total || fc.available + fc.rented + fc.maintenance || 1;
        const availablePct = Math.round(((fc.available || 0) / total) * 100);
        const rentedPct = Math.round(((fc.rented || 0) / total) * 100);
        const maintPct = Math.round(((fc.maintenance || 0) / total) * 100);

        setFleetStats({
          total: fc.total || 0,
          items: [
            {
              label: "Available",
              count: fc.available || 0,
              color: "bg-[#10B981]",
              width: `${availablePct}%`,
            },
            {
              label: "Rented",
              count: fc.rented || 0,
              color: "bg-[#0066FF]",
              width: `${rentedPct}%`,
            },
            {
              label: "Maintenance",
              count: fc.maintenance || 0,
              color: "bg-[#F59E0B]",
              width: `${maintPct}%`,
            },
          ],
        });
      }

      // 4. Process Recent Bookings
      if (bookingsRes.status === "fulfilled" && bookingsRes.value?.data?.bookings) {
        const list = bookingsRes.value.data.bookings.map((b) => {
          const guestName =
            b.guest?.firstName && b.guest?.lastName
              ? `${b.guest.firstName} ${b.guest.lastName}`
              : b.primaryDriver?.name || "Customer";

          const vehicleName = b.vehicle
            ? `${b.vehicle.year || ""} ${b.vehicle.make || ""} ${b.vehicle.model || ""}`.trim()
            : "Vehicle";

          const amountVal =
            b.pricing?.totalAmount !== undefined && b.pricing?.totalAmount !== null
              ? `$${Number(b.pricing.totalAmount).toFixed(0)}`
              : b.totalAmount !== null && b.totalAmount !== undefined
              ? `$${Number(b.totalAmount).toFixed(0)}`
              : "--";

          return {
            id: b.referenceCode || b._id?.slice(-6).toUpperCase() || "BK-N/A",
            customer: guestName,
            vehicle: vehicleName,
            period: formatDateRange(b.pickup?.dateTime, b.dropoff?.dateTime),
            status: b.status
              ? b.status.charAt(0).toUpperCase() + b.status.slice(1)
              : "Pending",
            statusColor: getStatusBadgeStyle(b.status),
            amount: amountVal,
          };
        });
        setRecentBookings(list);
      }

      const allFailed = [statsRes, weeklyRes, fleetRes, bookingsRes].every(
        (r) => r.status === "rejected"
      );
      if (allFailed) {
        setError(
          "Could not authenticate with backend. Please log in as an administrator."
        );
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header controls with refresh & status indication */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            System Overview
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time operations synchronized with Turn & Burn backend
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors shadow-sm"
          >
            <RefreshCw
              size={13}
              className={`${loading ? "animate-spin text-blue-600" : ""}`}
            />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Link
            to="/signin"
            className="text-amber-900 font-semibold underline hover:no-underline shrink-0"
          >
            Sign in as Admin
          </Link>
        </div>
      )}

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-sm flex items-start justify-between"
            >
              <div>
                <p className="text-xs font-normal text-gray-500 mb-2">
                  {item.label}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {item.value}
                </h3>
                <p
                  className={`text-[11px] font-medium mt-2 flex items-center gap-0.5 ${
                    item.isPositive ? "text-emerald-500" : "text-gray-400"
                  }`}
                >
                  <span>{item.change}</span>
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center flex-shrink-0`}
              >
                <Icon size={19} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Weekly Chart & Fleet Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Bookings Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Weekly Bookings
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Past 7 days live activity
              </p>
            </div>
            {weeklyGrowth && (
              <div className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight size={13} />
                <span>{weeklyGrowth}</span>
              </div>
            )}
          </div>

          <div className="h-52 w-full pt-6 flex items-end justify-between gap-3 px-2">
            {weeklyData.length > 0 ? (
              weeklyData.map((bar, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center h-full justify-end group"
                >
                  <div className="w-full flex justify-center items-end h-full relative">
                    {/* Tooltip on hover */}
                    <span className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded transition-opacity pointer-events-none">
                      {bar.count}
                    </span>
                    <div
                      style={{ height: bar.height }}
                      className={`w-full max-w-[54px] rounded-lg transition-all duration-300 ${
                        bar.active
                          ? "bg-[#0066FF] shadow-md shadow-blue-500/20"
                          : "bg-[#EFF3F9] group-hover:bg-[#E2E8F0]"
                      }`}
                    ></div>
                  </div>
                  <span className="text-[11px] font-medium text-gray-400 mt-3">
                    {bar.day}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                {loading ? "Loading weekly chart..." : "No bookings recorded this week"}
              </div>
            )}
          </div>
        </div>

        {/* Fleet Status Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Fleet Status
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              {fleetStats.total} total vehicles in fleet
            </p>

            <div className="mt-6 space-y-4">
              {fleetStats.items.length > 0 ? (
                fleetStats.items.map((status, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                      <span className="text-gray-600">{status.label}</span>
                      <span className="text-gray-900 font-semibold">
                        {status.count}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${status.color} transition-all duration-500`}
                        style={{ width: status.width }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 py-6 text-center">
                  {loading ? "Loading fleet status..." : "No fleet data"}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50 mt-6">
            <Link
              to="/fleet"
              className="text-xs font-semibold text-[#0066FF] hover:text-[#0052cc] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View fleet</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:px-6 flex items-center justify-between border-b border-gray-100">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Recent Bookings
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Latest reservation activities
            </p>
          </div>
          <Link
            to="/bookings"
            className="text-xs font-medium text-[#0066FF] hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFBFD] text-[11px] font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Vehicle</th>
                <th className="py-3 px-6">Period</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-medium text-gray-700 whitespace-nowrap">
                      {booking.id}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-gray-900 whitespace-nowrap">
                      {booking.customer}
                    </td>
                    <td className="py-3.5 px-6 text-gray-600 whitespace-nowrap">
                      {booking.vehicle}
                    </td>
                    <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">
                      {booking.period}
                    </td>
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${booking.statusColor}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-gray-900 text-right whitespace-nowrap">
                      {booking.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-xs text-gray-400"
                  >
                    {loading ? "Fetching recent bookings..." : "No bookings found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
