import React, { useState, useEffect } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Percent,
  DollarSign,
  Clock,
  BarChart3,
  Bell,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { adminService } from "../api/admin";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    businessEmail: "",
    phone: "",
    address: "",
    supportEmail: "",
    supportPhone: "",
    taxRatePercent: 14.6,
    serviceFee: 0,
    hostCommissionPercent: 0,
    cancellationFreeHours: 24,
    publicStats: {
      carsListed: "",
      happyCustomers: "",
      yearsExperience: 25,
      milesDriven: "",
    },
    notificationPreferences: {
      alertOnBookingSubmitted: true,
      alertOnPaymentOrRefund: true,
      alertOnDamageReportFiled: true,
      alertOnIdVerificationSubmitted: true,
    },
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await adminService.getCompanySettings();
      if (res?.data) {
        const d = res.data;
        setFormData({
          companyName: d.companyName || "",
          businessEmail: d.businessEmail || "",
          phone: d.phone || "",
          address: d.address || "",
          supportEmail: d.supportEmail || "",
          supportPhone: d.supportPhone || "",
          taxRatePercent:
            d.taxRatePercent !== undefined ? d.taxRatePercent : 14.6,
          serviceFee: d.serviceFee !== undefined ? d.serviceFee : 0,
          hostCommissionPercent:
            d.hostCommissionPercent !== undefined ? d.hostCommissionPercent : 0,
          cancellationFreeHours:
            d.cancellationFreeHours !== undefined
              ? d.cancellationFreeHours
              : 24,
          publicStats: {
            carsListed:
              d.publicStats?.carsListed !== null &&
              d.publicStats?.carsListed !== undefined
                ? d.publicStats.carsListed
                : "",
            happyCustomers:
              d.publicStats?.happyCustomers !== null &&
              d.publicStats?.happyCustomers !== undefined
                ? d.publicStats.happyCustomers
                : "",
            yearsExperience:
              d.publicStats?.yearsExperience !== undefined
                ? d.publicStats.yearsExperience
                : 25,
            milesDriven:
              d.publicStats?.milesDriven !== null &&
              d.publicStats?.milesDriven !== undefined
                ? d.publicStats.milesDriven
                : "",
          },
          notificationPreferences: {
            alertOnBookingSubmitted:
              d.notificationPreferences?.alertOnBookingSubmitted ?? true,
            alertOnPaymentOrRefund:
              d.notificationPreferences?.alertOnPaymentOrRefund ?? true,
            alertOnDamageReportFiled:
              d.notificationPreferences?.alertOnDamageReportFiled ?? true,
            alertOnIdVerificationSubmitted:
              d.notificationPreferences?.alertOnIdVerificationSubmitted ?? true,
          },
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setErrorMsg(err.message || "Failed to load company settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatsChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      publicStats: { ...prev.publicStats, [field]: value },
    }));
  };

  const handleTogglePref = (field) => {
    setFormData((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [field]: !prev.notificationPreferences[field],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const payload = {
        companyName: formData.companyName,
        businessEmail: formData.businessEmail,
        phone: formData.phone,
        address: formData.address,
        supportEmail: formData.supportEmail,
        supportPhone: formData.supportPhone,
        taxRatePercent: Number(formData.taxRatePercent) || 0,
        serviceFee: Number(formData.serviceFee) || 0,
        hostCommissionPercent: Number(formData.hostCommissionPercent) || 0,
        cancellationFreeHours: Number(formData.cancellationFreeHours) || 0,
        publicStats: {
          carsListed:
            formData.publicStats.carsListed === ""
              ? null
              : Number(formData.publicStats.carsListed),
          happyCustomers:
            formData.publicStats.happyCustomers === ""
              ? null
              : Number(formData.publicStats.happyCustomers),
          yearsExperience: Number(formData.publicStats.yearsExperience) || 0,
          milesDriven:
            formData.publicStats.milesDriven === ""
              ? null
              : Number(formData.publicStats.milesDriven),
        },
        notificationPreferences: formData.notificationPreferences,
      };

      await adminService.updateCompanySettings(payload);
      setSuccessMsg("Company settings saved successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Error saving company settings:", err);
      setErrorMsg(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading company settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Company Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your brand identity, contact information, platform fees,
            and notification triggers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition rounded-lg shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Business Identity & Contact Info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Company Information &amp; Contact
              </h2>
              <p className="text-xs text-gray-500">
                Brand details shown on public documents, invoices, and customer
                receipts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Company Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="e.g. Turn & Burn Car Rental"
                  className="w-full pl-3.5 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Business Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) =>
                    handleChange("businessEmail", e.target.value)
                  }
                  placeholder="info@turnburn.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Business Phone
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (800) 555-0200"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Headquarters Address
              </label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="123 Fleet Ave, New York, NY"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Support Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                  placeholder="support@turnandburn.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Support Helpline
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={formData.supportPhone}
                  onChange={(e) => handleChange("supportPhone", e.target.value)}
                  placeholder="+1 (800) 555-0200"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Percent size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Pricing, Fees &amp; Cancellation Policy
              </h2>
              <p className="text-xs text-gray-500">
                Parameters applied during booking quotes, host commissions, and
                cancellation windows.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Tax &amp; Permit Rate</span>
                <span className="text-[11px] text-gray-400 font-normal">%</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.taxRatePercent}
                  onChange={(e) =>
                    handleChange("taxRatePercent", e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  %
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Default: 14.6%</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Platform Service Fee</span>
                <span className="text-[11px] text-gray-400 font-normal">
                  $ flat
                </span>
              </label>
              <div className="relative">
                <DollarSign
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.serviceFee}
                  onChange={(e) => handleChange("serviceFee", e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Flat fee added per trip
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Host Commission</span>
                <span className="text-[11px] text-gray-400 font-normal">%</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={formData.hostCommissionPercent}
                  onChange={(e) =>
                    handleChange("hostCommissionPercent", e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  %
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Platform retention on host payouts
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Free Cancellation</span>
                <span className="text-[11px] text-gray-400 font-normal">
                  hours
                </span>
              </label>
              <div className="relative">
                <Clock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.cancellationFreeHours}
                  onChange={(e) =>
                    handleChange("cancellationFreeHours", e.target.value)
                  }
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Hours before trip start
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Marketing Figures (&ldquo;Facts in Numbers&rdquo;)
              </h2>
              <p className="text-xs text-gray-500">
                Override marketing counters shown on the public landing page.
                Leave blank to show real-time live database counts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Cars Listed Override
              </label>
              <input
                type="number"
                min="0"
                value={formData.publicStats.carsListed}
                onChange={(e) =>
                  handleStatsChange("carsListed", e.target.value)
                }
                placeholder="Auto (Live Count)"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Leave empty for live fleet count
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Happy Customers Override
              </label>
              <input
                type="number"
                min="0"
                value={formData.publicStats.happyCustomers}
                onChange={(e) =>
                  handleStatsChange("happyCustomers", e.target.value)
                }
                placeholder="Auto (Live Count)"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Leave empty for total users count
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                value={formData.publicStats.yearsExperience}
                onChange={(e) =>
                  handleStatsChange("yearsExperience", e.target.value)
                }
                placeholder="e.g. 25"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Displayed in about/stats
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Miles Driven Override
              </label>
              <input
                type="number"
                min="0"
                value={formData.publicStats.milesDriven}
                onChange={(e) =>
                  handleStatsChange("milesDriven", e.target.value)
                }
                placeholder="Auto (Sum of trips)"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Leave empty for sum of trips
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Admin Notification Triggers
              </h2>
              <p className="text-xs text-gray-500">
                Choose which real-time operational events trigger admin alerts
                and notifications.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => handleTogglePref("alertOnBookingSubmitted")}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                formData.notificationPreferences.alertOnBookingSubmitted
                  ? "bg-blue-50/50 border-blue-200"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  New Booking Submitted
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Alert admin whenever a customer places a new reservation.
                </p>
              </div>
              <input
                type="checkbox"
                checked={
                  formData.notificationPreferences.alertOnBookingSubmitted
                }
                onChange={() => {}}
                className="w-4 h-4 text-blue-600 rounded pointer-events-none"
              />
            </div>

            <div
              onClick={() => handleTogglePref("alertOnPaymentOrRefund")}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                formData.notificationPreferences.alertOnPaymentOrRefund
                  ? "bg-blue-50/50 border-blue-200"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Payment / Refund Processed
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Alert on transaction successes, chargebacks, and refund
                  receipts.
                </p>
              </div>
              <input
                type="checkbox"
                checked={
                  formData.notificationPreferences.alertOnPaymentOrRefund
                }
                onChange={() => {}}
                className="w-4 h-4 text-blue-600 rounded pointer-events-none"
              />
            </div>

            <div
              onClick={() => handleTogglePref("alertOnDamageReportFiled")}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                formData.notificationPreferences.alertOnDamageReportFiled
                  ? "bg-blue-50/50 border-blue-200"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Damage Incident Filed
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  High-priority notification when a host or renter reports
                  vehicle damage.
                </p>
              </div>
              <input
                type="checkbox"
                checked={
                  formData.notificationPreferences.alertOnDamageReportFiled
                }
                onChange={() => {}}
                className="w-4 h-4 text-blue-600 rounded pointer-events-none"
              />
            </div>

            <div
              onClick={() => handleTogglePref("alertOnIdVerificationSubmitted")}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                formData.notificationPreferences.alertOnIdVerificationSubmitted
                  ? "bg-blue-50/50 border-blue-200"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Driver&rsquo;s License Uploaded
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Alert when a user submits license photos for admin
                  verification.
                </p>
              </div>
              <input
                type="checkbox"
                checked={
                  formData.notificationPreferences
                    .alertOnIdVerificationSubmitted
                }
                onChange={() => {}}
                className="w-4 h-4 text-blue-600 rounded pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={saving}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition"
          >
            Discard Changes
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition rounded-xl shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Company Settings
          </button>
        </div>
      </form>
    </div>
  );
}
