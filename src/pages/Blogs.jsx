import React, { useState } from "react";
import {
  Plus,
  Edit2,
  EyeOff,
  Trash2,
  X,
  Image as ImageIcon,
} from "lucide-react";

const INITIAL_BLOGS = [
  {
    id: 1,
    title: "5 Tips for Renting a Car in New York City",
    excerpt:
      "Navigating New York can be overwhelming — here's what every first-time renter should know before they hit the road.",
    category: "Tips & Guides",
    date: "Aug 15, 2026",
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=400&fit=crop&auto=format",
  },
  {
    id: 2,
    title: "Why Electric Vehicles Are the Future of Car Rentals",
    excerpt:
      "With EV adoption accelerating, Turn & Burn is expanding its electric fleet to meet growing demand from eco-conscious renters.",
    category: "Industry News",
    date: "Aug 8, 2026",
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=400&fit=crop&auto=format",
  },
  {
    id: 3,
    title:
      "Understanding Damage Waivers: What You're Actually Protected Against",
    excerpt:
      "Comprehensive breakdown of rental insurance options, deductibles, and what your credit card may already cover.",
    category: "Customer Guide",
    date: "Jul 28, 2026",
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=400&fit=crop&auto=format",
  },
  {
    id: 4,
    title: "Turn & Burn Expands Fleet with 2026 BMW & Mercedes Models",
    excerpt:
      "Explore the latest luxury additions to our fleet, including performance sports sedans and executive crossovers.",
    category: "Company News",
    date: "Jul 20, 2026",
    status: "Draft",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=400&fit=crop&auto=format",
  },
];

export default function Blogs() {
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [activeTab, setActiveTab] = useState("All"); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); 
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    category: "Select...",
    status: "Draft",
    excerpt: "",
    image: "",
  });

  const publishedCount = blogs.filter((b) => b.status === "Published").length;
  const draftCount = blogs.filter((b) => b.status === "Draft").length;

  const filteredBlogs = blogs.filter((blog) => {
    if (activeTab === "All") return true;
    return blog.status === activeTab;
  });

  const handleOpenNewPost = () => {
    setModalMode("add");
    setFormData({
      id: null,
      title: "",
      category: "Select...",
      status: "Draft",
      excerpt: "",
      image: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditPost = (blog) => {
    setModalMode("edit");
    setFormData({
      id: blog.id,
      title: blog.title,
      category: blog.category,
      status: blog.status,
      excerpt: blog.excerpt,
      image: blog.image,
    });
    setIsModalOpen(true);
  };

  const handleDeletePost = (id) => {
    setBlogs(blogs.filter((b) => b.id !== id));
  };

  const handleSavePost = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newPost = {
        id: Date.now(),
        title: formData.title,
        excerpt: formData.excerpt,
        category:
          formData.category === "Select..." ? "General" : formData.category,
        status: formData.status,
        date: "Aug 20, 2026",
        image:
          formData.image ||
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=400&fit=crop&auto=format",
      };
      setBlogs([newPost, ...blogs]);
    } else {
      setBlogs(
        blogs.map((b) =>
          b.id === formData.id
            ? {
                ...b,
                title: formData.title,
                excerpt: formData.excerpt,
                category: formData.category,
                status: formData.status,
                image: formData.image,
              }
            : b,
        ),
      );
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">
            Blog Posts
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {publishedCount} published · {draftCount} drafts
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNewPost}
          className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus size={15} />
          <span>New Post</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {["All", "Published", "Draft"].map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBlogs.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-52 w-full overflow-hidden bg-gray-100">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm ${
                    post.status === "Published"
                      ? "bg-white text-[#10B981]"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {post.status}
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="bg-[#EFF6FF] text-[#0066FF] text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-gray-400">{post.date}</span>
                </div>

                <h4 className="text-sm font-bold text-gray-900 tracking-tight leading-snug">
                  {post.title}
                </h4>

                <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-50 mt-5 flex items-center justify-between">
                <button
                  type="button"
                  className="text-[#0066FF] hover:text-[#0052cc] text-xs font-semibold hover:underline"
                >
                  Preview →
                </button>

                <div className="flex items-center gap-2.5 text-gray-400">
                  <button
                    type="button"
                    onClick={() => handleOpenEditPost(post)}
                    className="hover:text-gray-700 transition-colors p-1"
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="hover:text-gray-700 transition-colors p-1"
                    title="Hide / Unpublish"
                  >
                    <EyeOff size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    className="hover:text-red-500 transition-colors p-1"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {modalMode === "edit" ? "Edit Post" : "New Blog Post"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  COVER IMAGE
                </label>

                {formData.image ? (
                  <div className="relative rounded-2xl overflow-hidden h-36 bg-gray-100 mb-2 border border-gray-200">
                    <img
                      src={formData.image}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors bg-gray-50/50 mb-2 flex flex-col items-center justify-center cursor-pointer">
                    <ImageIcon className="w-8 h-8 text-gray-300 mb-1" />
                    <p className="text-xs text-gray-400 font-medium">
                      Click to upload cover image
                    </p>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Or paste an image URL..."
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  TITLE
                </label>
                <input
                  type="text"
                  required
                  placeholder="Post title..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                    CATEGORY
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="Select...">Select...</option>
                    <option value="Tips & Guides">Tips &amp; Guides</option>
                    <option value="Industry News">Industry News</option>
                    <option value="Customer Guide">Customer Guide</option>
                    <option value="Company News">Company News</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                    STATUS
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  EXCERPT
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Short summary shown in the post list..."
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-xs font-semibold text-white shadow-sm transition-colors"
                >
                  {modalMode === "edit" ? "Save Changes" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
