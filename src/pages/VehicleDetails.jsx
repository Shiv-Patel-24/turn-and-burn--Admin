import React, { useState } from "react";
import { ArrowLeft, MapPin, Camera } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const tabs = [
  "Location",
  "Car details",
  "Profile",
  "Driver's license",
  "Your goals",
  "Car availability",
  "Car photos",
  "Pricing & discounts",
];

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Location");

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className="w-80 flex flex-col gap-6 shrink-0">
        <button
          onClick={() => navigate("/fleet")}
          className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} /> Nissan Pathfinder 2025
        </button>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="h-40 bg-gray-200 relative">
            <img
              src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"
              alt="Car"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
              Listed
            </div>
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded">
              5.0 ★ (8 trips)
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg leading-tight mb-1">
              Nissan Pathfinder 2025
            </h3>
            <p className="text-gray-500 text-sm">NY • {id}</p>
            <p className="text-xs text-gray-400 mt-2">
              Last trip: May 6 - May 30
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 overflow-y-auto pb-4 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-5 py-3 rounded-lg font-medium transition-all ${activeTab === tab ? "bg-slate-900 text-white shadow-md" : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-8 shadow-sm overflow-y-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{activeTab}</h2>
        <p className="text-gray-500 mb-8">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.
        </p>

        <div className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">
              Data Field
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Update data..."
              defaultValue="Current Configuration"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">
              Additional Context
            </label>
            <textarea
              className="input-field h-32 resize-none"
              placeholder="Provide details here..."
              defaultValue="Ensuring platform compliance..."
            ></textarea>
          </div>

          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 mt-4 transition-colors">
            SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );
}
