import React, { useState } from "react";
import { Car } from "lucide-react";

const VEHICLES = [
  {
    id: "NYC-4821",
    name: "2023 Toyota Camry",
    driver: "Marcus Webb",
    location: "Manhattan, NY",
    locationShort: "Manhattan",
    status: "Active",
    speed: "38 mph",
    fuelLevel: "78%",
    pinX: 41,
    pinY: 27,
  },
  {
    id: "NYC-3312",
    name: "2022 Honda CR-V",
    driver: "Priya Nair",
    location: "Brooklyn, NY",
    locationShort: "Brooklyn",
    status: "Active",
    speed: "0 mph",
    fuelLevel: "52%",
    pinX: 25,
    pinY: 22,
  },
  {
    id: "NYC-9104",
    name: "2024 Ford Mustang",
    driver: "Damien Foster",
    location: "Queens, NY",
    locationShort: "Queens",
    status: "Active",
    speed: "62 mph",
    fuelLevel: "45%",
    pinX: 58,
    pinY: 26,
  },
  {
    id: "NYC-6644",
    name: "2022 Tesla Model 3",
    driver: "Elena Ruiz",
    location: "Bronx, NY",
    locationShort: "Bronx",
    status: "Active",
    speed: "28 mph",
    fuelLevel: "81%",
    pinX: 38,
    pinY: 11,
  },
  {
    id: "NYC-7715",
    name: "2023 Mercedes C-Class",
    driver: "Nia Watts",
    location: "Staten Island, NY",
    locationShort: "Staten Island",
    status: "Idle",
    speed: "0 mph",
    fuelLevel: "64%",
    pinX: 30,
    pinY: 35,
  },
];

const OTHER_PINS = [{ id: "pin-extra-1", pinX: 7, pinY: 51 }];

