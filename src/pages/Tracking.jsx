import React, { useState, useEffect, useCallback } from "react";
import {
  Car,
  Loader2,
  AlertCircle,
  RefreshCw,
  Fuel,
  Gauge,
  MapPin,
  ShieldAlert,
  Power,
  Sliders,
  CheckCircle2,
  Search,
} from "lucide-react";
import { adminService } from "../api/admin";

// NYC Region bounding box coordinates for projecting GPS lat/lng onto the stylized map SVG
const NYC_BOUNDS = {
  minLat: 40.55,
  maxLat: 40.9,
  minLng: -74.25,
  maxLng: -73.7,
};

function projectCoordinates(lat, lng) {
  if (!lat || !lng) return { pinX: 50, pinY: 50 };
  const pinX = ((lng - NYC_BOUNDS.minLng) / (NYC_BOUNDS.maxLng - NYC_BOUNDS.minLng)) * 100;
  // Invert Y because SVG coordinates origin (0,0) is top-left
  const pinY = ((NYC_BOUNDS.maxLat - lat) / (NYC_BOUNDS.maxLat - NYC_BOUNDS.minLat)) * 100;
  // Clamp to avoid pins overflowing outer card edges
  return {
    pinX: Math.max(8, Math.min(92, Math.round(pinX))),
    pinY: Math.max(10, Math.min(90, Math.round(pinY))),
  };
}

