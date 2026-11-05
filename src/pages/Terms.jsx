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
  FileText,
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

export default function Terms() {
  const [sections, setSections] = useState([]);
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
    title: "",
    content: "",
  });

  const fetchTerms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getCmsSections("terms");
      if (res && res.success) {
        const data = res.data || [];
        setSections(data);
        // Default open the first section if none are currently open
        if (data.length > 0) {
          setOpenIds((prev) => (prev.length > 0 ? prev : [data[0]._id]));
        }
      } else {
        setSections([]);
      }
    } catch (err) {
      console.error("Failed to load Terms & Conditions from server:", err);
      setError(err?.message || "Could not load Terms from backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  const toggleExpand = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setModalError("");
    setFormData({ id: null, title: "", content: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sec, e) => {
    e.stopPropagation();
    setModalMode("edit");
    setModalError("");
    setFormData({ id: sec._id, title: sec.title || "", content: sec.content || "" });
    setIsModalOpen(true);
  };

  // Delete section via DELETE /admin/cms/terms/:id
  const handleDelete = async (id, title, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title || "this section"}"?`)) {
      return;
    }
    try {
      await adminService.deleteCmsSection("terms", id);
      setSections((prev) => prev.filter((s) => s._id !== id));
      setOpenIds((prev) => prev.filter((openId) => openId !== id));
    } catch (err) {
      alert(`Delete failed: ${err?.message || "Could not delete section"}`);
    }
  };

  // Reorder sections Up / Down via POST /admin/cms/terms/reorder
  const handleMove = async (index, direction, e) => {
    e.stopPropagation();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length || reordering) return;

    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Optimistic UI update
    setSections(updated);
    setReordering(true);
    try {
      const orderedIds = updated.map((s) => s._id);
      await adminService.reorderCmsSections("terms", orderedIds);
    } catch (err) {
      console.error("Reorder failed:", err);
      // Revert on error
      fetchTerms();
    } finally {
      setReordering(false);
    }
  };

  // Submit Save Form (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");

    const payload = {
      blockType: "text",
      title: formData.title.trim(),
      content: formData.content.trim(),
    };

    try {
      if (modalMode === "add") {
        await adminService.createCmsSection("terms", {
          ...payload,
          order: sections.length,
        });
      } else {
        await adminService.updateCmsSection("terms", formData.id, payload);
      }
      setIsModalOpen(false);
      fetchTerms();
    } catch (err) {
      setModalError(err?.message || "Failed to save section to server.");
    } finally {
      setModalLoading(false);
    }
  };

  const filteredSections = sections.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.title || "").toLowerCase().includes(q) ||
      (s.content || "").toLowerCase().includes(q)
    );
  });

  const latestUpdatedDate = sections.reduce((latest, s) => {
    if (!s.updatedAt) return latest;
    const d = new Date(s.updatedAt);
    return !latest || d > latest ? d : latest;
  }, null);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      {/* Top Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">
            Terms &amp; Conditions
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {sections.length} active legal sections · Last updated{" "}
            {latestUpdatedDate ? formatDate(latestUpdatedDate) : "Recently"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-60">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search terms content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchTerms}
            title="Refresh terms"
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Add Section</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
              <p className="text-xs font-medium">Loading Terms & Conditions from server...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="flex flex-col items-center justify-center gap-2 text-red-500">
              <AlertCircle className="w-6 h-6" />
              <p className="text-xs font-medium">{error}</p>
              <button
                type="button"
                onClick={fetchTerms}
                className="mt-2 text-xs text-[#0066FF] font-semibold underline"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredSections.length > 0 ? (
          filteredSections.map((sec, index) => {
            const isOpen = openIds.includes(sec._id);

            return (
              <div
                key={sec._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden transition-all"
              >
                <div
                  onClick={() => toggleExpand(sec._id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">
                      {isOpen ? (
                        <ChevronDown size={17} />
                      ) : (
                        <ChevronRight size={17} />
                      )}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900 tracking-tight">
                      {sec.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <button
                      type="button"
                      disabled={index === 0 || reordering}
                      onClick={(e) => handleMove(index, "up", e)}
                      className="hover:text-gray-600 transition-colors p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === sections.length - 1 || reordering}
                      onClick={(e) => handleMove(index, "down", e)}
                      className="hover:text-gray-600 transition-colors p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(sec, e)}
                      className="hover:text-gray-700 transition-colors p-1"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(sec._id, sec.title, e)}
                      className="hover:text-red-500 transition-colors p-1"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-50 whitespace-pre-line">
                    {sec.content}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-xs shadow-sm">
            No terms sections matching your search.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {modalMode === "edit" ? "Edit Terms Section" : "Add Terms Section"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  SECTION TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8. Return Policies & Penalties"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  CONTENT BODY *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Enter full legal section text and conditions..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {modalLoading && <Loader2 size={13} className="animate-spin" />}
                  <span>{modalMode === "edit" ? "Save Changes" : "Create Section"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
