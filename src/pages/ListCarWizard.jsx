import React, { useState } from "react";
import { ArrowLeft, ChevronDown, Plus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default function ListCarWizard() {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [formData, setFormData] = useState({
    locationAddress: "",

    vin: "",
    olderThan1981: false,

    year: "",
    make: "",
    model: "",
    trimStyle: "",

    profilePhoto: null,

    countryCode: "+1",
    mobileNumber: "555 1722-123",
    tripUpdatesOptIn: false,

    licenseCountry: "United Status",
    licenseState: "Texas",
    licenseNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    expMonth: "",
    expDay: "",
    expYear: "",
    dobMonth: "",
    dobDay: "",
    dobYear: "",

    primaryFinancialGoal: "Select...",
    howOftenFamilyUses: "Select...",
    howOftenToShare: "Select...",

    advanceNotice: "Select...",
    minTripDuration: "1 day (recommended)",
    maxTripDuration: "2 weeks (recommended)",

    plateNumber: "",
    plateState: "State / Province",
    selectedFeatures: ["All-wheel drive", "Bluetooth", "Apple CarPlay"],
    carDescription: "",

    uploadedCarPhotos: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop&auto=format",
    ],

    standardDailyPrice: "$95",
    minPrice: "$75",
    weeklyDiscount: "10%",
  });

  const STEPS_CONFIG = [
    { num: 1, name: "Location", next: "VIN", progress: "12%" },
    { num: 2, name: "VIN", next: "Profile photo", progress: "22%" },
    { num: 3, name: "Make and model", next: "Profile photo", progress: "30%" },
    { num: 4, name: "Profile photo", next: "Mobile number", progress: "38%" },
    {
      num: 5,
      name: "Mobile number",
      next: "Driver's license",
      progress: "46%",
    },
    { num: 6, name: "Driver's license", next: "Your goals", progress: "54%" },
    { num: 7, name: "Your goals", next: "Car availability", progress: "62%" },
    { num: 8, name: "Car availability", next: "Car details", progress: "72%" },
    { num: 9, name: "Car details", next: "Car photos", progress: "80%" },
    {
      num: 10,
      name: "Car photos",
      next: "Pricing and payout",
      progress: "90%",
    },
    { num: 11, name: "Pricing and payout", next: "Finish", progress: "100%" },
  ];

  const currentMeta = STEPS_CONFIG[currentStepIndex];

  const toggleFeature = (feature) => {
    setFormData((prev) => {
      const exists = prev.selectedFeatures.includes(feature);
      const nextFeatures = exists
        ? prev.selectedFeatures.filter((f) => f !== feature)
        : [...prev.selectedFeatures, feature];
      return { ...prev, selectedFeatures: nextFeatures };
    });
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      navigate("/fleet");
    }
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS_CONFIG.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      navigate("/fleet");
    }
  };

  return (
    <div className="w-full bg-white text-left font-sans select-none min-h-full pb-16">
      <div className="w-full max-w-5xl pb-8">
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={handleBack}
            className="p-1 -ml-1 text-gray-900 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={22} className="stroke-[2.5]" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            List your car
          </h1>
        </div>

        <div className="flex items-center text-xs text-gray-500 mb-3 font-normal">
          <span>{currentMeta.num} of 11 steps</span>
          <span className="mx-2 text-gray-300 font-bold">|</span>
          <span>Next: {currentMeta.next}</span>
          <span className="mx-2 text-gray-300 font-bold">|</span>
          <button
            type="button"
            onClick={() => setCurrentStepIndex(0)}
            className="text-[#0066FF] hover:underline font-semibold"
          >
            Start over
          </button>
        </div>

        <div className="w-full bg-[#E5EEFF] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#0066FF] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: currentMeta.progress }}
          />
        </div>
      </div>

      <div className="w-full max-w-4xl">
        {currentStepIndex === 0 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Location
              </h2>
              <p className="text-xs text-gray-500 mt-2 font-normal">
                Turn and Burn needs your location to ensure we operate where you
                are.
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Where is your car located?
              </label>
              <input
                type="text"
                placeholder="Enter address"
                value={formData.locationAddress}
                onChange={(e) =>
                  setFormData({ ...formData, locationAddress: e.target.value })
                }
                className="w-full border border-gray-400 rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="bg-[#BFDBFE] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              NEXT
            </button>
          </div>
        )}

        {currentStepIndex === 1 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                VIN
              </h2>
              <p className="text-xs text-gray-500 mt-2 font-normal">
                We'll use your Vehicle Identification Number (VIN) to identify
                your specific car
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Enter your VIN
              </label>
              <input
                type="text"
                placeholder="Enter 17 digit VIN"
                maxLength={17}
                value={formData.vin}
                onChange={(e) =>
                  setFormData({ ...formData, vin: e.target.value })
                }
                className="w-full border border-gray-400 rounded-xl px-4 py-3.5 text-sm text-gray-800 uppercase font-mono"
              />
              <label className="flex items-center gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.olderThan1981}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      olderThan1981: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded border-gray-400"
                />
                <span className="text-xs text-gray-800 font-medium">
                  My vehicle is older than 1981
                </span>
              </label>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase"
            >
              NEXT
            </button>
          </div>
        )}

        {currentStepIndex === 2 && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Make and model
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-normal">
                is simply dummy text of the printing and typesetting industry.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Year
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2020"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Make
                </label>
                <input
                  type="text"
                  placeholder="e.g., BMW"
                  value={formData.make}
                  onChange={(e) =>
                    setFormData({ ...formData, make: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Model
                </label>
                <input
                  type="text"
                  placeholder="e.g., 4 Series"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="pt-2">
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Trim and style
                </h3>
                <p className="text-xs text-gray-400 mt-1 mb-2 font-normal">
                  is simply dummy text of the printing and typesetting industry.
                </p>
                <input
                  type="text"
                  value={formData.trimStyle}
                  onChange={(e) =>
                    setFormData({ ...formData, trimStyle: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase"
            >
              NEXT
            </button>
          </div>
        )}

        {currentStepIndex === 3 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Profile photo
              </h2>
              <p className="text-xs text-gray-500 mt-2 font-normal">
                Adding a photo helps hosts and guests recognize each other when
                picking up the car.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-6">
              <div className="w-28 h-28 rounded-full bg-[#E5E7EB] flex items-center justify-center text-gray-400 shadow-inner">
                <span className="text-4xl text-gray-500">📷</span>
              </div>
              <button
                type="button"
                className="text-base font-bold text-gray-900 hover:text-blue-600"
              >
                Upload profile photo
              </button>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase"
            >
              NEXT
            </button>
          </div>
        )}

        {currentStepIndex === 4 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Mobile number
              </h2>
              <p className="text-xs text-gray-500 mt-2 font-normal">
                Enter your mobile number and we'll text you a verification code.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-36">
                <label className="block text-xs font-bold text-gray-900 mb-2">
                  Country code
                </label>
                <div className="flex items-center justify-center gap-2 border border-gray-400 rounded-xl px-3 py-3 bg-white">
                  <span className="text-2xl leading-none">🇺🇸</span>
                  <span className="text-xs font-bold text-gray-800">
                    {formData.countryCode}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-900 mb-2">
                  Phone number
                </label>
                <input
                  type="text"
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, mobileNumber: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.tripUpdatesOptIn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tripUpdatesOptIn: e.target.checked,
                  })
                }
                className="w-5 h-5 text-blue-600 rounded border-gray-400"
              />
              <span className="text-xs text-gray-800 font-medium">
                Get important trip updates via text message.
              </span>
            </label>
            <button
              type="button"
              onClick={handleNext}
              className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase"
            >
              NEXT
            </button>
          </div>
        )}

        {currentStepIndex === 5 && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Driver's license
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-normal">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Issuing country
                </label>
                <div className="relative">
                  <select
                    value={formData.licenseCountry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        licenseCountry: e.target.value,
                      })
                    }
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-blue-500 pr-10"
                  >
                    <option value="United Status">United Status</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  State
                </label>
                <div className="relative">
                  <select
                    value={formData.licenseState}
                    onChange={(e) =>
                      setFormData({ ...formData, licenseState: e.target.value })
                    }
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-blue-500 pr-10"
                  >
                    <option value="Texas">Texas</option>
                    <option value="New York">New York</option>
                    <option value="California">California</option>
                    <option value="Florida">Florida</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Driver's license number
                </label>
                <input
                  type="text"
                  placeholder="Enter..."
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-900 font-medium mb-2">
                Enter your name exactly as it appears on your driver's license
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">
                    First name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">
                    Middle name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter"
                    value={formData.middleName}
                    onChange={(e) =>
                      setFormData({ ...formData, middleName: e.target.value })
                    }
                    className="w-full border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">
                    Last name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">
                Expiration date
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <select className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-500 bg-white focus:outline-none pr-10">
                    <option>Month</option>
                    {[
                      "01",
                      "02",
                      "03",
                      "04",
                      "05",
                      "06",
                      "07",
                      "08",
                      "09",
                      "10",
                      "11",
                      "12",
                    ].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                  />
                </div>
                <div className="relative">
                  <select className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-500 bg-white focus:outline-none pr-10">
                    <option>Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                  />
                </div>
                <div className="relative">
                  <select className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-500 bg-white focus:outline-none pr-10">
                    <option>Year</option>
                    {["2026", "2027", "2028", "2029", "2030"].map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">
                Date of birth
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <select className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-500 bg-white focus:outline-none pr-10">
                    <option>Month</option>
                    {[
                      "01",
                      "02",
                      "03",
                      "04",
                      "05",
                      "06",
                      "07",
                      "08",
                      "09",
                      "10",
                      "11",
                      "12",
                    ].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                  />
                </div>
                <div className="relative">
                  <select className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-500 bg-white focus:outline-none pr-10">
                    <option>Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                  />
                </div>
                <div className="relative">
                  <select className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-500 bg-white focus:outline-none pr-10">
                    <option>Year</option>
                    {["1990", "1995", "2000", "2002", "2004"].map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase"
              >
                NEXT
              </button>
            </div>
          </div>
        )}

        {currentStepIndex === 6 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Your goals
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-normal">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  What is your primary financial goal for sharing this car on
                  Turn and Burn?
                </label>
                <div className="relative">
                  <select
                    value={formData.primaryFinancialGoal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryFinancialGoal: e.target.value,
                      })
                    }
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-500 bg-white focus:outline-none pr-10"
                  >
                    <option>Select...</option>
                    <option>Build a full-time rental business</option>
                    <option>Offset vehicle ownership costs</option>
                    <option>Earn occasional supplementary income</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  How often do you or your family currently use this car?
                </label>
                <div className="relative">
                  <select
                    value={formData.howOftenFamilyUses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        howOftenFamilyUses: e.target.value,
                      })
                    }
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-500 bg-white focus:outline-none pr-10"
                  >
                    <option>Select...</option>
                    <option>Daily</option>
                    <option>A few times a week</option>
                    <option>Rarely / Spare vehicle</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  How often do you want to share your car?
                </label>
                <div className="relative">
                  <select
                    value={formData.howOftenToShare}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        howOftenToShare: e.target.value,
                      })
                    }
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-500 bg-white focus:outline-none pr-10"
                  >
                    <option>Select...</option>
                    <option>As much as possible</option>
                    <option>Part-time / Weekends only</option>
                    <option>Specific dates only</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400 font-normal">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase"
              >
                NEXT
              </button>
            </div>
          </div>
        )}

        {currentStepIndex === 7 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Car availability
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-normal">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Advance notice
              </h3>
              <p className="text-xs text-gray-600 mb-2">
                How much advance notice do you need before a trip starts?
              </p>
              <div className="relative">
                <select
                  value={formData.advanceNotice}
                  onChange={(e) =>
                    setFormData({ ...formData, advanceNotice: e.target.value })
                  }
                  className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-500 bg-white focus:outline-none pr-10"
                >
                  <option>Select...</option>
                  <option>1 hour notice</option>
                  <option>2 hours notice</option>
                  <option>12 hours notice</option>
                  <option>1 day notice</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Trip duration
              </h3>
              <p className="text-xs text-gray-600 mb-2">
                What's the shortest and longest possible trip you'll accept?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">
                    Minimum trip duration
                  </label>
                  <div className="relative">
                    <select
                      value={formData.minTripDuration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minTripDuration: e.target.value,
                        })
                      }
                      className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 bg-white focus:outline-none pr-10"
                    >
                      <option>1 day (recommended)</option>
                      <option>2 days</option>
                      <option>3 days</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">
                    Maximum trip duration
                  </label>
                  <div className="relative">
                    <select
                      value={formData.maxTripDuration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxTripDuration: e.target.value,
                        })
                      }
                      className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 bg-white focus:outline-none pr-10"
                    >
                      <option>2 weeks (recommended)</option>
                      <option>1 month</option>
                      <option>3 months</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase"
              >
                NEXT
              </button>
            </div>
          </div>
        )}

        {currentStepIndex === 8 && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Car details
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-normal">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">
                About car
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">
                    License plate number
                  </label>
                  <input
                    type="text"
                    placeholder="Plate number"
                    value={formData.plateNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, plateNumber: e.target.value })
                    }
                    className="w-full border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">
                    State
                  </label>
                  <div className="relative">
                    <select
                      value={formData.plateState}
                      onChange={(e) =>
                        setFormData({ ...formData, plateState: e.target.value })
                      }
                      className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-500 bg-white focus:outline-none pr-10"
                    >
                      <option>State / Province</option>
                      <option>New York</option>
                      <option>Texas</option>
                      <option>California</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3.5 top-3.5 text-gray-700 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Car feature
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-6">
                {CAR_FEATURES_LIST.map((col, colIdx) => (
                  <div key={colIdx} className="space-y-3">
                    {col.map((feat) => {
                      const isChecked =
                        formData.selectedFeatures.includes(feat);
                      return (
                        <label
                          key={feat}
                          className="flex items-center gap-2.5 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFeature(feat)}
                            className="w-5 h-5 text-blue-600 rounded border-gray-400 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-xs text-gray-800 font-normal">
                            {feat}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                Description
              </h3>
              <textarea
                rows={3}
                placeholder="Tell guests what makes your car unique and any special rules..."
                value={formData.carDescription}
                onChange={(e) =>
                  setFormData({ ...formData, carDescription: e.target.value })
                }
                className="w-full border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase"
              >
                NEXT
              </button>
            </div>
          </div>
        )}

        {currentStepIndex === 9 && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Car photos
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-normal max-w-3xl leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since 1966, when designers at Letraset and James
                Mosley, the librarian at St Bride Printing Library in London,
                took a 1914 Cicero translation and scrambled it to make dummy
                text for Letraset's Body Type sheets.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Car photo tips
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  {
                    angle: "Front",
                    img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300&h=200&fit=crop&auto=format",
                  },
                  {
                    angle: "3/4 Front-side",
                    img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&h=200&fit=crop&auto=format",
                  },
                  {
                    angle: "Left Side",
                    img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&h=200&fit=crop&auto=format",
                  },
                  {
                    angle: "Right Side",
                    img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&h=200&fit=crop&auto=format",
                  },
                  {
                    angle: "Back",
                    img: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=300&h=200&fit=crop&auto=format",
                  },
                ].map((tip, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-full h-24 border border-gray-300 rounded-xl overflow-hidden bg-[#FAFBFD] p-2 flex items-center justify-center">
                      <img
                        src={tip.img}
                        alt={tip.angle}
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-800 mt-2">
                      {tip.angle}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Upload your car photos
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                {formData.uploadedCarPhotos.map((url, i) => (
                  <div
                    key={i}
                    className="w-40 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group"
                  >
                    <img
                      src={url}
                      alt="Car"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                <div className="w-40 h-28 rounded-xl border border-[#93C5FD] bg-[#EFF6FF] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100/60 transition-colors">
                  <Plus size={22} className="text-[#0066FF] mb-1" />
                  <span className="text-xs font-bold text-[#0066FF]">
                    Upload photo
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase"
              >
                NEXT
              </button>
            </div>
          </div>
        )}

        {currentStepIndex === 10 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Pricing and payout
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-normal">
                Set your vehicle daily baseline rate and duration discounts.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Standard Daily Price
                </label>
                <input
                  type="text"
                  value={formData.standardDailyPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      standardDailyPrice: e.target.value,
                    })
                  }
                  className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">
                    Minimum Price
                  </label>
                  <input
                    type="text"
                    value={formData.minPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, minPrice: e.target.value })
                    }
                    className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">
                    Weekly Discount
                  </label>
                  <input
                    type="text"
                    value={formData.weeklyDiscount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weeklyDiscount: e.target.value,
                      })
                    }
                    className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase shadow-sm"
              >
                SUBMIT &amp; FINISH
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
