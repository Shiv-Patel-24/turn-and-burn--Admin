import React, { useState } from "react";
import { Plus, X } from "lucide-react";

const TRANSACTIONS = [
  {
    txId: "PAY-4491",
    bookingId: "BK-7821",
    customer: "Marcus Webb",
    method: "Visa ····4821",
    date: "Aug 12, 2026",
    status: "Paid",
    amount: "$285.00",
  },
  {
    txId: "PAY-4490",
    bookingId: "BK-7820",
    customer: "Priya Nair",
    method: "Mastercard ····3312",
    date: "Aug 11, 2026",
    status: "Paid",
    amount: "$312.00",
  },
  {
    txId: "PAY-4489",
    bookingId: "BK-7819",
    customer: "Damien Foster",
    method: "Visa ····9104",
    date: "Aug 10, 2026",
    status: "Paid",
    amount: "$540.00",
  },
  {
    txId: "PAY-4488",
    bookingId: "BK-7818",
    customer: "Elena Ruiz",
    method: "Amex ····6644",
    date: "Aug 9, 2026",
    status: "Paid",
    amount: "$480.00",
  },
  {
    txId: "PAY-4487",
    bookingId: "BK-7817",
    customer: "James Okafor",
    method: "Visa ····2255",
    date: "Aug 8, 2026",
    status: "Pending",
    amount: "$620.00",
  },
  {
    txId: "PAY-4486",
    bookingId: "BK-7816",
    customer: "Sasha Petrov",
    method: "Mastercard ····7731",
    date: "Aug 9, 2026",
    status: "Refunded",
    amount: "$140.00",
  },
  {
    txId: "PAY-4485",
    bookingId: "BK-7815",
    customer: "Nia Watts",
    method: "Visa ····5598",
    date: "Aug 8, 2026",
    status: "Paid",
    amount: "$880.00",
  },
  {
    txId: "PAY-4484",
    bookingId: "BK-7814",
    customer: "Leo Chan",
    method: "Mastercard ····1173",
    date: "Aug 7, 2026",
    status: "Pending",
    amount: "$184.00",
  },
];

const INITIAL_PRICING_TIERS = [
  {
    id: 1,
    category: "Economy",
    vehicles: "Chevrolet Equinox, Hyundai Tucson",
    hourlyRate: "$14–15",
    dailyRate: "$88–95",
  },
  {
    id: 2,
    category: "Standard",
    vehicles: "Toyota Camry, Honda CR-V",
    hourlyRate: "$15–17",
    dailyRate: "$95–105",
  },
  {
    id: 3,
    category: "Premium",
    vehicles: "BMW 3 Series, Mercedes C-Class",
    hourlyRate: "$32–34",
    dailyRate: "$210–220",
  },
  {
    id: 4,
    category: "Luxury EV",
    vehicles: "Tesla Model 3",
    hourlyRate: "$25",
    dailyRate: "$160",
  },
  {
    id: 5,
    category: "Sport",
    vehicles: "Ford Mustang",
    hourlyRate: "$28",
    dailyRate: "$180",
  },
];

