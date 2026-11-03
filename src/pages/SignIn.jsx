import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, ChevronDown, Eye, EyeOff, Lock, UserCheck } from "lucide-react";

export default function SignIn() {
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign In submit", { countryCode, phoneNumber, password });
  };

  return (
    <div className="w-screen min-h-screen h-screen flex flex-col md:flex-row bg-black overflow-hidden font-sans">
      <div className="w-full md:w-1/2 h-full bg-black flex flex-col justify-between items-center relative px-8 py-10 lg:px-14 lg:py-12 select-none overflow-hidden">
        <div className="w-full flex flex-col items-center text-center z-10 pt-4">
          <h1 className="text-white text-3xl sm:text-4xl font-semibold mt-7 tracking-wide">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 font-normal max-w-sm">
            Discover the world on wheels with our car rental service
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
              Sign In
            </h2>
            <div className="flex items-center justify-center gap-2.5 w-28 mx-auto mt-2.5">
              <div className="h-[1px] bg-gray-300 flex-1"></div>
              <div className="w-1.5 h-1.5 rotate-45 bg-gray-800"></div>
              <div className="h-[1px] bg-gray-300 flex-1"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Phone number
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3.5 py-3 hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                <div className="flex items-center gap-1.5 pr-2.5 border-r border-gray-200 text-gray-700 text-xs sm:text-sm font-medium select-none">
                  <span className="text-sm">🇺🇸</span>
                  <span className="text-gray-400 text-[10px]">▼</span>
                  <span className="text-xs text-gray-800">{countryCode}</span>
                </div>
                <input
                  type="tel"
                  required
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                />
                <Phone className="w-4 h-4 text-gray-400" />
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
                  placeholder="Enter your password"
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
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0066FF] hover:bg-[#0052cc] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-xs sm:text-sm tracking-wider uppercase shadow-md hover:shadow-lg active:scale-[0.99] mt-3"
            >
              SIGN IN
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-200 w-full"></div>
              <span className="bg-white px-3 text-[10px] tracking-wider text-gray-400 uppercase absolute font-medium">
                OR
              </span>
            </div>

            <div className="text-center text-xs text-gray-600">
              Forgot Password?{" "}
              <a
                href="#forgot"
                className="font-bold text-gray-900 underline underline-offset-2 hover:text-blue-600 tracking-wide text-xs uppercase"
              >
                CLICK HERE
              </a>
            </div>

            <div className="mt-5 border border-gray-200 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between hover:bg-gray-50/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-900">
                    New here?
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Create an account to get started!
                  </p>
                </div>
              </div>
              <Link
                to="/signup"
                className="text-[11px] font-bold text-gray-900 hover:text-blue-600 uppercase tracking-tight flex items-center gap-1 pl-2 whitespace-nowrap"
              >
                SIGN UP NOW <span className="text-xs">&gt;</span>
              </Link>
            </div>

            <div className="pt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Your privacy is our priority</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
