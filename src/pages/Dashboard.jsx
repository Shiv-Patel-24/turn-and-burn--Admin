import React from "react";
import {
  Calendar,
  Car,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const metrics = [
    {
      label: "Total Bookings",
      value: "1,284",
      change: "+12% vs last month",
      isPositive: true,
      icon: Calendar,
      iconColor: "text-[#0066FF]",
      iconBg: "bg-[#EFF6FF]",
    },
    {
      label: "Active Vehicles",
      value: "38",
      change: "+4 vs last month",
      isPositive: true,
      icon: Car,
      iconColor: "text-[#0066FF]",
      iconBg: "bg-[#EFF6FF]",
    },
    {
      label: "Revenue (MTD)",
      value: "$84,320",
      change: "+8.3% vs last month",
      isPositive: true,
      icon: DollarSign,
      iconColor: "text-[#0066FF]",
      iconBg: "bg-[#EFF6FF]",
    },
    {
      label: "Active Users",
      value: "3,471",
      change: "+221 vs last month",
      isPositive: true,
      icon: Users,
      iconColor: "text-[#0066FF]",
      iconBg: "bg-[#EFF6FF]",
    },
  ];

  const weeklyData = [
    { day: "Mon", height: "42%", active: false },
    { day: "Tue", height: "55%", active: false },
    { day: "Wed", height: "48%", active: false },
    { day: "Thu", height: "68%", active: false },
    { day: "Fri", height: "62%", active: false },
    { day: "Sat", height: "82%", active: false },
    { day: "Sun", height: "76%", active: true },
  ];

  const fleetStatus = [
    { label: "Available", count: 14, color: "bg-[#10B981]", width: "30%" },
    { label: "Rented", count: 24, color: "bg-[#0066FF]", width: "52%" },
    { label: "Maintenance", count: 5, color: "bg-[#F59E0B]", width: "11%" },
    { label: "Inactive", count: 3, color: "bg-[#6B7280]", width: "7%" },
  ];

  const recentBookings = [
    {
      id: "BK-7821",
      customer: "Marcus Webb",
      vehicle: "2023 Toyota Camry",
      period: "Aug 12 – Aug 15",
      status: "Active",
      statusColor: "bg-emerald-50 text-emerald-600",
      amount: "$285",
    },
    {
      id: "BK-7820",
      customer: "Priya Nair",
      vehicle: "2022 Honda CR-V",
      period: "Aug 11 – Aug 14",
      status: "Active",
      statusColor: "bg-emerald-50 text-emerald-600",
      amount: "$312",
    },
    {
      id: "BK-7819",
      customer: "Damian Foster",
      vehicle: "2021 Ford Mustang",
      period: "Aug 10 – Aug 12",
      status: "Completed",
      statusColor: "bg-blue-50 text-blue-600",
      amount: "$540",
    },
    {
      id: "BK-7818",
      customer: "Elena Rostova",
      vehicle: "2023 Tesla Model 3",
      period: "Aug 09 – Aug 13",
      status: "Active",
      statusColor: "bg-emerald-50 text-emerald-600",
      amount: "$420",
    },
    {
      id: "BK-7817",
      customer: "James Wilson",
      vehicle: "2020 BMW 3 Series",
      period: "Aug 08 – Aug 10",
      status: "Completed",
      statusColor: "bg-blue-50 text-blue-600",
      amount: "$390",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
                <p className="text-[11px] font-medium text-emerald-500 mt-2 flex items-center gap-0.5">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Weekly Bookings
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Aug 6 – Aug 12, 2026
              </p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight size={13} />
              <span>14.2%</span>
            </div>
          </div>

          <div className="h-52 w-full pt-6 flex items-end justify-between gap-3 px-2">
            {weeklyData.map((bar, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center h-full justify-end group"
              >
                <div className="w-full flex justify-center items-end h-full">
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
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Fleet Status
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">46 total vehicles</p>

            <div className="mt-6 space-y-4">
              {fleetStatus.map((status, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                    <span className="text-gray-600">{status.label}</span>
                    <span className="text-gray-900 font-semibold">
                      {status.count}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${status.color}`}
                      style={{ width: status.width }}
                    ></div>
                  </div>
                </div>
              ))}
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:px-6 flex items-center justify-between border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900">
            Recent Bookings
          </h4>
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
              {recentBookings.map((booking, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-gray-500 whitespace-nowrap">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
