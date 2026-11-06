import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Loader2,
  RefreshCw,
  Search,
  X,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { adminService } from "../api/admin";

export default function ContactUs() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({
    open: 0,
    replied: 0,
    closed: 0,
    all: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getSupportTickets({
        status: activeTab,
        search: searchQuery,
      });

      const list =
        res?.data?.tickets || res?.data || (Array.isArray(res) ? res : []);
      setTickets(Array.isArray(list) ? list : []);

      if (res?.data?.counts) {
        setCounts(res.data.counts);
      } else {
        const open = (Array.isArray(list) ? list : []).filter(
          (t) => (t.status || "").toLowerCase() === "open",
        ).length;
        const replied = (Array.isArray(list) ? list : []).filter(
          (t) => (t.status || "").toLowerCase() === "replied",
        ).length;
        const closed = (Array.isArray(list) ? list : []).filter(
          (t) => (t.status || "").toLowerCase() === "closed",
        ).length;
        setCounts({
          open,
          replied,
          closed,
          all: list.length,
        });
      }
    } catch (err) {
      console.warn("Could not load support tickets from API:", err);
      setError(err.message || "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const TABS = [
    { id: "All", label: "All" },
    { id: "Open", label: `Open (${counts.open || 0})` },
    { id: "Replied", label: `Replied (${counts.replied || 0})` },
    { id: "Closed", label: `Closed (${counts.closed || 0})` },
  ];

  const getStatusBadge = (status = "Open") => {
    const s = status.toLowerCase();
    switch (s) {
      case "open":
        return "bg-[#FFFBEB] text-[#D97706] border border-amber-200";
      case "replied":
        return "bg-[#EFF6FF] text-[#2563EB] border border-blue-200";
      case "closed":
        return "bg-[#F3F4F6] text-[#4B5563] border border-gray-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSendingReply(true);
    setReplySuccess("");
    try {
      await adminService.replySupportTicket(
        selectedTicket._id || selectedTicket.id || selectedTicket.ticketId,
        replyText.trim(),
      );
      setReplySuccess("Reply sent successfully!");
      setReplyText("");
      setSelectedTicket((prev) => ({
        ...prev,
        status: "Replied",
        messages: [
          ...(prev.messages || []),
          {
            sender: "admin",
            senderName: "Turn & Burn Support",
            message: replyText.trim(),
            createdAt: new Date().toISOString(),
          },
        ],
      }));
      fetchTickets();
      setTimeout(() => setReplySuccess(""), 4000);
    } catch (err) {
      alert(`Failed to send reply: ${err.message}`);
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      await adminService.updateSupportTicketStatus(
        selectedTicket._id || selectedTicket.id || selectedTicket.ticketId,
        newStatus,
      );
      setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
      fetchTickets();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map((tab) => {
            const isSelected = activeTab.toLowerCase() === tab.id.toLowerCase();
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                  isSelected
                    ? "bg-[#0066FF] text-white shadow-blue-500/20"
                    : "bg-white text-gray-700 border border-gray-200/80 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          <button
            onClick={fetchTickets}
            title="Refresh tickets"
            className="p-2 bg-white text-gray-500 hover:text-gray-800 rounded-xl border border-gray-200 shadow-sm transition-colors"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-blue-600" : ""}
            />
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="Search tickets by name, email, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchTickets}
            className="underline font-semibold hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100/90 text-[11px] font-semibold tracking-wider text-gray-400 uppercase select-none bg-gray-50/50">
                <th className="py-4 px-6 font-semibold w-24">#</th>
                <th className="py-4 px-6 font-semibold">NAME</th>
                <th className="py-4 px-6 font-semibold">SUBJECT</th>
                <th className="py-4 px-6 font-semibold">EMAIL</th>
                <th className="py-4 px-6 font-semibold">DATE</th>
                <th className="py-4 px-6 font-semibold text-center">STATUS</th>
                <th className="py-4 px-6 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <Loader2
                      size={24}
                      className="animate-spin text-blue-600 mx-auto mb-2"
                    />
                    <span>Loading tickets...</span>
                  </td>
                </tr>
              ) : tickets.length > 0 ? (
                tickets.map((msg, index) => {
                  const ticketId =
                    msg.ticketCode ||
                    msg.ticketId ||
                    (msg._id
                      ? `TKT-${msg._id.slice(-4).toUpperCase()}`
                      : `TKT-00${index + 1}`);

                  const name =
                    msg.name ||
                    msg.customerName ||
                    msg.fullName ||
                    `${msg.user?.firstName || ""} ${msg.user?.lastName || ""}`.trim() ||
                    "Guest User";

                  const email =
                    msg.email || msg.customerEmail || msg.user?.email || "—";
                  const phone =
                    msg.phone || msg.customerPhone || msg.user?.phone || "—";
                  const subject =
                    msg.subject || msg.category || "General Inquiry";
                  const date = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : msg.date || "Recent";

                  const status = msg.status || "Open";

                  return (
                    <tr
                      key={msg._id || msg.id || ticketId}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono text-gray-500 font-semibold whitespace-nowrap">
                        {ticketId}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="font-semibold text-gray-900 leading-tight">
                          {name}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {phone}
                        </p>
                      </td>

                      <td className="py-4 px-6 text-gray-800 whitespace-nowrap font-medium">
                        {subject}
                      </td>

                      <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                        {email}
                      </td>

                      <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                        {date}
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold leading-tight capitalize ${getStatusBadge(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedTicket({
                              ...msg,
                              ticketId,
                              name,
                              email,
                              phone,
                              subject,
                              date,
                              status,
                            })
                          }
                          className="text-[#0066FF] hover:text-[#0052cc] font-semibold text-xs transition-colors hover:underline inline-flex items-center gap-1 p-1"
                        >
                          <span>View</span>
                          <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-gray-400 text-xs"
                  >
                    No tickets found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-gray-700">
                  {selectedTicket.ticketId}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${getStatusBadge(
                    selectedTicket.status,
                  )}`}
                >
                  {selectedTicket.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <User size={15} className="text-gray-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Name
                    </p>
                    <p className="font-bold text-gray-800 truncate">
                      {selectedTicket.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="text-gray-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Email
                    </p>
                    <p className="font-bold text-gray-800 truncate">
                      {selectedTicket.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone size={15} className="text-gray-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Phone
                    </p>
                    <p className="font-bold text-gray-800 truncate">
                      {selectedTicket.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject & Original Message */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Subject
                </p>
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  {selectedTicket.subject}
                </h3>

                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Customer Message
                </p>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 leading-relaxed text-xs">
                  {selectedTicket.message ||
                    selectedTicket.description ||
                    selectedTicket.body ||
                    "No message body provided."}
                </div>
              </div>

              {Array.isArray(selectedTicket.messages) &&
                selectedTicket.messages.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Conversation History
                    </p>
                    {selectedTicket.messages.map((m, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs ${
                          m.sender === "admin"
                            ? "bg-blue-50/60 border-blue-100 ml-6"
                            : "bg-gray-50 border-gray-200 mr-6"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 text-[10px] text-gray-400">
                          <span className="font-bold text-gray-700">
                            {m.senderName ||
                              (m.sender === "admin"
                                ? "Support Admin"
                                : selectedTicket.name)}
                          </span>
                          <span>
                            {m.createdAt
                              ? new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                        <p className="text-gray-800">{m.message}</p>
                      </div>
                    ))}
                  </div>
                )}

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <span className="text-gray-500 font-semibold">
                  Change status:
                </span>
                {["Open", "Replied", "Closed"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedTicket.status?.toLowerCase() === st.toLowerCase()
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendReply} className="space-y-3 pt-2">
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Send Response to Customer
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the customer..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />

                {replySuccess && (
                  <p className="text-emerald-600 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    {replySuccess}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="bg-[#0066FF] hover:bg-[#0052cc] disabled:opacity-60 text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                  >
                    {sendingReply ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
