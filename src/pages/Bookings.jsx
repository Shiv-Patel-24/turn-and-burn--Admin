import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const ALL_BOOKINGS = [
  {
    id: "BK-7821",
    customer: "Marcus Webb",
    vehicle: "2023 Toyota Camry",
    dates: "Aug 12, 2026 – Aug 15, 2026",
    status: "Active",
    amount: "$285",
  },
  {
    id: "BK-7820",
    customer: "Priya Nair",
    vehicle: "2022 Honda CR-V",
    dates: "Aug 11, 2026 – Aug 14, 2026",
    status: "Active",
    amount: "$312",
  },
  {
    id: "BK-7819",
    customer: "Damien Foster",
    vehicle: "2024 Ford Mustang",
    dates: "Aug 10, 2026 – Aug 13, 2026",
    status: "Completed",
    amount: "$540",
  },
  {
    id: "BK-7818",
    customer: "Elena Ruiz",
    vehicle: "2022 Tesla Model 3",
    dates: "Aug 9, 2026 – Aug 12, 2026",
    status: "Completed",
    amount: "$480",
  },
  {
    id: "BK-7817",
    customer: "James Okafor",
    vehicle: "2023 BMW 3 Series",
    dates: "Aug 15, 2026 – Aug 18, 2026",
    status: "Pending",
    amount: "$620",
  },
  {
    id: "BK-7816",
    customer: "Sasha Petrov",
    vehicle: "2021 Chevrolet Equinox",
    dates: "Aug 9, 2026 – Aug 10, 2026",
    status: "Cancelled",
    amount: "$140",
  },
  {
    id: "BK-7815",
    customer: "Nia Watts",
    vehicle: "2023 Mercedes C-Class",
    dates: "Aug 8, 2026 – Aug 12, 2026",
    status: "Completed",
    amount: "$880",
  },
  {
    id: "BK-7814",
    customer: "Leo Chan",
    vehicle: "2022 Hyundai Tucson",
    dates: "Aug 14, 2026 – Aug 16, 2026",
    status: "Pending",
    amount: "$184",
  },
];

const TABS = ["All", "Pending", "Active", "Completed", "Cancelled"];

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredBookings = ALL_BOOKINGS.filter((booking) => {
    if (activeTab === "All") return true;
    return booking.status.toLowerCase() === activeTab.toLowerCase();
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-[#DCFCE7] text-[#15803D]"; 
      case "Pending":
        return "bg-[#FEF3C7] text-[#D97706]"; 
      case "Completed":
        return "bg-[#DBEAFE] text-[#1D4ED8]"; 
      case "Cancelled":
        return "bg-[#FEE2E2] text-[#DC2626]"; 
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center gap-2.5">
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100/90 text-[11px] font-semibold tracking-wider text-gray-400 uppercase select-none">
                <th className="py-4 px-6 font-semibold">BOOKING ID</th>
                <th className="py-4 px-6 font-semibold">CUSTOMER</th>
                <th className="py-4 px-6 font-semibold">VEHICLE</th>
                <th className="py-4 px-6 font-semibold">DATES</th>
                <th className="py-4 px-6 font-semibold text-center">STATUS</th>
                <th className="py-4 px-6 font-semibold">AMOUNT</th>
                <th className="py-4 px-6 font-semibold text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-gray-400 whitespace-nowrap">
                      {item.id}
                    </td>

                    <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                      {item.customer}
                    </td>

                    <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                      {item.vehicle}
                    </td>

                    <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                      {item.dates}
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold leading-tight ${getStatusBadgeClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                      {item.amount}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => console.log("View booking", item.id)}
                        className="text-[#0066FF] hover:text-[#0052cc] font-semibold text-xs transition-colors hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-gray-400 text-xs"
                  >
                    No bookings found for the "{activeTab}" filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 select-none">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
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
          <span className="text-gray-400 text-xs font-normal">/Page</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>

          {[1, 2, 3, 4].map((page) => {
            const isCurrent = currentPage === page;
            return (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                  isCurrent
                    ? "border border-[#0066FF] text-[#0066FF] bg-white font-semibold"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage === 4}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, 4))}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