export default function Tracking() {
  const [selectedVehicleId, setSelectedVehicleId] = useState("NYC-4821");

  const selectedVehicle =
    VEHICLES.find((v) => v.id === selectedVehicleId) || VEHICLES[0];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#EAF2E8] rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] relative h-[420px] overflow-hidden flex flex-col justify-between">
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <rect width="100%" height="100%" fill="#E9F2E7" />
            <rect
              x="14%"
              y="28%"
              width="12%"
              height="32%"
              fill="#D5E8D2"
              rx="6"
            />
            <rect
              x="42%"
              y="60%"
              width="18%"
              height="15%"
              fill="#DDEED9"
              rx="6"
            />

            <path
              d="M 280,100 C 350,90 420,130 430,220 C 440,310 370,360 300,340 C 260,330 260,280 270,220 C 275,180 250,110 280,100 Z"
              fill="#D4E8EB"
              opacity="0.95"
            />

            <g
              stroke="#FFFFFF"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            >
              <circle cx="340" cy="220" r="140" fill="none" strokeWidth="10" />
              <circle cx="340" cy="220" r="210" fill="none" strokeWidth="9" />
              <line x1="330" y1="0" x2="330" y2="420" strokeWidth="12" />
              <line x1="120" y1="0" x2="120" y2="420" strokeWidth="9" />
              <line x1="0" y1="80" x2="600" y2="400" strokeWidth="10" />
              <line x1="200" y1="0" x2="550" y2="420" strokeWidth="7" />
              <line x1="0" y1="280" x2="600" y2="280" strokeWidth="9" />
              <line x1="0" y1="170" x2="600" y2="170" strokeWidth="8" />
              <line
                x1="20"
                y1="420"
                x2="280"
                y2="160"
                stroke="#FDE68A"
                strokeWidth="5"
              />
            </g>

            <text
              x="126"
              y="240"
              fill="#9CA3AF"
              fontSize="9"
              fontWeight="500"
              transform="rotate(90 126,240)"
            >
              High Road
            </text>
            <text
              x="210"
              y="115"
              fill="#9CA3AF"
              fontSize="9"
              fontWeight="500"
              transform="rotate(-25 210,115)"
            >
              Frank Lloyd Wright Avenue
            </text>
            <text
              x="480"
              y="295"
              fill="#9CA3AF"
              fontSize="9"
              fontWeight="500"
              transform="rotate(68 480,295)"
            >
              Glacier Ridge Road
            </text>
            <text
              x="50"
              y="380"
              fill="#9CA3AF"
              fontSize="9"
              fontWeight="500"
              transform="rotate(35 50,380)"
            >
              Century Avenue
            </text>
          </svg>

          <div className="relative z-10 m-5">
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 inline-block">
              <h3 className="text-xs font-bold text-gray-900 tracking-tight">
                Live GPS Tracking
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                5 active vehicles
              </p>
            </div>
          </div>

          {VEHICLES.map((v) => {
            const isSelected = v.id === selectedVehicleId;
            return (
              <div
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                style={{ left: `${v.pinX}%`, top: `${v.pinY}%` }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
              >
                {isSelected && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap z-30">
                    <div className="bg-[#111317] text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-xl border border-gray-800 tracking-wide flex items-center justify-center">
                      {v.id}
                    </div>
                    <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#111317] mx-auto"></div>
                  </div>
                )}

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? "bg-[#0066FF] text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-500/20 scale-110"
                      : "bg-white text-[#0066FF] border-2 border-[#0066FF] shadow-md hover:scale-105"
                  }`}
                >
                  <Car
                    size={16}
                    className={isSelected ? "text-white" : "text-[#0066FF]"}
                  />
                </div>
              </div>
            );
          })}

          {OTHER_PINS.map((pin) => (
            <div
              key={pin.id}
              style={{ left: `${pin.pinX}%`, top: `${pin.pinY}%` }}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-white text-[#0066FF] border-2 border-[#0066FF] flex items-center justify-center shadow-md">
                <Car size={14} className="text-[#0066FF]" />
              </div>
            </div>
          ))}

          <div className="relative z-10"></div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight mb-4">
              Active Trips
            </h3>

            <div className="space-y-1.5">
              {VEHICLES.map((vehicle) => {
                const isSelected = vehicle.id === selectedVehicleId;
                const isActive = vehicle.status === "Active";

                return (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#F0F6FF] border border-blue-100/80 shadow-sm"
                        : "hover:bg-gray-50/80 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 tracking-tight">
                          {vehicle.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {vehicle.driver}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {vehicle.location}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold ${
                            isActive ? "text-[#10B981]" : "text-gray-400"
                          }`}
                        >
                          {vehicle.status}
                        </span>
                        <p className="text-xs font-medium text-gray-400 mt-1">
                          {vehicle.speed}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              {selectedVehicle.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {selectedVehicle.id} · Driver: {selectedVehicle.driver}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert(`Immobilizing ${selectedVehicle.name}`)}
              className="bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Immobilize
            </button>
            <button
              type="button"
              onClick={() =>
                alert(`Opening Remote Control for ${selectedVehicle.name}`)
              }
              className="bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#0066FF] text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Remote Control
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#FAFBFD] rounded-2xl p-4 border border-gray-100/60">
            <p className="text-[11px] font-medium text-gray-400 mb-1">Speed</p>
            <p className="text-base font-bold text-gray-900">
              {selectedVehicle.speed}
            </p>
          </div>

          <div className="bg-[#FAFBFD] rounded-2xl p-4 border border-gray-100/60">
            <p className="text-[11px] font-medium text-gray-400 mb-1">
              Location
            </p>
            <p className="text-base font-bold text-gray-900">
              {selectedVehicle.locationShort}
            </p>
          </div>

          <div className="bg-[#FAFBFD] rounded-2xl p-4 border border-gray-100/60">
            <p className="text-[11px] font-medium text-gray-400 mb-1">
              Fuel Level
            </p>
            <p className="text-base font-bold text-gray-900">
              {selectedVehicle.fuelLevel}
            </p>
          </div>

          <div className="bg-[#FAFBFD] rounded-2xl p-4 border border-gray-100/60">
            <p className="text-[11px] font-medium text-gray-400 mb-1">Status</p>
            <p className="text-base font-bold text-gray-900">
              {selectedVehicle.status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
