import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Eye,
  EyeOff,
  Lock,
  UserCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { adminService } from "../api/admin";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@turnburn.com");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await adminService.login(email.trim(), password);
      if (res?.success) {
        navigate("/");
      } else {
        setError(res?.message || "Invalid login credentials.");
      }
    } catch (err) {
      setError(
        err.message || "Failed to sign in. Please verify your admin credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen h-screen flex flex-col md:flex-row bg-black overflow-hidden font-sans">
      <div className="w-full md:w-1/2 h-full bg-black flex flex-col justify-between items-center relative px-8 py-10 lg:px-14 lg:py-12 select-none overflow-hidden">
        <div className="w-full flex flex-col items-center text-center z-10 pt-4">
          <h1 className="text-white text-3xl sm:text-4xl font-semibold mt-7 tracking-wide">
            Turn & Burn Admin
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 font-normal max-w-sm">
            Centralized platform management, live fleet control & analytics
          </p>

          <div className="flex items-center justify-center gap-3 w-40 mt-4">
            <div className="h-[1px] bg-neutral-700 flex-1"></div>
            <div className="w-2 h-2 rotate-45 border border-gray-400 bg-transparent"></div>
            <div className="h-[1px] bg-neutral-700 flex-1"></div>
          </div>
        </div>

        <div className="w-full max-w-lg lg:max-w-xl flex items-end justify-center z-0 mt-auto">
          <img
            src="/images/image_1.png"
            alt="Car Front"
            className="w-full h-auto object-contain max-h-[50vh] drop-shadow-2xl pointer-events-none"
            onError={(e) => {
              if (!e.target.src.includes("imges")) {
                e.target.src = "/imges/image_1.png";
              }
            }}
          />
        </div>
      </div>

      <div className="w-full md:w-1/2 h-full bg-white flex items-center justify-center p-6 sm:p-10 lg:p-14 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] p-8 sm:p-10">
          <div className="text-center mb-7">
            <h2 className="text-3xl font-medium text-gray-900 tracking-tight">
              Admin Portal
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Sign in with your administrator account
            </p>
            <div className="flex items-center justify-center gap-2.5 w-28 mx-auto mt-2.5">
              <div className="h-[1px] bg-gray-300 flex-1"></div>
              <div className="w-1.5 h-1.5 rotate-45 bg-gray-800"></div>
              <div className="h-[1px] bg-gray-300 flex-1"></div>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Admin Email
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3.5 py-3 hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                <input
                  type="email"
                  required
                  placeholder="admin@turnburn.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                />
                <Mail className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3.5 py-3 hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none p-0.5"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0066FF] hover:bg-[#0052cc] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-xs sm:text-sm tracking-wider uppercase shadow-md hover:shadow-lg active:scale-[0.99] mt-3 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? "AUTHENTICATING..." : "SIGN IN"}</span>
            </button>

            <div className="pt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Secure Administrator Access</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