export default function Payments() {
  const [activeTab, setActiveTab] = useState("Transactions");
  const [tiers, setTiers] = useState(INITIAL_PRICING_TIERS);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentTier, setCurrentTier] = useState({
    id: null,
    category: "",
    vehicles: "",
    hourlyRate: "",
    dailyRate: "",
  });

  const openAddModal = () => {
    setModalMode("add");
    setCurrentTier({
      id: null,
      category: "",
      vehicles: "",
      hourlyRate: "",
      dailyRate: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tier) => {
    setModalMode("edit");
    setCurrentTier({ ...tier });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newId = Date.now();
      setTiers([...tiers, { ...currentTier, id: newId }]);
    } else {
      setTiers(tiers.map((t) => (t.id === currentTier.id ? currentTier : t)));
    }
    setIsModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return "bg-[#ECFDF5] text-[#10B981]";
      case "Pending":
        return "bg-[#FFFBEB] text-[#F59E0B]";
      case "Refunded":
        return "bg-[#F3F4F6] text-[#6B7280]";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      <div className="flex items-center gap-2.5">
        {["Transactions", "Pricing Control"].map((tab) => {
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

      {activeTab === "Transactions" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs font-normal text-gray-500 mb-1">
                Total Revenue
              </p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                $84,320
              </h3>
              <p className="text-[11px] text-gray-400 mt-2">This month</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs font-normal text-gray-500 mb-1">Pending</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                $804
              </h3>
              <p className="text-[11px] text-gray-400 mt-2">2 transactions</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs font-normal text-gray-500 mb-1">Refunded</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                $1,240
              </h3>
              <p className="text-[11px] text-gray-400 mt-2">3 refunds</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs font-normal text-gray-500 mb-1">
                Avg. Booking
              </p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                $328
              </h3>
              <p className="text-[11px] text-gray-400 mt-2">Per transaction</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100/90 text-[11px] font-semibold tracking-wider text-gray-400 uppercase select-none">
                    <th className="py-4 px-6 font-semibold">TRANSACTION</th>
                    <th className="py-4 px-6 font-semibold">CUSTOMER</th>
                    <th className="py-4 px-6 font-semibold">METHOD</th>
                    <th className="py-4 px-6 font-semibold">DATE</th>
                    <th className="py-4 px-6 font-semibold text-center">
                      STATUS
                    </th>
                    <th className="py-4 px-6 font-semibold text-right">
                      AMOUNT
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {TRANSACTIONS.map((tx) => (
                    <tr
                      key={tx.txId}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="font-medium text-gray-400">{tx.txId}</p>
                        <p className="text-[11px] text-gray-300 mt-0.5">
                          {tx.bookingId}
                        </p>
                      </td>

                      <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                        {tx.customer}
                      </td>

                      <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                        {tx.method}
                      </td>

                      <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                        {tx.date}
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold leading-tight ${getStatusBadge(tx.status)}`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-gray-900 text-right whitespace-nowrap">
                        {tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Pricing Control" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Pricing Tiers
            </h3>
            <button
              type="button"
              onClick={openAddModal}
              className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Add Tier</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold tracking-wider text-gray-400 uppercase select-none">
                  <th className="py-4 px-6 font-semibold">CATEGORY</th>
                  <th className="py-4 px-6 font-semibold">VEHICLES</th>
                  <th className="py-4 px-6 font-semibold">HOURLY RATE</th>
                  <th className="py-4 px-6 font-semibold">DAILY RATE</th>
                  <th className="py-4 px-6 font-semibold text-right">EDIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {tiers.map((tier) => (
                  <tr
                    key={tier.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                      {tier.category}
                    </td>

                    <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                      {tier.vehicles}
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                      {tier.hourlyRate}
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                      {tier.dailyRate}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(tier)}
                        className="text-[#0066FF] hover:text-[#0052cc] font-semibold text-xs transition-colors hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {modalMode === "edit"
                  ? "Edit Pricing Tier"
                  : "New Pricing Tier"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  CATEGORY NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Economy, Premium"
                  value={currentTier.category}
                  onChange={(e) =>
                    setCurrentTier({ ...currentTier, category: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                  APPLICABLE VEHICLES
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toyota Camry, Honda CR-V"
                  value={currentTier.vehicles}
                  onChange={(e) =>
                    setCurrentTier({ ...currentTier, vehicles: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                    HOURLY RATE
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $15 or $14–17"
                    value={currentTier.hourlyRate}
                    onChange={(e) =>
                      setCurrentTier({
                        ...currentTier,
                        hourlyRate: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                    DAILY RATE
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $95 or $88–105"
                    value={currentTier.dailyRate}
                    onChange={(e) =>
                      setCurrentTier({
                        ...currentTier,
                        dailyRate: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-xs font-semibold text-white shadow-sm transition-colors"
                >
                  {modalMode === "edit" ? "Save Changes" : "Add Tier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
