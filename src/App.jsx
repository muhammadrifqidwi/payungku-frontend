/* eslint-disable no-unused-vars */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import DashboardAdmin from "./pages/admin/DashboardAdmin.jsx";
import Profile from "./pages/ProfilePage.jsx";
import ListLokasi from "./pages/ListLokasi.jsx";
import Transaksi from "./pages/TransactionPage.jsx";
import ProfilePage from "./pages/ProfilePage";
import ReturnValidationPage from "./pages/ReturnValidationPage.jsx";
import DetailTransaction from "./components/DetailTransaction.jsx";
import SetPhonePasswordPage from "./components/SetLogPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import { Toaster } from "sonner";

function LayoutWrapper() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  //Define path that should hide Navbar, Footer, or both
  const hiddenPaths = {
    navAndFooter: ["/login", "/register", "/forgot-password", "/set-password"],
    onlyFooter: ["/admin/dashboard"],
    startsWith: ["/return/validate", "/detail-transaksi"],
  };

  const shouldHide = (type) => {
    if (type === "navAndFooter") {
      return hiddenPaths.navAndFooter.includes(location.pathname);
    }

    if (type === "footerOnly") {
      return hiddenPaths.onlyFooter.includes(location.pathname);
    }

    if (type === "nav") {
      return (
        hiddenPaths.navAndFooter.includes(location.pathname) ||
        hiddenPaths.onlyFooter.includes(location.pathname) ||
        hiddenPaths.startsWith.some((prefix) =>
          location.pathname.startsWith(prefix)
        )
      );
    }

    return false;
  };

  return (
    <>
      {!shouldHide("nav") && <Navbar className="z-10" />}
      <div className="min-h-screen bg-gray-50">
        <Toaster richColors position="top-center" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin/dashboard"
            element={
              token && isAdmin ? <DashboardAdmin /> : <Navigate to="/" />
            }
          />

          <Route path="/transaksi" element={<Transaksi />} />
          <Route path="/detail-transaksi/:id" element={<DetailTransaction />} />
          <Route path="/set-password" element={<SetPhonePasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/list-lokasi" element={<ListLokasi />} />
          <Route
            path="/return/validate/:token"
            element={<ReturnValidationPage />}
          />
        </Routes>
      </div>

      {/* Show Footer unless explicitly hidden */}
      {!shouldHide("navAndFooter") && !shouldHide("footerOnly") && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId="257154767258-plt1ivj5fash7e6qcek6mlfih9gpbprl.apps.googleusercontent.com">
      <Router>
        <LayoutWrapper />
      </Router>
    </GoogleOAuthProvider>
  );
}