export default function Tracking() {
  const [telemetryList, setTelemetryList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedTelemetryId, setSelectedTelemetryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [immobilizing, setImmobilizing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch telemetry & summary from live backend
  const fetchTrackingData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const [listRes, summaryRes] = await Promise.allSettled([
        adminService.getTrackingList(),
        adminService.getTrackingSummary(),
      ]);

      if (listRes.status === "fulfilled" && listRes.value?.success) {
        const rawList = listRes.value.data || [];
        setTelemetryList(rawList);

        // Auto select first vehicle if none selected or previous selection gone
        if (rawList.length > 0) {
          setSelectedTelemetryId((prev) => {
            const exists = rawList.some((t) => t._id === prev);
            return exists ? prev : rawList[0]._id;
          });
        }
      } else if (listRes.status === "rejected") {
        throw listRes.reason;
      }

      if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
        setSummary(summaryRes.value.data);
      }
    } catch (err) {
      console.error("Failed to fetch GPS tracking telemetry:", err);
      if (!isSilent) {
        setError(err?.message || "Could not connect to tracking telemetry service.");
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrackingData();
  }, [fetchTrackingData]);

  // Periodic polling every 12 seconds for real-time fleet telemetry sync
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTrackingData(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTrackingData]);

  // Selected vehicle telemetry item
  const selectedTelemetry =
    telemetryList.find((t) => t._id === selectedTelemetryId) ||
    telemetryList[0] ||
    null;

  // Filtered trips list based on user search
  const filteredList = telemetryList.filter((item) => {
    const v = item.vehicle || {};
    const vehicleName = `${v.year || ""} ${v.make || ""} ${v.model || ""}`.toLowerCase();
    const plate = (v.licensePlate || "").toLowerCase();
    const guest = item.activeBooking?.guest
      ? `${item.activeBooking.guest.firstName || ""} ${item.activeBooking.guest.lastName || ""}`.toLowerCase()
      : "";
    const loc = (item.location?.label || "").toLowerCase();
    const query = searchFilter.toLowerCase().trim();

    return (
      vehicleName.includes(query) ||
      plate.includes(query) ||
      guest.includes(query) ||
      loc.includes(query)
    );
  });

  // Toggle Immobilize Engine via PATCH /admin/tracking/:vehicleId/immobilize
  const handleToggleImmobilize = async () => {
    if (!selectedTelemetry?.vehicle?._id) return;
    const vehicleId = selectedTelemetry.vehicle._id;
    const currentImmobilized = Boolean(selectedTelemetry.isImmobilized);
    const nextState = !currentImmobilized;

    const confirmMsg = nextState
      ? `Are you sure you want to IMMOBILIZE the engine of ${selectedTelemetry.vehicle.year} ${selectedTelemetry.vehicle.make} ${selectedTelemetry.vehicle.model} (${selectedTelemetry.vehicle.licensePlate})?`
      : `Re-enable engine operation for ${selectedTelemetry.vehicle.licensePlate}?`;

    if (!window.confirm(confirmMsg)) return;

    setImmobilizing(true);
    try {
      await adminService.setVehicleImmobilize(vehicleId, nextState);
      // Update local state optimistically
      setTelemetryList((prev) =>
        prev.map((t) =>
          t._id === selectedTelemetry._id ? { ...t, isImmobilized: nextState } : t
        )
      );
    } catch (err) {
      alert(`Immobilize control failed: ${err?.message || "Error sending command"}`);
    } finally {
      setImmobilizing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Live GPS Tracking & Telemetry
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time fleet location, speed, fuel telemetry, and remote immobilization
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              autoRefresh
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
              }`}
            />
            <span>{autoRefresh ? "Live Sync ON" : "Live Sync Paused"}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchTrackingData(false)}
            title="Refresh tracking data"
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* KPI Stats Row from backend summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Ongoing Trips
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {summary?.ongoingTrips ?? telemetryList.length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Active Online Telemetry
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {telemetryList.filter((t) => t.trackingStatus === "active").length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Fleet Distance Traveled
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {summary?.totalDistanceMiles ? `${summary.totalDistanceMiles.toLocaleString()} mi` : "780 mi"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Average Trip Duration
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {summary?.averageDurationDays ? `${summary.averageDurationDays} days` : "2.4 days"}
          </p>
        </div>
      </div>

      {/* Map & Active Trips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Stylized GPS Vector Map Card */}
        <div className="lg:col-span-2 bg-[#EAF2E8] rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] relative h-[460px] overflow-hidden flex flex-col justify-between">
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <rect width="100%" height="100%" fill="#E9F2E7" />
            <rect x="14%" y="28%" width="12%" height="32%" fill="#D5E8D2" rx="6" />
            <rect x="42%" y="60%" width="18%" height="15%" fill="#DDEED9" rx="6" />

            {/* Waterway / River */}
            <path
              d="M 280,100 C 350,90 420,130 430,220 C 440,310 370,360 300,340 C 260,330 260,280 270,220 C 275,180 250,110 280,100 Z"
              fill="#D4E8EB"
              opacity="0.95"
            />

            {/* Roads & Highways */}
            <g
              stroke="#FFFFFF"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            >
              <circle cx="340" cy="220" r="140" fill="none" strokeWidth="10" />
              <circle cx="340" cy="220" r="210" fill="none" strokeWidth="9" />
              <line x1="330" y1="0" x2="330" y2="460" strokeWidth="12" />
              <line x1="120" y1="0" x2="120" y2="460" strokeWidth="9" />
              <line x1="0" y1="80" x2="600" y2="400" strokeWidth="10" />
              <line x1="200" y1="0" x2="550" y2="460" strokeWidth="7" />
              <line x1="0" y1="280" x2="600" y2="280" strokeWidth="9" />
              <line x1="0" y1="170" x2="600" y2="170" strokeWidth="8" />
              <line x1="20" y1="460" x2="280" y2="160" stroke="#FDE68A" strokeWidth="5" />
            </g>

            {/* Street Labels */}
            <text x="126" y="240" fill="#9CA3AF" fontSize="9" fontWeight="500" transform="rotate(90 126,240)">
              FDR Drive / Manhattan
            </text>
            <text x="210" y="115" fill="#9CA3AF" fontSize="9" fontWeight="500" transform="rotate(-25 210,115)">
              Brooklyn-Queens Expy
            </text>
            <text x="480" y="295" fill="#9CA3AF" fontSize="9" fontWeight="500" transform="rotate(68 480,295)">
              Long Island Expressway
            </text>
            <text x="50" y="380" fill="#9CA3AF" fontSize="9" fontWeight="500" transform="rotate(35 50,380)">
              Staten Island Pkwy
            </text>
          </svg>

          {/* Map Status Badge Overlay */}
          <div className="relative z-10 m-5">
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 inline-block">
              <h3 className="text-xs font-bold text-gray-900 tracking-tight">
                New York City Metro Area
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {telemetryList.length} tracked fleet units active
              </p>
            </div>
          </div>

          {/* Dynamic Interactive GPS Pins */}
          {telemetryList.map((item) => {
            const isSelected = item._id === selectedTelemetryId;
            const lat = item.location?.lat;
            const lng = item.location?.lng;
            const { pinX, pinY } = projectCoordinates(lat, lng);
            const isMoving = (item.speedMph || 0) > 0;
            const isImmobilized = Boolean(item.isImmobilized);
            const plate = item.vehicle?.licensePlate || "UNIT";

            return (
              <div
                key={item._id}
                onClick={() => setSelectedTelemetryId(item._id)}
                style={{ left: `${pinX}%`, top: `${pinY}%` }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
              >
                {/* Tooltip on Selection */}
                {isSelected && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap z-30">
                    <div className="bg-[#111317] text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-xl border border-gray-800 tracking-wide flex items-center gap-1.5">
                      <span>{plate}</span>
                      <span className="text-[9px] text-gray-400 font-normal">
                        ({item.speedMph || 0} mph)
                      </span>
                    </div>
                    <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#111317] mx-auto"></div>
                  </div>
                )}

                {/* Animated Vehicle Pin */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 relative ${
                    isImmobilized
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/40 ring-4 ring-red-500/20"
                      : isSelected
                      ? "bg-[#0066FF] text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-500/20 scale-110"
                      : "bg-white text-[#0066FF] border-2 border-[#0066FF] shadow-md hover:scale-105"
                  }`}
                >
                  {isMoving && !isImmobilized && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                  <Car
                    size={16}
                    className={
                      isSelected || isImmobilized ? "text-white" : "text-[#0066FF]"
                    }
                  />
                </div>
              </div>
            );
          })}

          <div className="relative z-10 m-4 flex items-center justify-between text-[11px] text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
            </span>
            <span>Click any vehicle pin or trip in the list to inspect</span>
          </div>
        </div>

        {/* Active Trips Sidebar List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                Active Trips ({filteredList.length})
              </h3>
            </div>

            {/* Quick Search in Active Trips */}
            <div className="relative mb-3">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search plate, driver, car..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#0066FF]" />
                  <span>Loading live telemetry...</span>
                </div>
              ) : filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const isSelected = item._id === selectedTelemetryId;
                  const v = item.vehicle || {};
                  const vehicleName = `${v.year || ""} ${v.make || ""} ${v.model || ""}`.trim() || "Vehicle";
                  const guestName = item.activeBooking?.guest
                    ? `${item.activeBooking.guest.firstName || ""} ${item.activeBooking.guest.lastName || ""}`.trim()
                    : "No Guest Assigned";
                  const speed = item.speedMph ? `${item.speedMph} mph` : "0 mph";
                  const status = item.isImmobilized
                    ? "Immobilized"
                    : item.trackingStatus === "active"
                    ? "Active"
                    : "Idle";

                  return (
                    <div
                      key={item._id}
                      onClick={() => setSelectedTelemetryId(item._id)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-[#F0F6FF] border-blue-200 shadow-sm"
                          : "hover:bg-gray-50/80 border-transparent bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 tracking-tight">
                            {vehicleName}
                          </h4>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                            {v.licensePlate || "N/A"} · {guestName}
                          </p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />
                            <span>{item.location?.label || "New York, NY"}</span>
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              item.isImmobilized
                                ? "bg-red-100 text-red-600"
                                : status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {status}
                          </span>
                          <p className="text-xs font-semibold text-gray-700 mt-1 font-mono">
                            {speed}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs">
                  No active vehicles found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Vehicle Detailed Live Telemetry Card */}
      {selectedTelemetry ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  {`${selectedTelemetry.vehicle?.year || ""} ${selectedTelemetry.vehicle?.make || ""} ${selectedTelemetry.vehicle?.model || ""}`.trim()}
                </h3>
                {selectedTelemetry.isImmobilized && (
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    IMMOBILIZED
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Plate: <b className="text-gray-700">{selectedTelemetry.vehicle?.licensePlate || "N/A"}</b> · Driver:{" "}
                <b className="text-gray-700">
                  {selectedTelemetry.activeBooking?.guest
                    ? `${selectedTelemetry.activeBooking.guest.firstName || ""} ${selectedTelemetry.activeBooking.guest.lastName || ""}`.trim()
                    : "No active trip"}
                </b>{" "}
                · Booking Ref:{" "}
                <span className="font-mono text-gray-700">
                  {selectedTelemetry.activeBooking?.referenceCode || "None"}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={immobilizing}
                onClick={handleToggleImmobilize}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50 ${
                  selectedTelemetry.isImmobilized
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] border border-red-200"
                }`}
              >
                {immobilizing ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Power size={13} />
                )}
                <span>
                  {selectedTelemetry.isImmobilized ? "Enable Engine" : "Immobilize Engine"}
                </span>
              </button>
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FAFBFD] rounded-2xl p-4 border border-gray-100/60">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <Gauge size={13} />
                <p className="text-[11px] font-medium">Speed</p>
              </div>
              <p className="text-base font-bold text-gray-900 font-mono">
                {selectedTelemetry.speedMph || 0} mph
              </p>
            </div>

            <div className="bg-[#FAFBFD] rounded-2xl p-4 border border-gray-100/60">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <MapPin size={13} />
                <p className="text-[11px] font-medium">Location</p>
              </div>
              <p className="text-base font-bold text-gray-900 truncate">
                {selectedTelemetry.location?.label || "New York, NY"}
              </p>
            </div>

            <div className="bg-[#FAFBFD] rounded-2xl p-4 border border-gray-100/60">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <Fuel size={13} />
                <p className="text-[11px] font-medium">Fuel Level</p>
              </div>
              <p className="text-base font-bold text-gray-900 font-mono">
                {selectedTelemetry.fuelLevelPercent ?? 75}%
              </p>
            </div>

            <div className="bg-[#FAFBFD] rounded-2xl p-4 border border-gray-100/60">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <CheckCircle2 size={13} />
                <p className="text-[11px] font-medium">Status</p>
              </div>
              <p className="text-base font-bold text-gray-900 capitalize">
                {selectedTelemetry.isImmobilized
                  ? "Immobilized"
                  : selectedTelemetry.trackingStatus || "Idle"}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
