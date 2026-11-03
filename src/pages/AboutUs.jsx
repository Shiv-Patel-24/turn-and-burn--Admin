import React, { useState } from "react";
import {
  Plus,
  Image as ImageIcon,
  Type,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  X,
} from "lucide-react";

const INITIAL_ABOUT_BLOCKS = [
  {
    id: 1,
    type: "IMAGE",
    label: "IMAGE BLOCK",
    orderNum: 1,
    image:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&h=500&fit=crop&auto=format",
    caption: "Our fleet — premium vehicles for every journey",
  },
  {
    id: 2,
    type: "TEXT",
    label: "TEXT BLOCK",
    orderNum: 2,
    text: "Turn & Burn Car Rental was founded in 2019 with a simple mission: make premium car rental accessible, fast, and stress-free for every driver in New York. What started as a fleet of eight vehicles has grown into a 46-car operation serving thousands of customers across the tri-state area.",
  },
  {
    id: 3,
    type: "TEXT",
    label: "TEXT BLOCK",
    orderNum: 3,
    text: "We believe renting a car should feel like stepping into your own vehicle — spotless, fully fueled, and ready for whatever journey lies ahead. Every vehicle in our fleet is maintained to dealership standards with transparent pricing and no hidden fees.",
  },
];

export default function AboutUs() {
  const [blocks, setBlocks] = useState(INITIAL_ABOUT_BLOCKS);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("TEXT"); 
  const [modalMode, setModalMode] = useState("add"); 
  const [formData, setFormData] = useState({
    id: null,
    text: "",
    image: "",
    caption: "",
  });

  const handleOpenAddText = () => {
    setModalType("TEXT");
    setModalMode("add");
    setFormData({ id: null, text: "", image: "", caption: "" });
    setIsModalOpen(true);
  };

  const handleOpenAddImage = () => {
    setModalType("IMAGE");
    setModalMode("add");
    setFormData({ id: null, text: "", image: "", caption: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (block) => {
    setModalType(block.type);
    setModalMode("edit");
    setFormData({
      id: block.id,
      text: block.text || "",
      image: block.image || "",
      caption: block.caption || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const nextBlocks = [...blocks];
    const temp = nextBlocks[index - 1];
    nextBlocks[index - 1] = nextBlocks[index];
    nextBlocks[index] = temp;
    setBlocks(nextBlocks);
  };

  const handleMoveDown = (index) => {
    if (index === blocks.length - 1) return;
    const nextBlocks = [...blocks];
    const temp = nextBlocks[index + 1];
    nextBlocks[index + 1] = nextBlocks[index];
    nextBlocks[index] = temp;
    setBlocks(nextBlocks);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newBlock = {
        id: Date.now(),
        type: modalType,
        label: modalType === "IMAGE" ? "IMAGE BLOCK" : "TEXT BLOCK",
        orderNum: blocks.length + 1,
        text: formData.text,
        image:
          formData.image ||
          "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&h=500&fit=crop&auto=format",
        caption: formData.caption,
      };
      setBlocks([...blocks, newBlock]);
    } else {
      setBlocks(
        blocks.map((b) =>
          b.id === formData.id
            ? {
                ...b,
                text: formData.text,
                image: formData.image,
                caption: formData.caption,
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
            About Us Content
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {blocks.length} blocks · drag to reorder
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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

      <div className="space-y-4">
        {blocks.map((block, idx) => (
          <div
            key={block.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-gray-50 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
              <div className="flex items-center gap-2">
                <span>{block.type === "IMAGE" ? "🌄" : "📝"}</span>
                <span>{block.label}</span>
                <span className="text-gray-300 font-normal">#{idx + 1}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-400">
                <button
                  type="button"
                  onClick={() => handleMoveUp(idx)}
                  className="hover:text-gray-600 transition-colors p-1"
                  title="Move Up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(idx)}
                  className="hover:text-gray-600 transition-colors p-1"
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
                  onClick={() => handleDelete(block.id)}
                  className="hover:text-red-500 transition-colors p-1"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {block.type === "IMAGE" ? (
                <div>
                  <div className="rounded-2xl overflow-hidden h-72 w-full bg-gray-100 shadow-sm">
                    <img
                      src={block.image}
                      alt="About Us Banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {block.caption && (
                    <p className="text-[11px] text-gray-400 text-center mt-3 font-normal">
                      {block.caption}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  {block.text}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {modalMode === "edit"
                  ? `Edit ${modalType === "IMAGE" ? "Image Block" : "Text Block"}`
                  : `Add ${modalType === "IMAGE" ? "Image Block" : "Text Block"}`}
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
              {modalType === "IMAGE" ? (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                      IMAGE URL
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                      CAPTION
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Our fleet — premium vehicles for every journey"
                      value={formData.caption}
                      onChange={(e) =>
                        setFormData({ ...formData, caption: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                    TEXT CONTENT
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Enter the paragraph text..."
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}

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
                  {modalMode === "edit" ? "Save Changes" : "Save Block"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
