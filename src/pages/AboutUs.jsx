import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Image as ImageIcon,
  Type,
  ChevronUp,
  ChevronDown,
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

export default function AboutUs() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("text"); // "text" | "image"
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    content: "",
    imageUrl: "",
  });

  // Fetch About Us CMS blocks from backend endpoint
  const fetchAboutUs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getCmsSections("about-us");
      if (res && res.success) {
        setBlocks(res.data || []);
      } else {
        setBlocks([]);
      }
    } catch (err) {
      console.error("Failed to load About Us CMS blocks from server:", err);
      setError(err?.message || "Could not load About Us content from backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAboutUs();
  }, [fetchAboutUs]);

  const handleOpenAddText = () => {
    setModalType("text");
    setModalMode("add");
    setModalError("");
    setFormData({ id: null, title: "", content: "", imageUrl: "" });
    setIsModalOpen(true);
  };

  const handleOpenAddImage = () => {
    setModalType("image");
    setModalMode("add");
    setModalError("");
    setFormData({ id: null, title: "", content: "", imageUrl: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (block) => {
    const isImg = (block.blockType || "text").toLowerCase() === "image";
    setModalType(isImg ? "image" : "text");
    setModalMode("edit");
    setModalError("");
    setFormData({
      id: block._id,
      title: block.title || "",
      content: block.content || "",
      imageUrl: block.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  // Delete section via DELETE /admin/cms/about-us/:id
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || "this block"}"?`)) {
      return;
    }
    try {
      await adminService.deleteCmsSection("about-us", id);
      setBlocks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert(`Delete failed: ${err?.message || "Could not delete block"}`);
    }
  };

  // Reorder blocks Up / Down via POST /admin/cms/about-us/reorder
  const handleMove = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length || reordering) return;

    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Optimistic UI update
    setBlocks(updated);
    setReordering(true);
    try {
      const orderedIds = updated.map((b) => b._id);
      await adminService.reorderCmsSections("about-us", orderedIds);
    } catch (err) {
      console.error("Reorder failed:", err);
      // Revert on error
      fetchAboutUs();
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
      blockType: modalType,
      title: formData.title.trim() || (modalType === "image" ? "Image Banner" : "Our Story"),
      content: formData.content.trim(),
      imageUrl: modalType === "image" ? formData.imageUrl.trim() : undefined,
    };

    try {
      if (modalMode === "add") {
        await adminService.createCmsSection("about-us", {
          ...payload,
          order: blocks.length,
        });
      } else {
        await adminService.updateCmsSection("about-us", formData.id, payload);
      }
      setIsModalOpen(false);
      fetchAboutUs();
    } catch (err) {
      setModalError(err?.message || "Failed to save block to server.");
    } finally {
      setModalLoading(false);
    }
  };

  // Search filter
  const filteredBlocks = blocks.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (b.title || "").toLowerCase().includes(q) ||
      (b.content || "").toLowerCase().includes(q) ||
      (b.blockType || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      {/* Top Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">
            About Us Content Management
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {blocks.length} live CMS content blocks · Reorder or publish changes live
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative w-44 sm:w-56">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search content..."
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
            onClick={fetchAboutUs}
            title="Refresh content"
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={handleOpenAddText}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Add Text</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddImage}
            className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Add Image</span>
          </button>
        </div>
      </div>

      {/* Main Blocks List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
              <p className="text-xs font-medium">Loading About Us content from server...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="flex flex-col items-center justify-center gap-2 text-red-500">
              <AlertCircle className="w-6 h-6" />
              <p className="text-xs font-medium">{error}</p>
              <button
                type="button"
                onClick={fetchAboutUs}
                className="mt-2 text-xs text-[#0066FF] font-semibold underline"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredBlocks.length > 0 ? (
          filteredBlocks.map((block, idx) => {
            const isImage = (block.blockType || "text").toLowerCase() === "image";

            return (
              <div
                key={block._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden transition-all"
              >
                <div className="px-6 py-3.5 flex items-center justify-between border-b border-gray-50 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
                  <div className="flex items-center gap-2">
                    <span>{isImage ? "🌄" : "📝"}</span>
                    <span className="font-bold text-gray-700">
                      {isImage ? "IMAGE BLOCK" : "TEXT BLOCK"}
                    </span>
                    <span className="text-gray-400 font-normal">#{idx + 1}</span>
                    {block.title && (
                      <span className="text-gray-300 font-normal">· {block.title}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <button
                      type="button"
                      disabled={idx === 0 || reordering}
                      onClick={() => handleMove(idx, "up")}
                      className="hover:text-gray-600 transition-colors p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === blocks.length - 1 || reordering}
                      onClick={() => handleMove(idx, "down")}
                      className="hover:text-gray-600 transition-colors p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(block)}
                      className="hover:text-gray-700 transition-colors p-1"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(block._id, block.title)}
                      className="hover:text-red-500 transition-colors p-1"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {isImage ? (
                    <div>
                      <div className="rounded-2xl overflow-hidden h-72 w-full bg-gray-100 shadow-sm relative">
                        <img
                          src={block.imageUrl || "https://placehold.co/1200x500/png?text=Our+Fleet"}
                          alt={block.title || "About Us Banner"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {block.content && (
                        <p className="text-[11px] text-gray-400 text-center mt-3 font-normal">
                          {block.content}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {block.title && (
                        <h4 className="text-sm font-bold text-gray-900 mb-2">
                          {block.title}
                        </h4>
                      )}
                      <p className="text-xs text-gray-600 leading-relaxed font-normal whitespace-pre-line">
                        {block.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-xs shadow-sm">
            No content blocks found matching "{searchQuery}".
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: ADD / EDIT ABOUT US BLOCK
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {modalMode === "edit"
                  ? `Edit ${modalType === "image" ? "Image Block" : "Text Block"}`
                  : `Add ${modalType === "image" ? "Image Block" : "Text Block"}`}
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
                  HEADING / TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Our Story, Our Fleet, Our Mission"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {modalType === "image" ? (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                      IMAGE URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                      IMAGE CAPTION
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Our fleet — premium vehicles for every journey"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                    TEXT CONTENT BODY *
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Enter the paragraph text about Turn & Burn..."
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {modalLoading && <Loader2 size={13} className="animate-spin" />}
                  <span>{modalMode === "edit" ? "Save Changes" : "Save Block"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
