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

const INITIAL_TERMS_SECTIONS = [
  {
    id: 1,
    title: "1. Eligibility & Driver Requirements",
    content:
      "To rent a vehicle from Turn & Burn Car Rental, you must be at least 21 years of age and hold a valid driver's license issued in the United States, Canada, or an internationally recognized license with a valid passport. Drivers between 21–24 years of age may be subject to a young driver surcharge. All drivers must present a valid credit or debit card in their name at the time of vehicle pickup. Turn & Burn reserves the right to deny rental to any individual whose driving record presents unacceptable risk.",
  },
  {
    id: 2,
    title: "2. Reservations & Booking Policy",
    content:
      "Reservations are confirmed upon payment authorization. Vehicle makes and models are subject to fleet availability and may be substituted with a vehicle of equivalent or superior category at no additional cost.",
  },
  {
    id: 3,
    title: "3. Pricing, Fees & Payment",
    content:
      "Rental rates include base daily or hourly charges plus mandatory state/local taxes. Incidental holds are placed on the driver's card at vehicle release and cleared upon return inspection.",
  },
  {
    id: 4,
    title: "4. Vehicle Use & Prohibited Activities",
    content:
      "Vehicles may not be operated off-road, for commercial racing, rideshare without authorization, or outside permitted geographic zones outlined in the rental agreement.",
  },
  {
    id: 5,
    title: "5. Damage, Loss & Insurance",
    content:
      "Renters are responsible for all physical damage, vandalism, or theft during the rental period unless an optional Collision Damage Waiver (CDW) was purchased prior to trip start.",
  },
  {
    id: 6,
    title: "6. Cancellation & Refund Policy",
    content:
      "Cancellations made more than 24 hours prior to scheduled pickup receive a 100% refund. Cancellations inside 24 hours are subject to a one-day rental fee.",
  },
  {
    id: 7,
    title: "7. Privacy & Data Policy",
    content:
      "We respect your privacy. Vehicle telemetry data (GPS, speed, odometer) is recorded solely for safety, roadside assistance, and fleet asset security purposes.",
  },
];

export default function Terms() {
  const [sections, setSections] = useState(INITIAL_TERMS_SECTIONS);
  const [openIds, setOpenIds] = useState([1]); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    content: "",
  });

  const toggleExpand = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setFormData({ id: null, title: "", content: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sec, e) => {
    e.stopPropagation();
    setModalMode("edit");
    setFormData({ id: sec.id, title: sec.title, content: sec.content });
    setIsModalOpen(true);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const nextNum = sections.length + 1;
      const formattedTitle = formData.title.match(/^\d+\./)
        ? formData.title
        : `${nextNum}. ${formData.title}`;
      const newSec = {
        id: Date.now(),
        title: formattedTitle,
        content: formData.content,
      };
      setSections([...sections, newSec]);
      setOpenIds([...openIds, newSec.id]);
    } else {
      setSections(
        sections.map((s) =>
          s.id === formData.id
            ? { ...s, title: formData.title, content: formData.content }
            : s,
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
            Terms &amp; Conditions
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {sections.length} sections · Last updated Aug 20, 2026
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
        {sections.map((sec) => {
          const isOpen = openIds.includes(sec.id);

          return (
            <div
              key={sec.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden transition-all"
            >
              <div
                onClick={() => toggleExpand(sec.id)}
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
                    onClick={(e) => handleOpenEditModal(sec, e)}
                    className="hover:text-gray-700 transition-colors p-1"
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(sec.id, e)}
                    className="hover:text-red-500 transition-colors p-1"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-gray-500 leading-relaxed border-t border-gray-50">
                  {sec.content}
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
                {modalMode === "edit" ? "Edit Section" : "Add Terms Section"}
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
                  SECTION TITLE
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8. Return Policies & Penalties"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  CONTENT
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Enter the section terms and details..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
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
