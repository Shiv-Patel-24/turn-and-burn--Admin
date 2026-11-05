import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Camera,
  Check,
  ChevronDown,
  Loader2,
  AlertCircle,
  Save,
  Plus,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { adminService } from "../api/admin";

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

const CAR_FEATURES_LIST = [
  [
    "All-wheel drive",
    "AUX input",
    "Blind spot warning",
    "Convertible",
    "Keyless entry",
    "Snow tires or chains",
    "USB charger",
  ],
  [
    "Android Auto",
    "Backup camera",
    "Bluetooth",
    "GPS",
    "Pet friendly",
    "Sunroof",
    "USB input",
  ],
  [
    "Apple CarPlay",
    "Bike rack",
    "Child seat",
    "Heated seats",
    "Ski rack",
    "Toll pass",
    "Wheelchair accessible",
  ],
];

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Location");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [vehicle, setVehicle] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Location
    locationAddress: "",
    city: "",
    state: "",
    zipCode: "",

    // Car details
    make: "",
    model: "",
    year: "",
    trimStyle: "",
    vin: "",
    licensePlate: "",
    plateState: "",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    doors: 4,
    features: [],
    description: "",

    // Profile / Host details
    hostName: "",
    hostEmail: "",
    hostPhone: "",

    // Driver's license
    licenseCountry: "United States",
    licenseState: "Texas",
    licenseNumber: "",
    licenseFirstName: "",
    licenseLastName: "",
    licenseExpDate: "",

    // Goals
    financialGoal: "Build a full-time rental business",
    usageFrequency: "Rarely / Spare vehicle",
    shareFrequency: "As much as possible",

    // Availability
    advanceNotice: "1 day notice",
    minTripDuration: "1 day (recommended)",
    maxTripDuration: "2 weeks (recommended)",
    operationalStatus: "available",
    listingStatus: "listed",

    // Photos
    photos: [],

    // Pricing & discounts
    dailyRate: 65,
    hourlyRate: 15,
    minPrice: 30,
    maxPrice: 150,
    automaticPricing: true,
  });

  useEffect(() => {
    async function loadVehicle() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await adminService.getFleetVehicle(id);
        const v = res?.data?.vehicle || res?.data || res;
        setVehicle(v);

        // Populate form data
        setFormData({
          locationAddress:
            v.location?.address || v.streetAddress || v.address || "",
          city: v.location?.city || v.city || "New York",
          state: v.location?.state || v.state || "NY",
          zipCode: v.location?.zipCode || v.zipCode || "",

          make: v.make || "",
          model: v.model || "",
          year: v.year || "",
          trimStyle: v.trim || v.trimStyle || v.category || "",
          vin: v.vin || "",
          licensePlate: v.licensePlate || v.plateNumber || "",
          plateState: v.plateState || v.registrationState || "New York",
          transmission: v.transmission || "Automatic",
          fuelType: v.fuelType || "Gasoline",
          seats: v.seats || 5,
          doors: v.doors || 4,
          features: Array.isArray(v.features) ? v.features : [],
          description: v.description || "",

          hostName:
            v.host?.fullName ||
            v.hostName ||
            `${v.host?.firstName || ""} ${v.host?.lastName || ""}`.trim() ||
            "Turn & Burn Operations",
          hostEmail: v.host?.email || v.hostEmail || "ops@turnandburn.com",
          hostPhone: v.host?.phone || v.hostPhone || "+1 (555) 019-2834",

          licenseCountry: v.driverLicense?.country || "United States",
          licenseState: v.driverLicense?.state || "Texas",
          licenseNumber: v.driverLicense?.number || "TX-94829104",
          licenseFirstName: v.driverLicense?.firstName || "John",
          licenseLastName: v.driverLicense?.lastName || "Doe",
          licenseExpDate: v.driverLicense?.expirationDate || "2028-11-20",

          financialGoal:
            v.goals?.financialGoal || "Build a full-time rental business",
          usageFrequency:
            v.goals?.usageFrequency || "Rarely / Spare vehicle",
          shareFrequency:
            v.goals?.shareFrequency || "As much as possible",

          advanceNotice: v.availability?.advanceNotice || "1 day notice",
          minTripDuration:
            v.availability?.minTripDuration || "1 day (recommended)",
          maxTripDuration:
            v.availability?.maxTripDuration || "2 weeks (recommended)",
          operationalStatus: v.operationalStatus || "available",
          listingStatus: v.listingStatus || "listed",

          photos:
            v.photos && v.photos.length > 0
              ? v.photos
              : [
                  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
                ],

          dailyRate: v.pricing?.dailyRate || v.dailyRate || 65,
          hourlyRate: v.pricing?.hourlyRate || v.hourlyRate || 15,
          minPrice: v.pricing?.minPrice || 30,
          maxPrice: v.pricing?.maxPrice || 150,
          automaticPricing:
            v.pricing?.automaticPricing !== undefined
              ? v.pricing.automaticPricing
              : true,
        });
      } catch (err) {
        console.error("Failed to load vehicle:", err);
        setError(err.message || "Failed to load vehicle details.");
      } finally {
        setLoading(false);
      }
    }

    loadVehicle();
  }, [id]);

  const toggleFeature = (feat) => {
    setFormData((prev) => {
      const exists = prev.features.includes(feat);
      return {
        ...prev,
        features: exists
          ? prev.features.filter((f) => f !== feat)
          : [...prev.features, feat],
      };
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg("");
    try {
      const payload = {
        make: formData.make,
        model: formData.model,
        year: Number(formData.year) || formData.year,
        category: formData.trimStyle,
        vin: formData.vin,
        licensePlate: formData.licensePlate,
        features: formData.features,
        description: formData.description,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        seats: Number(formData.seats),
        location: {
          address: formData.locationAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        pricing: {
          dailyRate: Number(formData.dailyRate),
          hourlyRate: Number(formData.hourlyRate),
          minPrice: Number(formData.minPrice),
          maxPrice: Number(formData.maxPrice),
          automaticPricing: formData.automaticPricing,
        },
        operationalStatus: formData.operationalStatus,
        listingStatus: formData.listingStatus,
      };

      await adminService.updateFleetVehicle(id, payload);
      setSuccessMsg("Changes saved successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save vehicle changes.");
    } finally {
      setSaving(false);
    }
  };

  const vehicleTitle =
    formData.make || formData.model
      ? `${formData.year ? formData.year + " " : ""}${formData.make} ${formData.model}`.trim()
      : vehicle?.name || "Nissan Pathfinder 2025";

  const mainPhoto =
    formData.photos && formData.photos.length > 0
      ? formData.photos[0]
      : "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800";

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      {/* LEFT SIDEBAR */}
      <div className="w-full lg:w-80 flex flex-col gap-5 shrink-0">
        <button
          onClick={() => navigate("/fleet")}
          className="flex items-center gap-2 text-xl font-extrabold text-gray-900 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} /> {vehicleTitle}
        </button>

        {/* Vehicle Preview Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="h-44 bg-gray-100 relative">
            <img
              src={mainPhoto}
              alt={vehicleTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800";
              }}
            />
            <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow">
              {formData.listingStatus === "listed" ? "Listed" : "Unlisted"}
            </div>
            <div className="absolute bottom-2 right-2 bg-black/65 text-white text-xs font-medium px-2.5 py-1 rounded backdrop-blur-xs">
              5.0 ★ (8 trips)
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-extrabold text-lg text-gray-900 leading-tight mb-1">
              {vehicleTitle}
            </h3>
            <p className="text-gray-500 text-xs font-medium">
              {formData.city || "NY"} • {formData.licensePlate || id}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Status: <span className="font-semibold capitalize text-gray-700">{formData.operationalStatus}</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-2 overflow-y-auto pb-4 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === tab
                  ? "bg-slate-900 text-white shadow-md font-semibold"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 size={36} className="animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium">Loading car details...</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="border-b border-gray-100 pb-5 mb-6">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                {activeTab}
              </h2>
              <p className="text-xs md:text-sm text-gray-400 mt-1">
                Manage and review {activeTab.toLowerCase()} configuration for this vehicle.
              </p>
            </div>

            {/* Notification messages */}
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                <Check size={18} className="text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* DYNAMIC TAB CONTENT */}
            <div className="max-w-3xl">
              {/* TAB 1: LOCATION */}
              {activeTab === "Location" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Where is your car located? (Street Address)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 123 Main Street"
                      value={formData.locationAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          locationAddress: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        State
                      </label>
                      <input
                        type="text"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        placeholder="Zip Code"
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CAR DETAILS */}
              {activeTab === "Car details" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Year
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2025"
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Make
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Nissan"
                        value={formData.make}
                        onChange={(e) =>
                          setFormData({ ...formData, make: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Model
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pathfinder"
                        value={formData.model}
                        onChange={(e) =>
                          setFormData({ ...formData, model: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Trim &amp; Style / Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Platinum 4WD / SUV"
                        value={formData.trimStyle}
                        onChange={(e) =>
                          setFormData({ ...formData, trimStyle: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        VIN (Vehicle Identification Number)
                      </label>
                      <input
                        type="text"
                        placeholder="17-character VIN"
                        value={formData.vin}
                        onChange={(e) =>
                          setFormData({ ...formData, vin: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 font-mono uppercase focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        License Plate Number
                      </label>
                      <input
                        type="text"
                        placeholder="License Plate"
                        value={formData.licensePlate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            licensePlate: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 font-mono uppercase focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Plate State / Province
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. NY"
                        value={formData.plateState}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            plateState: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Transmission
                      </label>
                      <select
                        value={formData.transmission}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            transmission: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-3 py-3 text-xs bg-white text-gray-800 focus:outline-none"
                      >
                        <option>Automatic</option>
                        <option>Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Fuel Type
                      </label>
                      <select
                        value={formData.fuelType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fuelType: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-3 py-3 text-xs bg-white text-gray-800 focus:outline-none"
                      >
                        <option>Gasoline</option>
                        <option>Diesel</option>
                        <option>Electric</option>
                        <option>Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Seats
                      </label>
                      <input
                        type="number"
                        value={formData.seats}
                        onChange={(e) =>
                          setFormData({ ...formData, seats: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl px-3 py-3 text-xs text-gray-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Doors
                      </label>
                      <input
                        type="number"
                        value={formData.doors}
                        onChange={(e) =>
                          setFormData({ ...formData, doors: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl px-3 py-3 text-xs text-gray-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Features Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-2">
                      Vehicle Features &amp; Amenities
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      {CAR_FEATURES_LIST.map((col, colIdx) => (
                        <div key={colIdx} className="space-y-2.5">
                          {col.map((feat) => {
                            const isChecked = formData.features.includes(feat);
                            return (
                              <label
                                key={feat}
                                className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-800"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleFeature(feat)}
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span>{feat}</span>
                              </label>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Description &amp; Vehicle Story
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Add public description of the car..."
                      className="w-full border border-gray-300 rounded-xl p-3.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: PROFILE */}
              {activeTab === "Profile" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-extrabold text-xl flex items-center justify-center">
                      {formData.hostName
                        ? formData.hostName.charAt(0).toUpperCase()
                        : "H"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {formData.hostName || "Host Profile"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Assigned Vehicle Owner / Host Account
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Host Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.hostName}
                        onChange={(e) =>
                          setFormData({ ...formData, hostName: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Host Email
                      </label>
                      <input
                        type="email"
                        value={formData.hostEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hostEmail: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={formData.hostPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, hostPhone: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: DRIVER'S LICENSE */}
              {activeTab === "Driver's license" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Issuing Country
                      </label>
                      <input
                        type="text"
                        value={formData.licenseCountry}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            licenseCountry: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Issuing State
                      </label>
                      <input
                        type="text"
                        value={formData.licenseState}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            licenseState: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Driver License Number
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          licenseNumber: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 font-mono uppercase focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        First Name (on license)
                      </label>
                      <input
                        type="text"
                        value={formData.licenseFirstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            licenseFirstName: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Last Name (on license)
                      </label>
                      <input
                        type="text"
                        value={formData.licenseLastName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            licenseLastName: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: YOUR GOALS */}
              {activeTab === "Your goals" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      What is the primary financial goal for sharing this car?
                    </label>
                    <div className="relative">
                      <select
                        value={formData.financialGoal}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            financialGoal: e.target.value,
                          })
                        }
                        className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none pr-10"
                      >
                        <option>Build a full-time rental business</option>
                        <option>Offset vehicle ownership costs</option>
                        <option>Earn occasional supplementary income</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3.5 top-3.5 text-gray-500 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      How often do you or your family currently use this car?
                    </label>
                    <div className="relative">
                      <select
                        value={formData.usageFrequency}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            usageFrequency: e.target.value,
                          })
                        }
                        className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none pr-10"
                      >
                        <option>Daily</option>
                        <option>A few times a week</option>
                        <option>Rarely / Spare vehicle</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3.5 top-3.5 text-gray-500 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      How often do you want to share your car?
                    </label>
                    <div className="relative">
                      <select
                        value={formData.shareFrequency}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shareFrequency: e.target.value,
                          })
                        }
                        className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none pr-10"
                      >
                        <option>As much as possible</option>
                        <option>Part-time / Weekends only</option>
                        <option>Specific dates only</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3.5 top-3.5 text-gray-500 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: CAR AVAILABILITY */}
              {activeTab === "Car availability" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Operational Status
                      </label>
                      <select
                        value={formData.operationalStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            operationalStatus: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white text-gray-800 focus:outline-none"
                      >
                        <option value="available">Available</option>
                        <option value="rented">Rented / In Service</option>
                        <option value="maintenance">Under Maintenance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Listing Visibility
                      </label>
                      <select
                        value={formData.listingStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            listingStatus: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white text-gray-800 focus:outline-none"
                      >
                        <option value="listed">Listed (Visible to Renters)</option>
                        <option value="unlisted">Unlisted (Hidden)</option>
                        <option value="snoozed">Snoozed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Advance Notice Before Trip
                    </label>
                    <select
                      value={formData.advanceNotice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          advanceNotice: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white text-gray-800 focus:outline-none"
                    >
                      <option>1 hour notice</option>
                      <option>2 hours notice</option>
                      <option>12 hours notice</option>
                      <option>1 day notice</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Minimum Trip Duration
                      </label>
                      <select
                        value={formData.minTripDuration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minTripDuration: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white text-gray-800 focus:outline-none"
                      >
                        <option>1 day (recommended)</option>
                        <option>2 days</option>
                        <option>3 days</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Maximum Trip Duration
                      </label>
                      <select
                        value={formData.maxTripDuration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxTripDuration: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white text-gray-800 focus:outline-none"
                      >
                        <option>2 weeks (recommended)</option>
                        <option>1 month</option>
                        <option>3 months</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: CAR PHOTOS */}
              {activeTab === "Car photos" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-2">
                      Current Vehicle Photos
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">
                      High resolution exterior and interior photos of this vehicle.
                    </p>

                    <div className="flex flex-wrap gap-4">
                      {formData.photos.map((url, idx) => (
                        <div
                          key={idx}
                          className="w-44 h-32 rounded-xl overflow-hidden border border-gray-200 relative group bg-gray-50"
                        >
                          <img
                            src={url}
                            alt={`Car photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                photos: formData.photos.filter((_, i) => i !== idx),
                              })
                            }
                            className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 shadow transition-opacity"
                            title="Remove photo"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      <label className="w-44 h-32 rounded-xl border border-dashed border-blue-400 bg-blue-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors">
                        <Camera size={24} className="text-blue-600 mb-1" />
                        <span className="text-xs font-bold text-blue-600">
                          Add Photo URL
                        </span>
                        <input
                          type="button"
                          onClick={() => {
                            const newUrl = prompt("Enter Image URL:");
                            if (newUrl) {
                              setFormData({
                                ...formData,
                                photos: [...formData.photos, newUrl.trim()],
                              });
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: PRICING & DISCOUNTS */}
              {activeTab === "Pricing & discounts" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">
                          Automatic Dynamic Pricing
                        </h4>
                        <p className="text-xs text-gray-500">
                          Boost earnings by letting pricing automatically adapt to demand and seasonality.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            automaticPricing: !formData.automaticPricing,
                          })
                        }
                        className={`w-14 h-7 rounded-full p-1 transition-colors relative flex items-center ${
                          formData.automaticPricing ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                            formData.automaticPricing ? "translate-x-7" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Standard Daily Rate ($/day)
                      </label>
                      <input
                        type="number"
                        value={formData.dailyRate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dailyRate: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Standard Hourly Rate ($/hr)
                      </label>
                      <input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hourlyRate: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Minimum Daily Price ($)
                      </label>
                      <input
                        type="number"
                        value={formData.minPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minPrice: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Maximum Daily Price ($)
                      </label>
                      <input
                        type="number"
                        value={formData.maxPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxPrice: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SAVE BUTTON */}
              <div className="pt-8 border-t border-gray-100 mt-8">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> SAVING...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> SAVE CHANGES
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
