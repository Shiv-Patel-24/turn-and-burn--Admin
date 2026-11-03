import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const INITIAL_HOSTS = [
  {
    id: 1,
    initials: "MW",
    initialsBg: "bg-[#0EA5E9]",
    name: "Cristofer Workman",
    email: "cristofer.workman@email.com",
    phone: "+1 (212) 555-0182",
    joined: "Jan 14, 2025",
    bookings: 8,
    status: "Verified",
  },
  {
    id: 2,
    initials: "PN",
    initialsBg: "bg-[#10B981]",
    name: "Kadin Stanton",
    email: "kadin.stanton@email.com",
    phone: "+1 (646) 555-0293",
    joined: "Feb 3, 2025",
    bookings: 12,
    status: "Verified",
  },
  {
    id: 3,
    initials: "DF",
    initialsBg: "bg-[#059669]",
    name: "Jocelyn Kenter",
    email: "jocelyn.k@email.com",
    phone: "+1 (718) 555-0371",
    joined: "Aug 1, 2026",
    bookings: 3,
    status: "Pending",
  },
  {
    id: 4,
    initials: "ER",
    initialsBg: "bg-[#D97706]",
    name: "Haylie Rhiel Madsen",
    email: "haylie.rhiel.m@email.com",
    phone: "+1 (917) 555-0448",
    joined: "Apr 22, 2025",
    bookings: 6,
    status: "Verified",
  },
  {
    id: 5,
    initials: "JO",
    initialsBg: "bg-[#059669]",
    name: "Desirae Geidt",
    email: "desirae.geidt@email.com",
    phone: "+1 (212) 555-0519",
    joined: "Aug 10, 2026",
    bookings: 1,
    status: "Pending",
  },
  {
    id: 6,
    initials: "SP",
    initialsBg: "bg-[#0284C7]",
    name: "Allison Carder",
    email: "allison.c@email.com",
    phone: "+1 (646) 555-0671",
    joined: "Mar 15, 2025",
    bookings: 0,
    status: "Blocked",
  },
  {
    id: 7,
    initials: "NW",
    initialsBg: "bg-[#2563EB]",
    name: "Paityn Philips",
    email: "paityn.philips@email.com",
    phone: "+1 (718) 555-0728",
    joined: "Dec 8, 2024",
    bookings: 14,
    status: "Verified",
  },
  {
    id: 8,
    initials: "LC",
    initialsBg: "bg-[#DC2626]",
    name: "Marilyn Westervelt",
    email: "marilyn.west@email.com",
    phone: "+1 (917) 555-0831",
    joined: "Jun 5, 2025",
    bookings: 2,
    status: "Verified",
  },
];

const TABS = ["All", "Verified", "Pending", "Blocked"];

export default function Hosts() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hosts, setHosts] = useState(INITIAL_HOSTS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleToggleBlock = (hostId) => {
    setHosts((prev) =>
      prev.map((host) => {
        if (host.id === hostId) {
          const nextStatus = host.status === "Blocked" ? "Verified" : "Blocked";
          return { ...host, status: nextStatus };
        }
        return host;
      }),
    );
  };

  const filteredHosts = hosts.filter((host) => {
    const matchesTab =
      activeTab === "All"
        ? true
        : host.status.toLowerCase() === activeTab.toLowerCase();

    const matchesSearch =
      host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.phone.includes(searchQuery);

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Verified":
        return "bg-[#ECFDF5] text-[#10B981]";
      case "Pending":
        return "bg-[#FFFBEB] text-[#F59E0B]";
      case "Blocked":
        return "bg-[#FEF2F2] text-[#EF4444]";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-10 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100/90 text-[11px] font-semibold tracking-wider text-gray-400 uppercase select-none">
                <th className="py-4 px-6 font-semibold">HOSTS</th>
                <th className="py-4 px-6 font-semibold">PHONE</th>
                <th className="py-4 px-6 font-semibold">JOINED</th>
                <th className="py-4 px-6 font-semibold">BOOKINGS</th>
                <th className="py-4 px-6 font-semibold text-center">STATUS</th>
                <th className="py-4 px-6 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredHosts.length > 0 ? (
                filteredHosts.map((host) => (
                  <tr
                    key={host.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${host.initialsBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm`}
                        >
                          {host.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">
                            {host.name}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {host.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                      {host.phone}
                    </td>

                    <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                      {host.joined}
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                      {host.bookings}
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold leading-tight ${getStatusBadge(
                          host.status,
                        )}`}
                      >
                        {host.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => console.log("View ID for", host.id)}
                          className="text-[#0066FF] hover:text-[#0052cc] font-semibold text-xs transition-colors hover:underline"
                        >
                          View ID
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleBlock(host.id)}
                          className={`font-semibold text-xs transition-colors hover:underline ${
                            host.status === "Blocked"
                              ? "text-[#10B981] hover:text-[#059669]"
                              : "text-[#DC2626] hover:text-[#b91c1c]"
                          }`}
                        >
                          {host.status === "Blocked" ? "Unblock" : "Block"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-gray-400 text-xs"
                  >
                    No hosts found matching "{activeTab}".
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
