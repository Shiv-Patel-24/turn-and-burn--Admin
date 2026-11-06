import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Plus, LogOut } from "lucide-react";
import {
  DashboardIcon,
  FleetIcon,
  CalendarIcon,
  UserIcon,
  HostsIcon,
  LocationIcon,
  PaymentIcon,
  ReportIcon,
  DangerIcon,
  ContactUsIcon,
  FAqIcon,
  BlogsIcon,
  AboutUsIcon,
  TermsIcon,
  SettingIcon,
} from "./icons";
import { adminService } from "../api/admin";
import { getAuthUser } from "../api/client";

const navItems = [
  { path: "/", label: "Dashboard", icon: DashboardIcon },
  { path: "/fleet", label: "Fleet", icon: FleetIcon },
  { path: "/bookings", label: "Bookings", icon: CalendarIcon },
  { path: "/users", label: "Users", icon: UserIcon },
  { path: "/hosts", label: "Hosts", icon: HostsIcon },
  { path: "/tracking", label: "Tracking", icon: LocationIcon },
  { path: "/payments", label: "Payments", icon: PaymentIcon },
  { path: "/reports", label: "Reports", icon: ReportIcon },
  { path: "/damage", label: "Damage", icon: DangerIcon },
  { divider: true },
  { path: "/contact", label: "Contact Us", icon: ContactUsIcon },
  { path: "/faqs", label: "FAQs", icon: FAqIcon },
  { path: "/blogs", label: "Blogs", icon: BlogsIcon },
  { path: "/about", label: "About Us", icon: AboutUsIcon },
  { path: "/terms", label: "Terms & Conditions", icon: TermsIcon },
  { path: "/settings", label: "Settings", icon: SettingIcon },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      adminService.logout();
      navigate("/signin");
    }
  };

  const getPageTitle = () => {
    if (location.pathname === "/" || location.pathname === "")
      return "Dashboard";
    if (location.pathname.startsWith("/users")) return "User Management";
    if (location.pathname.startsWith("/bookings")) return "Bookings";
    if (location.pathname.startsWith("/fleet")) return "Fleet Management";
    if (location.pathname.startsWith("/hosts")) return "Hosts";
    if (location.pathname.startsWith("/tracking")) return "Vehicle Tracking";
    if (location.pathname.startsWith("/payments")) return "Pricing & Payments";
    if (location.pathname.startsWith("/reports")) return "Reports & Analytics";
    if (location.pathname.startsWith("/damage")) return "Damage Reports";
    if (location.pathname.startsWith("/contact")) return "Contact Us";
    if (location.pathname.startsWith("/faqs"))
      return "Frequently Asked Questions";
    if (location.pathname.startsWith("/blogs")) return "Blogs";
    if (location.pathname.startsWith("/about")) return "About Us";
    if (location.pathname.startsWith("/terms")) return "Terms & Conditions";
    if (location.pathname.startsWith("/settings")) return "Company Settings";
    return "Turn & Burn Admin";
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0 -translate-x-full lg:w-0"
        } bg-[#0E1015] text-gray-300 flex flex-col flex-shrink-0 select-none border-r border-[#1B1E28] transition-all duration-300 ease-in-out overflow-hidden z-20`}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm overflow-hidden flex-shrink-0">
            <div className="w-full h-full rounded-full border border-blue-400 flex items-center justify-center bg-white">
              <span className="text-[10px] font-black text-blue-600 leading-none tracking-tighter">
                TB
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-white text-sm font-semibold tracking-wide leading-tight">
              Turn &amp; Burn
            </h1>
            <p className="text-[10px] tracking-wider text-gray-400 font-medium uppercase mt-0.5">
              CAR RENTAL
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 no-scrollbar">
          {navItems.map((item, idx) => {
            if (item.divider) {
              return (
                <div key={idx} className="my-3 border-t border-[#1C1F26]" />
              );
            }

            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#122B55] text-[#3B82F6] font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon
                  size={20}
                  className={`${isActive ? "text-[#3B82F6]" : "text-gray-400"} shrink-0`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#1C1F26]">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {authUser?.name
                  ? authUser.name.charAt(0).toUpperCase()
                  : authUser?.email
                    ? authUser.email.charAt(0).toUpperCase()
                    : "AD"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">
                  {authUser?.name || authUser?.fullName || "Admin User"}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {authUser?.role || "Super Admin"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="text-gray-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-white/10 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8F9FA]">
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="text-gray-600 hover:text-gray-900 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu size={22} />
            </button>
            <h2 className="text-base font-semibold text-gray-900">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-[#F3F4F6] text-xs text-gray-800 placeholder-gray-400 rounded-lg pl-3 pr-4 py-2 border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button className="relative text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            </button>

            <Link
              to="/bookings"
              className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={15} />
              <span>New Booking</span>
            </Link>
          </div>
        </header>

        <div
          className={`flex-1 overflow-y-auto ${location.pathname.startsWith("/fleet/new") ? "bg-white p-6 sm:p-10" : "bg-[#F8F9FA] p-6 md:p-8"}`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
