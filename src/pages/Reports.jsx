import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function Reports() {
  const summaryMetrics = [
    {
      label: "TOTAL BOOKINGS",
      value: "1,284",
      subtext: "All time",
      accentColor: "bg-[#0066FF]", 
    },
    {
      label: "REVENUE YTD",
      value: "$472,720",
      subtext: "Jan – Aug 2026",
      accentColor: "bg-[#10B981]", 
    },
    {
      label: "FLEET UTILIZATION",
      value: "81%",
      subtext: "Avg. this month",
      accentColor: "bg-[#F59E0B]", 
    },
    {
      label: "ACTIVE VEHICLES",
      value: "38 / 46",
      subtext: "In service",
      accentColor: "bg-[#8B5CF6]", 
    },
  ];

  const monthlyData = [
    { month: "Jan", height: "35%", active: false },
    { month: "Feb", height: "42%", active: false },
    { month: "Mar", height: "55%", active: false },
    { month: "Apr", height: "50%", active: false },
    { month: "May", height: "64%", active: false },
    { month: "Jun", height: "78%", active: false },
    { month: "Jul", height: "72%", active: false },
    { month: "Aug", height: "94%", active: true }, 
  ];

  const topPerformers = [
    { name: "BMW 3 Series", percentage: "94%", color: "bg-[#10B981]" },
    { name: "Tesla Model 3", percentage: "88%", color: "bg-[#10B981]" },
    { name: "Mercedes C-Class", percentage: "85%", color: "bg-[#10B981]" },
    { name: "Ford Mustang", percentage: "79%", color: "bg-[#0066FF]" },
    { name: "Toyota Camry", percentage: "72%", color: "bg-[#0066FF]" },
    { name: "Honda CR-V", percentage: "68%", color: "bg-[#F59E0B]" },
  ];

  const tripStats = [
    {
      value: "24",
      label: "Ongoing Trips",
      textColor: "text-[#0066FF]",
      bgColor: "bg-[#EFF6FF]",
    },
    {
      value: "11",
      label: "Completed Today",
      textColor: "text-[#10B981]",
      bgColor: "bg-[#ECFDF5]",
    },
    {
      value: "2.8 days",
      label: "Avg. Duration",
      textColor: "text-[#7C3AED]",
      bgColor: "bg-[#F5F3FF]",
    },
    {
      value: "18,420 mi",
      label: "Total Distance",
      textColor: "text-[#D97706]",
      bgColor: "bg-[#FFFBEB]",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden"
          >
            <div
              className={`w-1 h-5 rounded-full ${item.accentColor} mb-3`}
            ></div>

            <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1">
              {item.label}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {item.value}
            </h3>
            <p className="text-[11px] text-gray-400 mt-2 font-normal">
              {item.subtext}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900 tracking-tight">
                Monthly Revenue
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">Jan – Aug 2026</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight size={13} />
              <span>21.4% YTD</span>
            </div>
          </div>

          <div className="h-56 w-full pt-6 flex items-end justify-between gap-3 px-2">
            {monthlyData.map((bar, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center h-full justify-end group"
              >
                <div className="w-full flex justify-center items-end h-full">
                  <div
                    style={{ height: bar.height }}
                    className={`w-full max-w-[58px] rounded-lg transition-all duration-300 ${
                      bar.active
                        ? "bg-[#0066FF] shadow-md shadow-blue-500/20"
                        : "bg-[#EFF3F9] group-hover:bg-[#E2E8F0]"
                    }`}
                  ></div>
                </div>
                <span className="text-[11px] font-medium text-gray-400 mt-3">
                  {bar.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900 tracking-tight">
              Top Performers
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">By utilization rate</p>

            <div className="mt-6 space-y-4">
              {topPerformers.map((vehicle, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-gray-800">{vehicle.name}</span>
                    <span className="text-gray-900">{vehicle.percentage}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${vehicle.color}`}
                      style={{ width: vehicle.percentage }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-900 tracking-tight">
          Trip Monitoring
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tripStats.map((stat, i) => (
            <div
              key={i}
              className={`${stat.bgColor} rounded-2xl p-5 border border-transparent shadow-sm`}
            >
              <h3
                className={`text-2xl font-bold ${stat.textColor} tracking-tight`}
              >
                {stat.value}
              </h3>
              <p className="text-xs font-semibold text-gray-700 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
