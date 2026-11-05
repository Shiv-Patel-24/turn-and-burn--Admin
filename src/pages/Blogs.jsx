import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  EyeOff,
  Eye,
  Trash2,
  X,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  AlertCircle,
  Search,
} from "lucide-react";
import { adminService } from "../api/admin";

const CATEGORIES = [
  "Tips & Guides",
  "Industry News",
  "Customer Guide",
  "Company News",
  "Travel",
  "Development",
  "Sports",
  "General",
  "Behind the Wheel",
];

function formatDate(dateStr) {
  if (!dateStr) return "Not published";
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

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0 });
  const [activeTab, setActiveTab] = useState("All"); // "All" | "Published" | "Draft"
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    category: "Tips & Guides",
    status: "published", // "published" | "draft"
    excerpt: "",
    content: "",
    coverImageUrl: "",
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch blogs from backend
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getBlogPosts({
        status: activeTab,
        search: debouncedSearch,
      });

      if (res && res.success && res.data) {
        setBlogs(res.data.posts || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.error("Failed to load blog posts:", err);
      setError(err?.message || "Could not load blog articles from server.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Open Add Post Modal
  const handleOpenNewPost = () => {
    setModalMode("add");
    setModalError("");
    setFormData({
      id: null,
      title: "",
      category: "Tips & Guides",
      status: "published",
      excerpt: "",
      content: "",
      coverImageUrl: "",
    });
    setIsModalOpen(true);
  };

  // Open Edit Post Modal (loads full content via GET /admin/blog/:id)
  const handleOpenEditPost = async (blog) => {
    setModalMode("edit");
    setModalError("");
    setFormData({
      id: blog._id,
      title: blog.title || "",
      category: blog.category || "General",
      status: blog.isPublished ? "published" : "draft",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      coverImageUrl: blog.coverImageUrl || "",
    });
    setIsModalOpen(true);

    // Fetch full post content if missing
    try {
      const detailRes = await adminService.getBlogPost(blog._id);
      if (detailRes && detailRes.success && detailRes.data) {
        setFormData((prev) => ({
          ...prev,
          content: detailRes.data.content || prev.content,
        }));
      }
    } catch (err) {
      console.warn("Could not load full article body:", err);
    }
  };

  // Quick toggle Publish / Unpublish directly from card
  const handleToggleStatus = async (blog) => {
    const nextPublished = !blog.isPublished;
    const nextStatus = nextPublished ? "published" : "draft";

    try {
      await adminService.updateBlogPost(blog._id, {
        isPublished: nextPublished,
        status: nextStatus,
      });

      // Optimistic local update
      setBlogs((prev) =>
        prev.map((b) =>
          b._id === blog._id
            ? {
                ...b,
                isPublished: nextPublished,
                publishedAt: nextPublished ? new Date().toISOString() : null,
              }
            : b
        )
      );

      // Refresh counts
      setCounts((prev) => ({
        ...prev,
        published: nextPublished ? prev.published + 1 : prev.published - 1,
        draft: nextPublished ? prev.draft - 1 : prev.draft + 1,
      }));
    } catch (err) {
      alert(`Status update failed: ${err?.message || "Error updating publication status"}`);
    }
  };

  // Delete blog post
  const handleDeletePost = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await adminService.deleteBlogPost(id);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      setCounts((prev) => ({
        ...prev,
        all: Math.max(0, prev.all - 1),
      }));
    } catch (err) {
      alert(`Delete failed: ${err?.message || "Could not delete post"}`);
    }
  };

  // Submit Save Blog Form
  const handleSavePost = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");

    const isPublished = formData.status === "published";
    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      excerpt: formData.excerpt.trim(),
      content: formData.content.trim() || formData.excerpt.trim() || formData.title.trim(),
      coverImageUrl: formData.coverImageUrl.trim() || undefined,
      isPublished,
      status: formData.status,
    };

    try {
      if (modalMode === "add") {
        await adminService.createBlogPost(payload);
      } else {
        await adminService.updateBlogPost(formData.id, payload);
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch (err) {
      setModalError(err?.message || "Failed to save post to server.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      {/* Top Action & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2">
          {[
            { label: "All", count: counts.all || blogs.length },
            { label: "Published", count: counts.published },
            { label: "Draft", count: counts.draft },
          ].map((tab) => {
            const isSelected = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(tab.label)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#0066FF] text-white shadow-blue-500/20"
                    : "bg-white text-gray-700 border border-gray-200/80 hover:bg-gray-50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input + Add Post Button */}
        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-60">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search title, category..."
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
            onClick={fetchBlogs}
            title="Refresh blog posts"
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={handleOpenNewPost}
            className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
          >
            <Plus size={14} />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {/* Main Blog Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
            <p className="text-xs font-medium">Loading articles from server...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center gap-2 text-red-500">
            <AlertCircle className="w-6 h-6" />
            <p className="text-xs font-medium">{error}</p>
            <button
              type="button"
              onClick={fetchBlogs}
              className="mt-2 text-xs text-[#0066FF] font-semibold underline"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {blogs.map((blog) => {
            const isPublished = Boolean(blog.isPublished);
            const coverImage =
              blog.coverImageUrl ||
              "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=400&fit=crop&auto=format";

            return (
              <div
                key={blog._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col justify-between hover:border-gray-200 transition-all"
              >
                <div>
                  {/* Article Cover Image */}
                  <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
                    <img
                      src={coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm capitalize ${
                          isPublished
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-800 text-white"
                        }`}
                      >
                        {isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-sm">
                        {blog.category || "General"}
                      </span>
                    </div>
                  </div>

                  {/* Article Details */}
                  <div className="p-5 pb-2">
                    <h4 className="text-sm font-bold text-gray-900 tracking-tight leading-snug line-clamp-2">
                      {blog.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {blog.excerpt || "No excerpt provided."}
                    </p>
                  </div>
                </div>

                {/* Footer Meta & Controls */}
                <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                  <span className="text-[11px]">
                    {isPublished ? formatDate(blog.publishedAt) : "Draft mode"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(blog)}
                      className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-[11px] font-semibold ${
                        isPublished
                          ? "hover:bg-amber-50 hover:text-amber-700 text-gray-500 border-gray-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                      title={isPublished ? "Unpublish to Draft" : "Publish Live"}
                    >
                      {isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{isPublished ? "Draft" : "Publish"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditPost(blog)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                      title="Edit Post"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePost(blog._id, blog.title)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-400 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400 text-xs shadow-sm">
          No blog posts found matching "{activeTab}".
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT BLOG POST
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {modalMode === "edit" ? "Edit Blog Article" : "Create New Blog Article"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  POST TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Tips for Renting a Car in New York City"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                    CATEGORY *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                    PUBLICATION STATUS *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  COVER IMAGE URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.coverImageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, coverImageUrl: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  SHORT EXCERPT
                </label>
                <textarea
                  rows={2}
                  placeholder="Short summary displayed on blog cards..."
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  FULL ARTICLE CONTENT BODY *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write the full blog post content here..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed font-normal"
                />
              </div>

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
                  <span>{modalMode === "edit" ? "Save Changes" : "Create Post"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
