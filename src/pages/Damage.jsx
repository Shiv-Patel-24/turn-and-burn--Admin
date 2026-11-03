import React, { useState } from "react";

const DAMAGE_REPORTS = [
  {
    reportId: "DR-0091",
    date: "Aug 8, 2026",
    vehicle: "2023 Toyota Camry",
    driver: "Jason Mbeki",
    type: "Body Scratch",
    severity: "Minor",
    status: "Charged",
    charge: "$180",
  },
  {
    reportId: "DR-0090",
    date: "Aug 5, 2026",
    vehicle: "2022 Honda CR-V",
    driver: "Lily Torres",
    type: "Glass Damage",
    severity: "Major",
    status: "Charged",
    charge: "$620",
  },
  {
    reportId: "DR-0089",
    date: "Aug 3, 2026",
    vehicle: "2024 Ford Mustang",
    driver: "Kofi Asante",
    type: "Interior Damage",
    severity: "Moderate",
    status: "Pending",
    charge: "$340",
  },
  {
    reportId: "DR-0088",
    date: "Jul 30, 2026",
    vehicle: "2022 Tesla Model 3",
    driver: "Amara Osei",
    type: "Missing Part",
    severity: "Minor",
    status: "Charged",
    charge: "$95",
  },
  {
    reportId: "DR-0087",
    date: "Jul 28, 2026",
    vehicle: "2023 BMW 3 Series",
    driver: "Ryan Delgado",
    type: "Underbody / Tire",
    severity: "Moderate",
    status: "Disputed",
    charge: "$260",
  },
  {
    reportId: "DR-0086",
    date: "Jul 25, 2026",
    vehicle: "2021 Chevrolet Equinox",
    driver: "Diana Kwan",
    type: "Incidental",
    severity: "Minor",
    status: "Pending",
    charge: "$200",
  },
];

const TABS = ["All", "Pending", "Charged", "Disputed"];

export default function Damage() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredReports = DAMAGE_REPORTS.filter((report) => {
    if (activeTab === "All") return true;
    return report.status.toLowerCase() === activeTab.toLowerCase();
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "Minor":
        return "text-[#D97706]";
      case "Moderate":
        return "text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-md";
      case "Major":
        return "text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-md";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Charged":
        return "bg-[#ECFDF5] text-[#10B981]";
      case "Pending":
        return "bg-[#FFFBEB] text-[#F59E0B]";
      case "Disputed":
        return "bg-[#FEF2F2] text-[#EF4444]";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-normal text-gray-500 mb-2">
            Total Reports
          </p>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">6</h3>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-normal text-gray-500 mb-2">Charged</p>
          <h3 className="text-2xl font-bold text-[#10B981] tracking-tight">
            3
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-normal text-gray-500 mb-2">Pending</p>
          <h3 className="text-2xl font-bold text-[#F59E0B] tracking-tight">
            2
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-normal text-gray-500 mb-2">
            Total Charged
          </p>
          <h3 className="text-2xl font-bold text-[#0066FF] tracking-tight">
            $1,695
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {TABS.map((tab) => {
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100/90 text-[11px] font-semibold tracking-wider text-gray-400 uppercase select-none">
                <th className="py-4 px-6 font-semibold">REPORT</th>
                <th className="py-4 px-6 font-semibold">VEHICLE</th>
                <th className="py-4 px-6 font-semibold">TYPE</th>
                <th className="py-4 px-6 font-semibold text-center">
                  SEVERITY
                </th>
                <th className="py-4 px-6 font-semibold text-center">STATUS</th>
                <th className="py-4 px-6 font-semibold text-right">CHARGE</th>
                <th className="py-4 px-6 font-semibold text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr
                    key={report.reportId}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="font-medium text-gray-400">
                        {report.reportId}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {report.date}
                      </p>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="font-semibold text-gray-900">
                        {report.vehicle}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {report.driver}
                      </p>
                    </td>

                    <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                      {report.type}
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span
                        className={`text-[11px] font-semibold ${getSeverityBadge(report.severity)}`}
                      >
                        {report.severity}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold leading-tight ${getStatusBadge(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-900 text-right whitespace-nowrap">
                      {report.charge}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          console.log("Details for", report.reportId)
                        }
                        className="text-[#0066FF] hover:text-[#0052cc] font-semibold text-xs transition-colors hover:underline"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-gray-400 text-xs"
                  >
                    No reports found matching "{activeTab}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
