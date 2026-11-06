import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Fleet from "./pages/Fleet";
import VehicleDetails from "./pages/VehicleDetails";
import ListCarWizard from "./pages/ListCarWizard";
import Bookings from "./pages/Bookings";
import Users from "./pages/Users";
import Hosts from "./pages/Hosts";
import Tracking from "./pages/Tracking";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Damage from "./pages/Damage";
import ContactUs from "./pages/ContactUs";
import Blogs from "./pages/Blogs";
import FAQs from "./pages/FAQs";
import AboutUs from "./pages/AboutUs";
import Terms from "./pages/Terms";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="fleet" element={<Fleet />} />
        <Route path="fleet/new" element={<ListCarWizard />} />
        <Route path="fleet/:id" element={<VehicleDetails />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="users" element={<Users />} />
        <Route path="hosts" element={<Hosts />} />
        <Route path="tracking" element={<Tracking />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="damage" element={<Damage />} />
        <Route path="contact" element={<ContactUs />} />
        <Route path="faqs" element={<FAQs />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="terms" element={<Terms />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="*"
          element={
            <div className="p-8 font-medium text-gray-500">
              Module under construction
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
