import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";

const INITIAL_USERS = [
  {
    id: 1,
    initials: "MW",
    initialsBg: "bg-[#0EA5E9]",
    name: "Marcus Webb",
    email: "marcus.webb@email.com",
    phone: "+1 (212) 555-0182",
    joined: "Jan 14, 2025",
    bookings: 8,
    status: "Verified",
    licenseNo: "NY-8821-4432",
    state: "New York",
    dob: "Jun 12, 1988",
    expires: "Mar 2028",
  },
  {
    id: 2,
    initials: "PN",
    initialsBg: "bg-[#10B981]",
    name: "Priya Nair",
    email: "priya.nair@email.com",
    phone: "+1 (646) 555-0293",
    joined: "Feb 3, 2025",
    bookings: 12,
    status: "Verified",
    licenseNo: "NY-4412-9901",
    state: "New York",
    dob: "Aug 24, 1992",
    expires: "Nov 2029",
  },
  {
    id: 3,
    initials: "DF",
    initialsBg: "bg-[#059669]",
    name: "Damien Foster",
    email: "damien.f@email.com",
    phone: "+1 (718) 555-0371",
    joined: "Aug 1, 2026",
    bookings: 3,
    status: "Pending",
    licenseNo: "NY-7721-3310",
    state: "New York",
    dob: "Oct 05, 1995",
    expires: "Jan 2027",
  },
  {
    id: 4,
    initials: "ER",
    initialsBg: "bg-[#D97706]",
    name: "Elena Ruiz",
    email: "elena.ruiz@email.com",
    phone: "+1 (917) 555-0448",
    joined: "Apr 22, 2025",
    bookings: 6,
    status: "Verified",
    licenseNo: "NY-9912-7744",
    state: "New York",
    dob: "Mar 15, 1991",
    expires: "Sep 2028",
  },
  {
    id: 5,
    initials: "JO",
    initialsBg: "bg-[#059669]",
    name: "James Okafor",
    email: "james.ok@email.com",
    phone: "+1 (212) 555-0519",
    joined: "Aug 10, 2026",
    bookings: 1,
    status: "Pending",
    licenseNo: "NY-3381-1120",
    state: "New York",
    dob: "Jul 04, 1989",
    expires: "May 2027",
  },
  {
    id: 6,
    initials: "SP",
    name: "Sasha Petrov",
    email: "sasha.p@email.com",
    phone: "+1 (646) 555-0671",
    joined: "Mar 15, 2025",
    bookings: 0,
    status: "Blocked",
    licenseNo: "NY-1102-6691",
    state: "New York",
    dob: "Dec 18, 1994",
    expires: "Feb 2026",
  },
  {
    id: 7,
    initials: "NW",
    initialsBg: "bg-[#2563EB]",
    name: "Nia Watts",
    email: "nia.watts@email.com",
    phone: "+1 (718) 555-0728",
    joined: "Dec 8, 2024",
    bookings: 14,
    status: "Verified",
    licenseNo: "NY-5561-8840",
    state: "New York",
    dob: "Nov 30, 1993",
    expires: "Aug 2029",
  },
  {
    id: 8,
    initials: "LC",
    initialsBg: "bg-[#DC2626]",
    name: "Leo Chan",
    email: "leo.chan@email.com",
    phone: "+1 (917) 555-0831",
    joined: "Jun 5, 2025",
    bookings: 2,
    status: "Verified",
    licenseNo: "NY-8830-4412",
    state: "New York",
    dob: "Jan 10, 1990",
    expires: "Apr 2028",
  },
];

const TABS = ["All", "Verified", "Pending", "Blocked"];

export default function Users() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedUserForId, setSelectedUserForId] = useState(null);

  const handleToggleBlock = (userId) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const nextStatus = user.status === "Blocked" ? "Verified" : "Blocked";
          const updated = { ...user, status: nextStatus };
          if (selectedUserForId && selectedUserForId.id === userId) {
            setSelectedUserForId(updated);
          }
          return updated;
        }
        return user;
      }),
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesTab =
      activeTab === "All"
        ? true
        : user.status.toLowerCase() === activeTab.toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);

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
                <th className="py-4 px-6 font-semibold">USER</th>
                <th className="py-4 px-6 font-semibold">PHONE</th>
                <th className="py-4 px-6 font-semibold">JOINED</th>
                <th className="py-4 px-6 font-semibold">BOOKINGS</th>
                <th className="py-4 px-6 font-semibold text-center">STATUS</th>
                <th className="py-4 px-6 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${user.initialsBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm`}
                        >
                          {user.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                      {user.phone}
                    </td>

                    <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                      {user.joined}
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                      {user.bookings}
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold leading-tight ${getStatusBadge(
                          user.status,
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedUserForId(user)}
                          className="text-[#0066FF] hover:text-[#0052cc] font-semibold text-xs transition-colors hover:underline"
                        >
                          View ID
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleBlock(user.id)}
                          className={`font-semibold text-xs transition-colors hover:underline ${
                            user.status === "Blocked"
                              ? "text-[#10B981] hover:text-[#059669]"
                              : "text-[#DC2626] hover:text-[#b91c1c]"
                          }`}
                        >
                          {user.status === "Blocked" ? "Unblock" : "Block"}
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
                    No users found matching "{activeTab}".
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

      {selectedUserForId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  IDENTITY VERIFICATION
                </p>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight mt-0.5">
                  {selectedUserForId.name}
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

            <div className="bg-[#12141F] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[9px] font-semibold tracking-wider text-gray-400 uppercase">
                    DRIVER LICENSE
                  </p>
                  <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
                    {selectedUserForId.name}
                  </h4>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white font-bold text-xs flex items-center justify-center shadow-md">
                  {selectedUserForId.initials}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-left">
                <div>
                  <p className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
                    LICENSE NO.
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5 tracking-wide">
                    {selectedUserForId.licenseNo}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
                    STATE
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {selectedUserForId.state}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
                    DATE OF BIRTH
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {selectedUserForId.dob}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
                    EXPIRES
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {selectedUserForId.expires}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-6 px-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Email</span>
                <span className="font-semibold text-gray-900">
                  {selectedUserForId.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Phone</span>
                <span className="font-semibold text-gray-900">
                  {selectedUserForId.phone}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">
                  Account Status
                </span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadge(selectedUserForId.status)}`}
                >
                  {selectedUserForId.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Member Since</span>
                <span className="font-semibold text-gray-900">
                  {selectedUserForId.joined}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedUserForId(null)}
              className="w-full bg-[#F3F4F6] hover:bg-gray-200 text-gray-800 text-xs font-bold py-3 rounded-2xl transition-colors tracking-wide"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
