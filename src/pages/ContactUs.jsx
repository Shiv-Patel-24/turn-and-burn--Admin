import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

const CONTACT_MESSAGES = [
  {
    ticketId: "TKT-0041",
    name: "Marcus Webb",
    phone: "+1 (212) 555-0182",
    subject: "Billing Issue",
    email: "marcus.webb@email.com",
    date: "Aug 18, 2026",
    status: "Open",
  },
  {
    ticketId: "TKT-0040",
    name: "Priya Nair",
    phone: "+1 (646) 555-0293",
    subject: "Vehicle Condition",
    email: "priya.nair@email.com",
    date: "Aug 17, 2026",
    status: "Replied",
  },
  {
    ticketId: "TKT-0039",
    name: "James Okafor",
    phone: "+1 (212) 555-0519",
    subject: "General Inquiry",
    email: "james.ok@email.com",
    date: "Aug 15, 2026",
    status: "Open",
  },
  {
    ticketId: "TKT-0038",
    name: "Elena Ruiz",
    phone: "+1 (917) 555-0448",
    subject: "Cancellation Request",
    email: "elena.ruiz@email.com",
    date: "Aug 14, 2026",
    status: "Closed",
  },
  {
    ticketId: "TKT-0037",
    name: "Nia Watts",
    phone: "+1 (718) 555-0728",
    subject: "Roadside Assistance",
    email: "nia.watts@email.com",
    date: "Aug 12, 2026",
    status: "Replied",
  },
];

export default function ContactUs() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Count open tickets for the tab label
  const openCount = CONTACT_MESSAGES.filter((t) => t.status === "Open").length;

  const TABS = [
    { id: "All", label: "All" },
    { id: "Open", label: `Open (${openCount})` },
    { id: "Replied", label: "Replied" },
    { id: "Closed", label: "Closed" },
  ];

  const filteredMessages = CONTACT_MESSAGES.filter((item) => {
    const matchesTab =
      activeTab === "All"
        ? true
        : item.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ticketId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return "bg-[#FFFBEB] text-[#D97706]"; 
      case "Replied":
        return "bg-[#EFF6FF] text-[#2563EB]"; 
      case "Closed":
        return "bg-[#F3F4F6] text-[#4B5563]"; 
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                  isSelected
                    ? "bg-[#0066FF] text-white shadow-blue-500/20"
                    : "bg-white text-gray-700 border border-gray-200/80 hover:bg-gray-50"
                }`}
              >
                {tab.label}
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
                <th className="py-4 px-6 font-semibold w-24">#</th>
                <th className="py-4 px-6 font-semibold">NAME</th>
                <th className="py-4 px-6 font-semibold">SUBJECT</th>
                <th className="py-4 px-6 font-semibold">EMAIL</th>
                <th className="py-4 px-6 font-semibold">DATE</th>
                <th className="py-4 px-6 font-semibold text-center">STATUS</th>
                <th className="py-4 px-6 font-semibold text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                  <tr
                    key={msg.ticketId}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-gray-400 whitespace-nowrap">
                      {msg.ticketId}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="font-semibold text-gray-900 leading-tight">
                        {msg.name}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {msg.phone}
                      </p>
                    </td>

                    <td className="py-4 px-6 text-gray-700 whitespace-nowrap font-medium">
                      {msg.subject}
                    </td>

                    <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                      {msg.email}
                    </td>

                    <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                      {msg.date}
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold leading-tight ${getStatusBadge(msg.status)}`}
                      >
                        {msg.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          console.log("View message", msg.ticketId)
                        }
                        className="text-[#0066FF] hover:text-[#0052cc] font-semibold text-xs transition-colors hover:underline inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight size={13} />
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
                    No tickets found matching "{activeTab}".
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
