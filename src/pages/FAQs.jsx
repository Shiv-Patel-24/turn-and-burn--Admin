import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Search,
} from "lucide-react";
import { adminService } from "../api/admin";

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function FAQs() {
  const [faqs, setFaqs] = useState([]);
  const [openIds, setOpenIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    question: "",
    answer: "",
    category: "",
  });

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getCmsSections("faq");
      if (res && res.success) {
        const data = res.data || [];
        setFaqs(data);
        if (data.length > 0) {
          setOpenIds((prev) => (prev.length > 0 ? prev : [data[0]._id]));
        }
      } else {
        setFaqs([]);
      }
    } catch (err) {
      console.error("Failed to load FAQs from server:", err);
      setError(err?.message || "Could not load FAQs from backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const toggleExpand = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setModalError("");
    setFormData({ id: null, question: "", answer: "", category: "General" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item, e) => {
    e.stopPropagation();
    setModalMode("edit");
    setModalError("");
    setFormData({
      id: item._id,
      question: item.title || "",
      answer: item.content || "",
      category: item.category || "General",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title || "this FAQ"}"?`)) {
      return;
    }
    try {
      await adminService.deleteCmsSection("faq", id);
      setFaqs((prev) => prev.filter((f) => f._id !== id));
      setOpenIds((prev) => prev.filter((openId) => openId !== id));
    } catch (err) {
      alert(`Delete failed: ${err?.message || "Could not delete FAQ"}`);
    }
  };

  const handleMove = async (index, direction, e) => {
    e.stopPropagation();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length || reordering) return;

    const updated = [...faqs];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setFaqs(updated);
    setReordering(true);
    try {
      const orderedIds = updated.map((f) => f._id);
      await adminService.reorderCmsSections("faq", orderedIds);
    } catch (err) {
      console.error("Reorder failed:", err);
      fetchFaqs();
    } finally {
      setReordering(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");

    const payload = {
      blockType: "text",
      title: formData.question.trim(),
      content: formData.answer.trim(),
      category: formData.category.trim() || "General",
    };

    try {
      if (modalMode === "add") {
        await adminService.createCmsSection("faq", {
          ...payload,
          order: faqs.length,
        });
      } else {
        await adminService.updateCmsSection("faq", formData.id, payload);
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err) {
      console.error("Error saving FAQ:", err);
      setModalError(err?.message || "Failed to save FAQ section.");
    } finally {
      setModalLoading(false);
    }
  };

  // Filter FAQs by search query
  const filteredFaqs = faqs.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (f.title || "").toLowerCase().includes(q) ||
      (f.content || "").toLowerCase().includes(q) ||
      (f.category || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Frequently Asked Questions (FAQs)
            </h3>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              CMS Dynamic
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? "Loading FAQs..." : `${faqs.length} Live Question${faqs.length === 1 ? "" : "s"} on platform`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchFaqs}
            disabled={loading}
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            title="Refresh FAQs from backend"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Add FAQ</span>
          </button>
        </div>
      </div>

      {faqs.length > 0 && (
        <div className="relative max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchFaqs}
            className="underline font-semibold hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Loader2 size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">
            Fetching dynamic FAQs from database...
          </p>
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <HelpCircle size={22} />
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">
            {searchQuery ? "No matching FAQs found" : "No FAQs created yet"}
          </h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            {searchQuery
              ? `No questions matched "${searchQuery}". Try a different keyword.`
              : "Create frequently asked questions for renters and hosts on the Turn & Burn app."}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Create First FAQ</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((item, index) => {
            const isOpen = openIds.includes(item._id);

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden transition-all"
              >
                <div
                  onClick={() => toggleExpand(item._id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <span className="text-gray-400 shrink-0">
                      {isOpen ? (
                        <ChevronDown size={17} />
                      ) : (
                        <ChevronRight size={17} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          #{index + 1}
                        </span>
                        {item.category && item.category !== "General" && (
                          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-gray-900 tracking-tight truncate">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Updated: {formatDate(item.updatedAt || item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0 || reordering}
                      onClick={(e) => handleMove(index, "up", e)}
                      className="hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === filteredFaqs.length - 1 || reordering}
                      onClick={(e) => handleMove(index, "down", e)}
                      className="hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Down"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(item, e)}
                      className="hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item._id, item.title, e)}
                      className="hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 pt-3 text-xs text-gray-600 leading-relaxed border-t border-gray-100 whitespace-pre-wrap bg-gray-50/30">
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {modalMode === "edit" ? "Edit FAQ" : "Add New FAQ"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Booking, Pricing, Verification, Roadside"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What documents do I need to rent a vehicle?"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                  Answer *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Provide a clear, detailed explanation..."
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {modalLoading && <Loader2 size={13} className="animate-spin" />}
                  <span>{modalMode === "edit" ? "Save Changes" : "Create FAQ"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
