"use client";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Umbrella, Menu, X, User } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [photo, setPhoto] = useState(localStorage.getItem("photo"));

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Cek apakah token expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (!decoded.exp) return true;
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setPhoto(null);
    toast.success("Berhasil logout");
    setTimeout(() => navigate("/"), 500);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen((prev) => !prev);
  };

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setIsMenuOpen(false);

    const targetId = href.replace("#", "");
    if (location.pathname !== "/") {
      // Arahkan ke halaman landing dan tambahkan hash
      navigate(`/#${targetId}`);
    } else {
      // Scroll ke section jika sudah di landing
      const section = document.querySelector(href);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Deteksi klik di luar dropdown profil
  useEffect(() => {
    const handleClickOutside = (e) => {
      const menu = document.getElementById("profile-menu");
      const button = document.getElementById("profile-button");
      if (
        profileMenuOpen &&
        menu &&
        !menu.contains(e.target) &&
        button &&
        !button.contains(e.target)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const photoUrl = localStorage.getItem("photo");

    if (token && photoUrl) {
      setPhoto(photoUrl);
    }
  }, [location.pathname]);

  // Deteksi scroll dan section aktif
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      const sections = ["beranda", "tata-cara", "biaya", "lokasi", "faq"];
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(id);
          }
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update token & role secara dinamis + cek expired
  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    const currentRole = localStorage.getItem("role");

    if (currentToken && isTokenExpired(currentToken)) {
      localStorage.clear();
      toast.error("Sesi telah berakhir. Silakan login kembali.");
      setToken(null);
      setRole(null);
    } else {
      setToken(currentToken);
      setRole(currentRole);
    }
  }, [location.pathname]);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedPhoto = localStorage.getItem("photo");
      setPhoto(updatedPhoto);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`fixed top-0 z-5000 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
          : "bg-white shadow-md"
      }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[70px] items-center justify-between">
          {/* Logo Tengah jika halaman login/register */}
          {isAuthPage ? (
            <div className="w-full flex justify-center">
              <div className="relative group flex items-center space-x-2">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] opacity-70 blur-sm group-hover:opacity-100 transition duration-300" />
                <link
                  to="/"
                  className="text-xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] bg-clip-text text-transparent">
                  PayungKu
                </link>
              </div>
            </div>
          ) : (
            <>
              {/* Logo kiri */}
              <div className="flex items-center">
                <Link
                  to="/"
                  className="ml-3 text-xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] bg-clip-text text-transparent">
                  PayungKu
                </Link>
              </div>

              {/* Navigasi Desktop */}
              <nav className="hidden md:flex items-center space-x-1">
                {["#beranda", "#tata-cara", "#biaya", "#lokasi", "#faq"].map(
                  (href) => (
                    <a
                      key={href}
                      href={href}
                      onClick={(e) => handleLinkClick(e, href)}
                      className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                        activeSection === href.substring(1)
                          ? "text-[#3b82f6] bg-[#dbeafe]"
                          : "text-gray-700 hover:text-[#3b82f6] hover:bg-[#f0f7ff]"
                      }`}>
                      {href
                        .substring(1)
                        .replace("-", " ")
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </a>
                  )
                )}

                {/* Dropdown Profil */}
                <div className="relative">
                  <button
                    id="profile-button"
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#3b82f6] hover:bg-[#f0f7ff] rounded-full">
                    {token && photo ? (
                      <img
                        src={photo}
                        alt="Foto Profil"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </button>
                  {profileMenuOpen && (
                    <div
                      id="profile-menu"
                      className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg py-2 z-50">
                      {!token ? (
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-[#3b82f6] hover:bg-[#f0f7ff]">
                          Masuk / Daftar
                        </Link>
                      ) : (
                        <>
                          {role === "admin" && (
                            <Link
                              to="/admin/dashboard"
                              className="block px-4 py-2 text-sm text-gray-700 hover:text-[#3b82f6] hover:bg-[#f0f7ff]">
                              Dashboard
                            </Link>
                          )}
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:text-[#3b82f6] hover:bg-[#f0f7ff]">
                            Profil
                          </Link>
                          <Link
                            to="/transaksi"
                            className="block px-4 py-2 text-sm text-gray-700 hover:text-[#3b82f6] hover:bg-[#f0f7ff]">
                            Transaksi
                          </Link>
                          <hr className="my-1 border-gray-200" />
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            Logout
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </nav>

              {/* Tombol menu mobile */}
              <div className="md:hidden flex items-center space-x-3">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-full text-gray-600 hover:text-[#3b82f6] hover:bg-[#f0f7ff] transition-colors duration-300">
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {!isAuthPage && (
        <div
          className={`md:hidden bg-white border-t overflow-hidden transition-all duration-300 ${
            isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}>
          <div className="px-4 py-4 space-y-4">
            {["#beranda", "#tata-cara", "#biaya", "#lokasi", "#faq"].map(
              (href) => (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => handleLinkClick(e, href)}
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#3b82f6] hover:bg-[#f0f7ff]">
                  {href
                    .substring(1)
                    .replace("-", " ")
                    .replace(/^\w/, (c) => c.toUpperCase())}
                </a>
              )
            )}

            <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
              {!token ? (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#3b82f6] hover:bg-[#f0f7ff]">
                  Masuk / Daftar
                </Link>
              ) : (
                <>
                  {role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-2 text-sm">
                      Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-sm">
                    Profil
                  </Link>
                  <Link
                    to="/transaksi"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-sm">
                    Transaksi
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
