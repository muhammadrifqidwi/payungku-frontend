"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import QRCode from "react-qr-code";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Umbrella,
  RotateCw,
  Lock,
  HelpCircle,
  Loader,
} from "lucide-react";

export default function DetailTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/transactions/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setData(res.data);
        setError(null);
      } catch (err) {
        console.error("Gagal ambil detail:", err);
        setError("Gagal memuat detail transaksi. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Calculate duration between two dates
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "-";

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours} jam ${diffMinutes} menit`;
  };

  const maskCode = (code) => {
    if (!code) return "-";
    return code.slice(0, 3) + "*****";
  };

  // Get status badge color and text
  const getStatusInfo = (status) => {
    switch (status) {
      case "active":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Clock className="h-4 w-4 mr-1" />,
          text: "Aktif",
        };
      case "completed":
      case "returned":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          text: "Selesai",
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          text: "Menunggu",
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          text: "Dibatalkan",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          text: status || "Tidak diketahui",
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-16 bg-gray-50">
        <div className="text-center">
          <Loader className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Memuat Detail Transaksi
          </h2>
          <p className="text-gray-500">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-16 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/transaksi")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
              <RotateCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const statusInfo = getStatusInfo(data.status);
  const isActive = data.status === "active";
  const isCompleted = data.status === "completed" || data.status === "returned";

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-6 pt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Detail Transaksi</h1>
              <p className="text-white/80 mb-3">ID: {data._id}</p>
            </div>
            <div
              className={`mt-3 sm:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
              {statusInfo.icon}
              {statusInfo.text}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Lokasi Section */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Informasi Lokasi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Lokasi Peminjaman
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {data.location?.name || "-"}
                  </p>
                  {data.location?.address && (
                    <p className="text-sm text-gray-500 mt-1">
                      {data.location.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-green-50 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Lokasi Pengembalian
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {data.returnLocation?.name ||
                      (isActive ? "Belum dikembalikan" : "-")}
                  </p>
                  {data.returnLocation?.address && (
                    <p className="text-sm text-gray-500 mt-1">
                      {data.returnLocation.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Waktu Section */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Informasi Waktu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Waktu Peminjaman
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDate(data.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div
                  className={`${
                    isCompleted ? "bg-green-50" : "bg-gray-50"
                  } p-2 rounded-lg`}>
                  <Calendar
                    className={`h-5 w-5 ${
                      isCompleted ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Waktu Pengembalian
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {data.returnTime
                      ? formatDate(data.returnTime)
                      : isActive
                      ? "Belum dikembalikan"
                      : "-"}
                  </p>
                </div>
              </div>

              {isCompleted && data.returnTime && (
                <div className="flex items-start md:col-span-2">
                  <div className="bg-purple-50 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Durasi Peminjaman
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {calculateDuration(data.createdAt, data.returnTime)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kode Section */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Informasi Kode
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="bg-yellow-50 p-2 rounded-lg">
                  <Lock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Kode Peminjaman
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {isCompleted ? data.rentCode : maskCode(data.rentCode)}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Gunakan kode ini untuk mengambil payung
                  </p>
                </div>
              </div>

              {data.lockerCode && (
                <div className="flex items-start">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Kode Loker
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {data.lockerCode}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Gunakan kode ini untuk membuka loker
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pembayaran Section */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Informasi Pembayaran
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="bg-green-50 p-2 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Status Pembayaran
                  </p>
                  <div className="flex items-center mt-1">
                    {data.paymentStatus === "paid" ? (
                      <>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Lunas
                        </span>
                      </>
                    ) : data.paymentStatus === "pending" ? (
                      <>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Menunggu
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {data.paymentStatus || "Tidak diketahui"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {data.totalPayment && (
                <div className="flex items-start">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Total Pembayaran
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      Rp {data.totalPayment.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Section - Only show if transaction is active */}
          {isCompleted && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Validasi Pengembalian
              </h2>
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-gray-600 mb-4 text-center">
                  Ini adalah bukti bahwa pengembalian telah divalidasi melalui
                  sistem.
                </p>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <QRCode
                    value={`https://payungku.vercel.app/return/validate/${data.token}`}
                    size={180}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Kode: <span className="font-medium">{data.rentCode}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Timeline Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Timeline Transaksi
            </h2>
            <div className="space-y-6">
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="rounded-full h-8 w-8 bg-blue-100 flex items-center justify-center">
                    <Umbrella className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    Peminjaman Payung
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(data.createdAt)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Payung dipinjam dari lokasi {data.location?.name || "-"}
                  </p>
                </div>
              </div>

              {isCompleted ? (
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="rounded-full h-8 w-8 bg-green-100 flex items-center justify-center">
                      <RotateCw className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      Pengembalian Payung
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(data.returnTime)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Payung dikembalikan ke lokasi{" "}
                      {data.returnLocation?.name || "-"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="rounded-full h-8 w-8 bg-gray-100 flex items-center justify-center">
                      <RotateCw className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-400">
                      Menunggu Pengembalian
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Payung belum dikembalikan
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => navigate("/transaksi")}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Transaksi
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Butuh bantuan lainnya?{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-800 font-medium">
              Hubungi customer service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
