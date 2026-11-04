import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  Check,
  Loader2,
  AlertCircle,
  Upload,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../api/admin";

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

  // Submitting states
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Real Image Uploads
  const [selectedPhotoFiles, setSelectedPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  // Form State strictly adhering to the Figma design
  const [formData, setFormData] = useState({
    // Step 1: Location
    locationAddress: "",

    // Step 2: VIN
    vin: "",
    olderThan1981: false,

    // Step 3: Make and model
    year: "",
    make: "",
    model: "",
    trimStyle: "",

    // Step 4: Profile photo
    profilePhoto: null,

    // Step 5: Mobile number & OTP
    countryCode: "+1",
    mobileNumber: "555 1722-123",
    otp: "",
    otpVerified: false,
    tripUpdatesOptIn: false,

    // Step 6: Driver's license
    licenseCountry: "United Status",
    licenseState: "Texas",
    licenseNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    expMonth: "Month",
    expDay: "Day",
    expYear: "Year",
    dobMonth: "Month",
    dobDay: "Day",
    dobYear: "Year",

    // Step 7: Your goals
    primaryFinancialGoal: "Select...",
    howOftenFamilyUses: "Select...",
    howOftenToShare: "Select...",

    // Step 8: Car availability
    advanceNotice: "Select...",
    minTripDuration: "1 day (recommended)",
    maxTripDuration: "2 weeks (recommended)",

    // Step 9: Car details
    plateNumber: "",
    plateState: "State / Province",
    selectedFeatures: [
      "All-wheel drive",
      "Bluetooth",
      "Apple CarPlay",
      "Backup camera",
    ],
    carDescription: "",

    // Step 10: Car photos
    uploadedPhotos: [],

    // Step 11: Pricing & discounts / Payout
    automaticPricing: true,
    maxPrice: "100",
    minPrice: "30",
    standardDailyPrice: "65",

    // Step 12 (10 of 11): Terms and conditions
    termsAgreed: [true, true, true, true],

    // Step 13 (11 of 11): Acknowledgment
    acknowledgmentAccepted: false,
  });

  // Steps configuration exactly matching user uploaded Figma sequence:
  // 1: Location -> Next: VIN
  // 2: VIN -> Next: Profile photo (Wait, Make & Model in between!)
  // In the design screenshots:
  // Step 1: Location (1 of 11 | Next: VIN)
  // Step 2: VIN (1 of 11 | Next: Profile photo)
  // Step 3: Make and model (1 of 11 | Next: Profile photo)
  // Step 4: Profile photo (2 of 11 | Next: Mobile number)
  // Step 5: Mobile number (3 of 11 | Next: Driver's license)
  // Step 6: Driver's license (4 of 11 | Next: Your goals)
  // Step 7: Your goals (5 of 11 | Next: Car availability)
  // Step 8: Car availability (6 of 11 | Next: Car details)
  // Step 9: Car details (7 of 11 | Next: Car photos)
  // Step 10: Car photos (8 of 11 | Next: Pricing and payout)
  // Step 11: Pricing & discounts (9 of 11 | Next: Terms and conditions)
  // Step 12: Terms and conditions (10 of 11 | Next: Acknowledgment)
  // Step 13: Acknowledgment (11 of 11 | SAVE)
  const STEPS_CONFIG = [
    { num: "1 of 11", name: "Location", next: "VIN", progress: "9%" },
    { num: "1 of 11", name: "VIN", next: "Make and model", progress: "18%" },
    { num: "1 of 11", name: "Make and model", next: "Profile photo", progress: "27%" },
    { num: "2 of 11", name: "Profile photo", next: "Mobile number", progress: "36%" },
    { num: "3 of 11", name: "Mobile number", next: "Driver's license", progress: "45%" },
    { num: "4 of 11", name: "Driver's license", next: "Your goals", progress: "54%" },
    { num: "5 of 11", name: "Your goals", next: "Car availability", progress: "63%" },
    { num: "6 of 11", name: "Car availability", next: "Car details", progress: "72%" },
    { num: "7 of 11", name: "Car details", next: "Car photos", progress: "81%" },
    { num: "8 of 11", name: "Car photos", next: "Pricing and payout", progress: "90%" },
    { num: "9 of 11", name: "Pricing and payout", next: "Terms and conditions", progress: "94%" },
    { num: "10 of 11", name: "Terms and conditions", next: "Acknowledgment", progress: "97%" },
    { num: "11 of 11", name: "Acknowledgment", next: "Finish", progress: "100%" },
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

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setSelectedPhotoFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemovePhoto = (index) => {
    setSelectedPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      navigate("/fleet");
    }
  };

  const handleNext = async () => {
    if (currentStepIndex < STEPS_CONFIG.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Final Step (Acknowledgment): Submit to backend dynamically
      setSubmitting(true);
      setSubmitError("");
      try {
        const cleanDailyRate =
          Number(String(formData.standardDailyPrice).replace(/[^0-9.]/g, "")) ||
          Number(formData.minPrice) ||
          75;
        const cleanHourlyRate = Math.max(5, Math.round(cleanDailyRate / 18));
        const cleanYear = Number(formData.year) || 2024;

        const plate =
          formData.plateNumber.trim() ||
          `NYC-${Math.floor(1000 + Math.random() * 8999)}`;

        const payload = {
          make: formData.make.trim() || "Toyota",
          model: formData.model.trim() || "Camry",
          year: cleanYear,
          registration: plate,
          fuelType: "Gasoline",
          dailyRate: cleanDailyRate,
          hourlyRate: cleanHourlyRate,
          style: formData.trimStyle || "Sedan",
          category: "regular",
          color: "Black",
          transmission: "Automatic",
          seats: 5,
          odometer: 1000,
          vin:
            formData.vin.trim().length === 17
              ? formData.vin.trim().toUpperCase()
              : undefined,
          city: "New York",
          address: formData.locationAddress || "Manhattan, NY",
          description:
            formData.carDescription ||
            `${cleanYear} ${formData.make || "Toyota"} ${formData.model || "Camry"} available for booking.`,
          status: "available",
          listingStatus: "listed",
          approvalStatus: "approved",
        };

        const res = await adminService.createFleetVehicle(payload);
        const createdVehicle = res?.data;

        // If photos were selected, upload them to Cloudinary for this vehicle
        if (createdVehicle?._id && selectedPhotoFiles.length > 0) {
          try {
            const angles = selectedPhotoFiles.map((_, i) =>
              i === 0 ? "front" : "other"
            );
            await adminService.uploadVehiclePhotos(
              createdVehicle._id,
              selectedPhotoFiles,
              angles
            );
          } catch (uploadErr) {
            console.warn("Photos upload warning:", uploadErr);
          }
        }

        navigate("/fleet");
      } catch (err) {
        setSubmitError(err.message || "Failed to create vehicle in backend.");
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full bg-white text-left font-sans select-none min-h-full pb-16">
      {/* Wizard Header matching Figma */}
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
          <span>{currentMeta.num} steps</span>
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
        {/* STEP 1: Location */}
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
              className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white ${
                formData.locationAddress.trim()
                  ? "bg-[#0066FF] hover:bg-[#0052cc]"
                  : "bg-[#BFDBFE]"
              }`}
            >
              NEXT
            </button>
          </div>
        )}

        {/* STEP 2: VIN */}
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

        {/* STEP 3: Make and model */}
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

        {/* STEP 4: Profile photo */}
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

        {/* STEP 5: Mobile number & OTP */}
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

            <div>
              <button
                type="button"
                className="text-xs font-semibold text-[#0066FF] hover:underline"
              >
                Change phone number.
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">
                Enter your OTP
              </label>
              <input
                type="text"
                placeholder="Enter"
                value={formData.otp}
                onChange={(e) =>
                  setFormData({ ...formData, otp: e.target.value })
                }
                className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <button
                type="button"
                className="text-xs font-semibold text-[#0066FF] hover:underline"
              >
                Re-send OTP
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

        {/* STEP 6: Driver's license */}
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
                  <select
                    value={formData.expMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, expMonth: e.target.value })
                    }
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-500 bg-white focus:outline-none pr-10"
                  >
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
                  <select
                    value={formData.expDay}
                    onChange={(e) =>
                      setFormData({ ...formData, expDay: e.target.value })
                    }
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-500 bg-white focus:outline-none pr-10"
                  >
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
                  <select
                    value={formData.expYear}
                    onChange={(e) =>
                      setFormData({ ...formData, expYear: e.target.value })
                    }
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-500 bg-white focus:outline-none pr-10"
                  >
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
                  <select
                    value={formData.dobMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, dobMonth: e.target.value })
                    }
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-500 bg-white focus:outline-none pr-10"
                  >
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
                  <select
                    value={formData.dobDay}
                    onChange={(e) =>
                      setFormData({ ...formData, dobDay: e.target.value })
                    }
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-500 bg-white focus:outline-none pr-10"
                  >
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
                  <select
                    value={formData.dobYear}
                    onChange={(e) =>
                      setFormData({ ...formData, dobYear: e.target.value })
                    }
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs font-medium text-gray-500 bg-white focus:outline-none pr-10"
                  >
                    <option>Year</option>
                    {["1985", "1990", "1995", "2000", "2002", "2004"].map((y) => (
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

        {/* STEP 7: Your goals */}
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
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-700 bg-white focus:outline-none pr-10"
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
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-700 bg-white focus:outline-none pr-10"
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
                    className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-700 bg-white focus:outline-none pr-10"
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

        {/* STEP 8: Car availability */}
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
                  className="w-full appearance-none border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-700 bg-white focus:outline-none pr-10"
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

        {/* STEP 9: Car details */}
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
                    className="w-full border border-gray-400 rounded-xl px-4 py-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono uppercase"
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
                placeholder="Please describe your car details..."
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

        {/* STEP 10: Car photos matching Figma Image */}
        {currentStepIndex === 9 && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Car photos
              </h2>
              <p className="text-xs text-gray-500 mt-1 font-normal max-w-3xl leading-relaxed">
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
              <div className="w-full border border-gray-200 rounded-2xl overflow-hidden p-2 bg-[#FAFBFD]">
                <img
                  src="/images/helpful-tips.png"
                  alt="Car photo tips"
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Upload your car photos
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                {/* Default Nissan GTR photo preview from design */}
                <div className="w-40 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group bg-gray-100">
                  <img
                    src="/images/gtr-blue.jpg"
                    alt="Car"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop&auto=format";
                    }}
                  />
                </div>

                {/* Newly selected real photo previews */}
                {photoPreviews.map((photo, i) => (
                  <div
                    key={i}
                    className="w-40 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group bg-gray-100"
                  >
                    <img
                      src={photo.url}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute top-1.5 right-1.5 bg-rose-600 text-white p-1 rounded-full shadow-md"
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Upload Photo Button */}
                <label className="w-40 h-28 rounded-xl border border-[#93C5FD] bg-[#EFF6FF] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100/60 transition-colors">
                  <Plus size={22} className="text-[#0066FF] mb-1" />
                  <span className="text-xs font-bold text-[#0066FF]">
                    Upload photo
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
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

        {/* STEP 11: Pricing & discounts / Payout matching Figma */}
        {currentStepIndex === 10 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Pricing &amp; discounts
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-normal">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Automatic Pricing
                </h3>
                <p className="text-xs text-gray-600 mb-3 font-normal">
                  Boost earning by letting your price automatically adjust to match demand.
                </p>
                {/* Switch toggle */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      automaticPricing: !formData.automaticPricing,
                    })
                  }
                  className={`w-14 h-7 rounded-full p-1 transition-colors relative flex items-center ${
                    formData.automaticPricing ? "bg-[#0066FF]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      formData.automaticPricing ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Price range
                </h3>
                <p className="text-xs text-gray-600 mb-3 font-normal leading-relaxed">
                  Set your minimum and maximum daily price, and Automatic Pricing will adapt your price within that range. Prices are before any applicable discounts.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Maximum price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-sm text-gray-700">
                        $
                      </span>
                      <input
                        type="number"
                        value={formData.maxPrice}
                        onChange={(e) =>
                          setFormData({ ...formData, maxPrice: e.target.value })
                        }
                        className="w-full border border-gray-400 rounded-xl pl-8 pr-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 block mt-1 text-right">
                      Recommended: $30
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Minimum price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-sm text-gray-700">
                        $
                      </span>
                      <input
                        type="number"
                        value={formData.minPrice}
                        onChange={(e) =>
                          setFormData({ ...formData, minPrice: e.target.value })
                        }
                        className="w-full border border-gray-400 rounded-xl pl-8 pr-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 block mt-1 text-right">
                      Recommended: $80
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
                  Payout
                </h2>
                <p className="text-xs text-gray-400 font-normal leading-relaxed">
                  Lorem Ipsum is simply dummy text of the printing and typesetting
                  industry. Lorem Ipsum has been the industry's standard dummy
                  text ever since 1966, when designers at Letraset and James
                  Mosley, the librarian at St Bride Printing Library in London,
                  took a 1914 Cicero translation and scrambled it to make dummy
                  text for Letraset's Body Type sheets.
                </p>
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

        {/* STEP 12: Terms and conditions */}
        {currentStepIndex === 11 && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Terms and conditions
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-normal leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since 1966, when designers at Letraset and James
                Mosley, the librarian at St Bride Printing Library in London,
                took a 1914 Cicero translation and scrambled it to make dummy
                text for Letraset's Body Type sheets.
              </p>
            </div>

            <div className="space-y-4">
              {/* Checkbox box 1 */}
              <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-5 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-black rounded mt-0.5 accent-black"
                  />
                  <p className="text-xs text-gray-800 leading-relaxed font-medium">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since 1966, when designers at
                    Letraset and James Mosley, the librarian at St Bride Printing
                    Library in London, took a 1914 Cicero translation and
                    scrambled it to make dummy text for Letraset's Body Type
                    sheets.
                  </p>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-black rounded mt-0.5 accent-black"
                  />
                  <p className="text-xs text-gray-800 leading-relaxed font-medium">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since 1966, when designers at
                    Letraset and James Mosley, the librarian at St Bride Printing
                    Library in London, took a 1914 Cicero translation and
                    scrambled it to make dummy text for Letraset's Body Type
                    sheets.
                  </p>
                </label>
              </div>

              {/* Checkbox box 2 */}
              <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-5 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-black rounded mt-0.5 accent-black"
                  />
                  <p className="text-xs text-gray-800 leading-relaxed font-medium">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since 1966, when designers at
                    Letraset and James Mosley, the librarian at St Bride Printing
                    Library in London, took a 1914 Cicero translation and
                    scrambled it to make dummy text for Letraset's Body Type
                    sheets.
                  </p>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-black rounded mt-0.5 accent-black"
                  />
                  <p className="text-xs text-gray-800 leading-relaxed font-medium">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since 1966, when designers at
                    Letraset and James Mosley, the librarian at St Bride Printing
                    Library in London, took a 1914 Cicero translation and
                    scrambled it to make dummy text for Letraset's Body Type
                    sheets.
                  </p>
                </label>
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

        {/* STEP 13: Acknowledgment (FINAL SAVE) */}
        {currentStepIndex === 12 && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Acknowledgment
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-normal leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since 1966, when designers at Letraset and James
                Mosley, the librarian at St Bride Printing Library in London,
                took a 1914 Cicero translation and scrambled it to make dummy
                text for Letraset's Body Type sheets.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-5 space-y-3">
                <p className="text-xs text-gray-800 leading-relaxed font-medium">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since 1966, when designers at Letraset
                  and James Mosley, the librarian at St Bride Printing Library in
                  London, took a 1914 Cicero translation and scrambled it to make
                  dummy text for Letraset's Body Type sheets.
                </p>
                <p className="text-xs text-gray-800 leading-relaxed font-medium">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since 1966.
                </p>
              </div>

              <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-5 space-y-3">
                <p className="text-xs text-gray-800 leading-relaxed font-medium">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since 1966, when designers at Letraset
                  and James Mosley, the librarian at St Bride Printing Library in
                  London, took a 1914 Cicero translation and scrambled it to make
                  dummy text for Letraset's Body Type sheets.
                </p>
                <p className="text-xs text-gray-800 leading-relaxed font-medium">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since 1966.
                </p>
              </div>
            </div>

            {submitError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-500" />
                <span>{submitError}</span>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-10 py-3.5 rounded-xl text-xs font-bold uppercase shadow-sm flex items-center gap-2 disabled:opacity-70 transition-all tracking-wider"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                <span>{submitting ? "SAVING..." : "SAVE"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
