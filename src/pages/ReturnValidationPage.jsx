"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import { toast } from "sonner";

import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  CreditCard,
  AlertTriangle,
  Umbrella,
  Lock,
} from "lucide-react";

const ReturnValidationPage = () => {
  const { token, rentCode } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [locker, setLocker] = useState("");
  const [penalty, setPenalty] = useState(null);
  const [snapToken, setSnapToken] = useState("");
  const [error, setError] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [countdownActive, setCountdownActive] = useState(false);

  useEffect(() => {
    const validateReturn = async () => {
      try {
        const res = await api.get(`/transactions/return/validate/${token}`);

        if (res.data.refreshed && res.data.newToken) {
          toast.info("Token kadaluarsa, memperbarui...");
          navigate(`/return/validate/${res.data.newToken}`);
          return;
        }

        if (!res.data.valid) {
          toast.success("Kode valid. Silakan konfirmasi pengembalian.");
          setStatus("error");
          setError("Kode tidak valid atau sudah dikembalikan.");
          return;
        }

        if (res.data.isLate && res.data.snapToken) {
          setPenalty(res.data.denda);
          setSnapToken(res.data.snapToken);
          setStatus("late");
          setCountdownActive(true);
          toast.warning("Pengembalian terlambat. Silakan bayar denda.");
        } else {
          setStatus("validated");
        }

        setTransaction({
          ...res.data.transaction,
          token: token,
          user: res.data.user,
          duration: res.data.duration,
          code: res.data.transaction.rentCode,
        });
      } catch (err) {
        console.error("❌ Validasi gagal:", err);
        toast.error("Kode tidak valid atau sudah dikembalikan.");
        setStatus("error");
        setError(
          err.response?.data?.message ||
            "Validasi gagal. Pastikan Anda sudah berada di lokasi."
        );
      }
    };

    validateReturn();
  }, [token, navigate]);

  useEffect(() => {
    let interval;
    if (countdownActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setStatus("timeout");
    }

    return () => clearInterval(interval);
  }, [countdownActive, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
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

  const handleConfirmReturn = async () => {
    try {
      const res = await api.post(
        "/transactions/return",
        {
          rentCode,
          token,
          returnLocationId: localStorage.getItem("returnLocationId"),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setLocker(res.data.returnLockerCode || "-");
      setTransaction((prev) => ({
        ...prev,
        duration: res.data.rentDuration || "0 jam",
      }));

      setStatus("success");
      toast.success("Pengembalian berhasil! Terima kasih.");
    } catch (err) {
      console.error("❌ Gagal mengonfirmasi pengembalian:", err);
      toast.error("Gagal mengonfirmasi pengembalian.");
    }
  };

  const handlePayPenalty = () => {
    if (!snapToken) return;

    window.snap.pay(snapToken, {
      onSuccess: () => {
        setStatus("success");
        setCountdownActive(false);
        fetchLockerCode();
      },
      onPending: () => {
        alert("Pembayaran sedang diproses.");
      },
      onError: () => {
        setStatus("error");
        setCountdownActive(false);
        setError("Terjadi kesalahan saat pembayaran.");
      },
      onClose: () => {
        if (status === "late") {
          alert(
            "Silakan selesaikan pembayaran untuk melanjutkan pengembalian."
          );
        }
      },
    });
  };

  const fetchLockerCode = async () => {
    try {
      const storedLocationId = localStorage.getItem("returnLocationId");
      const res = await api.get(
        `/transactions/return/complete/${token}?locationId=${storedLocationId}`
      );
      setLocker(res.data.returnCode);
      setStatus("success");
    } catch (err) {
      console.error("❌ Gagal mendapatkan kode loker:", err);
      setError("Gagal mendapatkan kode loker. Silakan hubungi admin.");
      setStatus("error");
    }
  };

  const handleGoBack = () => {
    navigate("/transaksi");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-24 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 mr-3">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            Validasi Pengembalian
          </h1>
        </div>

        {/* Main content card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Status header */}
          <div
            className={`px-6 py-5 text-white ${
              status === "loading"
                ? "bg-blue-600"
                : status === "success"
                ? "bg-green-600"
                : status === "late"
                ? "bg-amber-600"
                : status === "timeout"
                ? "bg-red-600"
                : "bg-red-600"
            }`}>
            <div className="flex items-center">
              {status === "loading" && (
                <>
                  <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                  <h2 className="text-lg font-semibold">
                    Memvalidasi Pengembalian...
                  </h2>
                </>
              )}
              {status === "success" && (
                <>
                  <CheckCircle className="h-6 w-6 mr-2" />
                  <h2 className="text-lg font-semibold">
                    Pengembalian Berhasil
                  </h2>
                </>
              )}
              {status === "late" && (
                <>
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  <h2 className="text-lg font-semibold">
                    Pengembalian Terlambat
                  </h2>
                </>
              )}
              {status === "timeout" && (
                <>
                  <Clock className="h-6 w-6 mr-2" />
                  <h2 className="text-lg font-semibold">
                    Waktu Pembayaran Habis
                  </h2>
                </>
              )}
              {status === "error" && (
                <>
                  <XCircle className="h-6 w-6 mr-2" />
                  <h2 className="text-lg font-semibold">Validasi Gagal</h2>
                </>
              )}
            </div>
          </div>

          {/* Transaction details */}
          {transaction && status !== "loading" && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Detail Transaksi
              </h3>

              <div className="space-y-3">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Pengguna</p>
                    <p className="text-sm font-medium">
                      {transaction.user?.name || "Pengguna"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Lokasi Pengembalian</p>
                    <p className="text-sm font-medium">
                      {transaction.location?.name || "Lokasi Pengembalian"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Waktu Peminjaman</p>
                    <p className="text-sm font-medium">
                      {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Durasi Peminjaman</p>
                    <p className="text-sm font-medium">
                      {transaction.duration || "0 menit"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Umbrella className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Kode Peminjaman</p>
                    <p className="text-sm font-medium">
                      {transaction.code || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content based on status */}
          <div className="px-6 py-6">
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 text-center">
                  Sedang memvalidasi kode pengembalian Anda.
                  <br />
                  Mohon tunggu sebentar...
                </p>
              </div>
            )}

            {status === "validated" && (
              <div className="text-center py-4">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-blue-700 mb-2">
                    Siap untuk mengembalikan?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Klik tombol di bawah untuk mengonfirmasi bahwa anda akan
                    mengembalikan payung.
                  </p>
                </div>

                <button
                  onClick={handleConfirmReturn}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Konfirmasi Pengembalian
                </button>
              </div>
            )}

            {status === "success" && (
              <div className="text-center py-4">
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-700 mb-2">
                    Pengembalian Berhasil
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Terima kasih telah menggunakan layanan kami
                  </p>
                </div>

                <div className="mb-8">
                  <p className="text-gray-700 mb-2 font-medium">
                    Silakan tempatkan payung di loker:
                  </p>
                  <div className="bg-gray-50 border-2 border-green-500 rounded-lg p-6 max-w-xs mx-auto">
                    <div className="flex items-center justify-center">
                      <Lock className="h-8 w-8 text-green-600 mr-3" />
                      <span className="text-4xl font-bold text-green-700">
                        {locker}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 mt-8">
                  <button
                    onClick={handleGoHome}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Kembali ke Beranda
                  </button>
                  <button
                    onClick={handleGoBack}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors">
                    Lihat Riwayat Transaksi
                  </button>
                </div>
              </div>
            )}

            {status === "late" && (
              <div className="text-center py-4">
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-12 w-12 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-amber-700 mb-2">
                    Pengembalian Terlambat
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Anda terlambat mengembalikan payung
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Denda Keterlambatan:</span>
                    <span className="font-bold text-amber-700">
                      Rp {penalty?.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {countdownActive && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-1">
                        Waktu pembayaran:
                      </p>
                      <div className="bg-white rounded-md py-1 px-3 border border-amber-300">
                        <span className="font-mono font-medium text-amber-800">
                          {formatTime(timeRemaining)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePayPenalty}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Bayar Denda Sekarang
                </button>
              </div>
            )}

            {status === "timeout" && (
              <div className="text-center py-4">
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-12 w-12 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-red-700 mb-2">
                    Waktu Pembayaran Habis
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Batas waktu pembayaran telah berakhir
                  </p>
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      setTimeRemaining(300);
                      setCountdownActive(true);
                      setStatus("late");
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Coba Lagi
                  </button>
                  <button
                    onClick={handleGoBack}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors">
                    Kembali
                  </button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="text-center py-4">
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-12 w-12 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-red-700 mb-2">
                    Validasi Gagal
                  </h3>
                  <p className="text-red-600 mb-6">
                    {error || "Terjadi kesalahan saat validasi kode."}
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-medium text-red-800 mb-2">
                    Kemungkinan penyebab:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Anda tidak berada di lokasi pengembalian yang benar</li>
                    <li>Kode pengembalian tidak valid atau sudah kadaluarsa</li>
                    <li>Masalah koneksi dengan server</li>
                  </ul>
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      setStatus("loading");
                      const validateReturn = async () => {
                        try {
                          const storedLocationId =
                            localStorage.getItem("returnLocationId");
                          const res = await api.get(
                            `/transactions/validate/${token}?locationId=${storedLocationId}`
                          );

                          setTransaction(res.data.transaction || {});

                          if (res.data.late && res.data.snapToken) {
                            setPenalty(res.data.amount);
                            setSnapToken(res.data.snapToken);
                            setStatus("late");
                            setTimeRemaining(300);
                            setCountdownActive(true);
                          } else {
                            setLocker(res.data.returnCode);
                            setStatus("success");
                          }
                        } catch (err) {
                          console.error("❌ Validasi gagal:", err);
                          setStatus("error");
                          setError(
                            err.response?.data?.message ||
                              "Validasi gagal. Pastikan Anda sudah berada di lokasi."
                          );
                        }
                      };
                      validateReturn();
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Coba Lagi
                  </button>
                  <button
                    onClick={handleGoBack}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors">
                    Kembali ke Transaksi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Butuh bantuan?{" "}
            <a href="#" className="text-blue-600 font-medium">
              Hubungi customer service kami
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnValidationPage;
