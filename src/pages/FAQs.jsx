import React, { useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Edit2,
  Trash2,
  X,
} from "lucide-react";

const INITIAL_FAQS = [
  {
    id: 1,
    question: "1. What is Turn and Burn?",
    answer:
      "Turn and Burn is a convenient car rental service that helps you find and book reliable vehicles for your trips, business travel, and everyday needs.",
  },
  {
    id: 2,
    question: "2. What types of cars can I rent?",
    answer:
      "We offer an extensive fleet ranging from fuel-efficient economy sedans and compact SUVs to luxury sports cars, performance coupes, and electric vehicles like Tesla.",
  },
  {
    id: 3,
    question: "3. How do I book a car?",
    answer:
      "You can easily book a car through our online platform by selecting your pickup and drop-off dates, choosing your preferred vehicle, and completing the verification checkout.",
  },
  {
    id: 4,
    question: "4. What documents do I need to rent a car?",
    answer:
      "You need a valid driver's license (domestic or international with passport), a government-issued photo ID, and an active payment method in your name.",
  },
  {
    id: 5,
    question: "5. Can I cancel or modify my booking?",
    answer:
      "Yes, bookings can be cancelled or modified up to 24 hours prior to the scheduled pickup time for a full refund or free rescheduling.",
  },
  {
    id: 6,
    question: "6. Are there mileage or usage limits?",
    answer:
      "Standard rentals include 200 miles per day. Unlimited mileage packages are available as add-ons during the checkout process.",
  },
  {
    id: 7,
    question: "7. What happens if I need help during my rental?",
    answer:
      "Our 24/7 dedicated support and roadside assistance team is always available via our app, phone line, or roadside emergency hotline.",
  },
];

export default function FAQs() {
  const [faqs, setFaqs] = useState(INITIAL_FAQS);
  const [openIds, setOpenIds] = useState([1]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    id: null,
    question: "",
    answer: "",
  });

  const toggleExpand = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setFormData({ id: null, question: "", answer: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq, e) => {
    e.stopPropagation();
    setModalMode("edit");
    setFormData({ id: faq.id, question: faq.question, answer: faq.answer });
    setIsModalOpen(true);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const nextNum = faqs.length + 1;
      const formattedQ = formData.question.match(/^\d+\./)
        ? formData.question
        : `${nextNum}. ${formData.question}`;
      const newFaq = {
        id: Date.now(),
        question: formattedQ,
        answer: formData.answer,
      };
      setFaqs([...faqs, newFaq]);
      setOpenIds([...openIds, newFaq.id]);
    } else {
      setFaqs(
        faqs.map((f) =>
          f.id === formData.id
            ? { ...f, question: formData.question, answer: formData.answer }
            : f,
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
            FAQs
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {faqs.length} Frequently Asked Questions
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus size={14} />
          <span>Add Section</span>
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map((item) => {
          const isOpen = openIds.includes(item.id);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden transition-all"
            >
              <div
                onClick={() => toggleExpand(item.id)}
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
                    {item.question}
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="hover:text-gray-600 transition-colors p-1"
                    title="Move Up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="hover:text-gray-600 transition-colors p-1"
                    title="Move Down"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleOpenEditModal(item, e)}
                    className="hover:text-gray-700 transition-colors p-1"
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="hover:text-red-500 transition-colors p-1"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-gray-500 leading-relaxed border-t border-gray-50">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {modalMode === "edit"
                  ? "Edit FAQ Question"
                  : "Add New FAQ Section"}
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
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  QUESTION
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How do I return the car?"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  ANSWER
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter the detailed answer..."
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
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
                  {modalMode === "edit" ? "Save Changes" : "Add Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
