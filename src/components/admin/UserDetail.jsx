"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShoppingBag,
  Clock,
  ArrowLeft,
  Shield,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import api from "../../utils/axiosInstance";

const UserDetail = ({ userId, onClose }) => {
  const modalRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const userResponse = await api.get(`/users/${userId}`);
        setUser(userResponse.data);
        setError("");
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Gagal memuat data pengguna");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-6" />
            <p className="text-gray-700 font-medium">
              Memuat detail pengguna...
            </p>
            <p className="text-gray-500 text-sm mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Data Tidak Ditemukan
            </h3>
            <p className="text-gray-600 mb-6">
              {error ||
                "Pengguna tidak ditemukan atau terjadi kesalahan saat memuat data."}
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm w-full">
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:py-10">
        <div
          ref={modalRef}
          className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="mr-3 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold text-white">
                  Detail Pengguna
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* User Profile Header */}
          <div className="bg-gray-50 px-6 py-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-gray-800">
                  {user.name}
                </h3>
                <p className="text-gray-500 mt-1">{user.email}</p>
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <UserCheck className="h-3 w-3 mr-1" />
                    {user.role === "admin" ? "Admin" : "Pengguna"}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 mr-1" />
                    {user.status === "active" ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">
                  Informasi Pribadi
                </h4>

                <div className="flex items-start">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Nama Lengkap
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {user.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-900">
                      {user.email}
                    </p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-start">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Nomor Telepon
                      </p>
                      <p className="text-base font-medium text-gray-900">
                        {user.phone}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <div className="bg-orange-50 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Tanggal Bergabung
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">
                  Aktivitas & Statistik
                </h4>

                <div className="flex items-start">
                  <div className="bg-yellow-50 p-2 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Transaksi
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {user.transactions || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-indigo-50 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Terakhir Transaksi
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {formatDateTime(user.lastTransaction)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
