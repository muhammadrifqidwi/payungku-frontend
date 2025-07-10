/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import QRCode from "react-qr-code";
import { toast } from "sonner";

import {
  MapPin,
  Map,
  List,
  AlertCircle,
  CheckCircle,
  Umbrella,
  RotateCw,
  Clock,
  Loader,
  Search,
  ChevronRight,
  ArrowLeft,
  Navigation,
  X,
} from "lucide-react";

// Leaflet Icon Fix
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import api from "../utils/axiosInstance";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function TransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locId, setLocId] = useState("");
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("map");
  const [fetching, setFetching] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [userLocation, setUserLocation] = useState(null);
  const [nearest, setNearest] = useState(null);
  const [rentCode, setRentCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("rent");
  const [returnLocationId, setReturnLocationId] = useState("");
  const [selectedReturnLocation, setSelectedReturnLocation] = useState(null);
  const [lockerCode, setLockerCode] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [transactionToCancel, setTransactionToCancel] = useState(null);

  const navigate = useNavigate();

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef({});

  const userToken = localStorage.getItem("token");

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await axios.get(
        "https://backend-psi-blond-70.vercel.app/api/transactions/user",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTransactions(res.data);

      const active = res.data.find(
        (t) => t.status === "active" && t.paymentStatus === "paid"
      );

      if (active) {
        setActiveTransaction(active);
        setRentCode(active.rentCode || "");
        setReturnLocationId(active.location?._id || "");
        localStorage.setItem("returnLocationId", active.location?._id || "");
        if (active.token) {
          localStorage.setItem("returnToken", active.token);
        }
      } else {
        setRentCode("");
        setActiveTransaction(null);
      }
    } catch (err) {
      console.error("❌ Gagal mengambil transaksi:", err);
      toast.error("Gagal memuat riwayat transaksi");
    }
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await axios.get(
        "https://backend-psi-blond-70.vercel.app/api/locations"
      );
      setLocations(res.data);
      setFetching(false);

      if (res.data.length > 0) {
        setLocId(res.data[0]._id);
      }
    } catch (err) {
      console.error("Gagal mengambil lokasi:", err);
      toast.error("Gagal memuat lokasi");
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchLocations();
  }, [fetchTransactions]);

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
      markers.current = {};
    }

    if (viewMode === "map" && locations.length > 0 && mapRef.current) {
      const avgLat =
        locations.reduce((sum, l) => sum + l.latitude, 0) / locations.length;
      const avgLng =
        locations.reduce((sum, l) => sum + l.longitude, 0) / locations.length;

      const map = L.map(mapRef.current).setView([avgLat, avgLng], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      locations.forEach((loc) => {
        const marker = L.marker([loc.latitude, loc.longitude])
          .addTo(map)
          .bindPopup(
            `
            <strong>${loc.name}</strong><br>
            Stok: <span style="color: ${loc.stock > 0 ? "green" : "red"}">${
              loc.stock
            } payung</span>
          `
          )
          .on("click", () => {
            setLocId(loc._id);
            if (activeTab === "return") {
              setSelectedReturnLocation(loc);
            }
          });

        markers.current[loc._id] = marker;
      });

      mapInstance.current = map;

      if (userLocation) {
        const userIcon = L.divIcon({
          html: `<div class="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>`,
          className: "user-location-marker",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        L.marker([userLocation.latitude, userLocation.longitude], {
          icon: userIcon,
        })
          .addTo(map)
          .bindPopup("Lokasi Anda")
          .openPopup();

        if (nearest) {
          L.polyline(
            [
              [userLocation.latitude, userLocation.longitude],
              [nearest.latitude, nearest.longitude],
            ],
            { color: "#3b82f6", dashArray: "5, 5", weight: 2 }
          ).addTo(map);
        }
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markers.current = {};
      }
    };
  }, [viewMode, locations, activeTab, userLocation, nearest]);

  useEffect(() => {
    const found = locations.find((l) => l._id === locId);
    setSelected(found);

    if (viewMode === "map" && mapInstance.current && found) {
      mapInstance.current.setView([found.latitude, found.longitude], 15);

      Object.entries(markers.current).forEach(([id, marker]) => {
        marker.setIcon(
          id === found._id
            ? new L.Icon({
                iconUrl:
                  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
                shadowUrl: markerShadow,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              })
            : new L.Icon.Default()
        );

        if (id === found._id) {
          marker.openPopup();
        }
      });
    }
  }, [locId, locations, viewMode]);

  useEffect(() => {
    const active = transactions.find((t) => t.status === "active");
    if (active) {
      setRentCode(active.rentCode);
      localStorage.setItem("returnLocationId", active.location._id);
    } else {
      setRentCode("");
    }
  }, [transactions]);

  const handlePinjam = async () => {
    if (!userLocation) {
      setAlert({
        show: true,
        type: "warning",
        message:
          "Silakan deteksi lokasi Anda terlebih dahulu sebelum meminjam payung",
      });
      return;
    }

    if (!selected) {
      toast.error("Silakan pilih lokasi terlebih dahulu");
      return;
    }

    if (selected.stock <= 0) {
      toast.error("Stok habis di lokasi ini");
      return;
    }

    setIsProcessing(true);
    setAlert({ show: false, type: "", message: "" });

    try {
      // Step 1: Ambil SnapToken saja tanpa buat transaksi dulu
      const snapRes = await api.post(
        "/transactions/get-snap-token",
        {
          locationId: selected._id,
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      const { snapToken, orderId, totalPayment } = snapRes.data;

      // Step 2: Buka Snap popup
      window.snap.pay(snapToken, {
        onSuccess: async (result) => {
          try {
            // Step 3: Setelah sukses, baru simpan transaksi
            const confirmRes = await api.post(
              "/transactions/confirm",
              {
                locationId: selected._id,
                orderId,
                totalPayment,
                paymentResult: { ...result, snapToken },
              },
              {
                headers: { Authorization: `Bearer ${userToken}` },
              }
            );

            setLockerCode(confirmRes.data.lockerCode);
            await fetchTransactions();
            await fetchLocations();

            toast.success(
              `Pembayaran berhasil! Ambil payung di loker: ${confirmRes.data.lockerCode}`
            );
            console.log(
              "✅ lockerCode dari backend:",
              confirmRes.data.lockerCode
            );
          } catch (e) {
            console.error(e);
            toast.error("Terjadi kesalahan saat menyimpan transaksi");
          } finally {
            setIsProcessing(false);
          }
        },

        onPending: () => {
          toast.warning("Pembayaran masih diproses. Silakan cek kembali nanti");
          setIsProcessing(false);
        },

        onError: () => {
          toast.error("Pembayaran gagal");
          setIsProcessing(false);
        },

        onClose: async () => {
          toast.warning("Popup ditutup. Transaksi dibatalkan");
          setIsProcessing(false);
          await fetchTransactions();
          await fetchLocations();
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Gagal memulai transaksi");
      setIsProcessing(false);
    }
  };

  const handleReturnClick = async (
    activeTransaction,
    returnLocationId,
    setQRData,
    setShowQR,
    userToken
  ) => {
    try {
      if (!activeTransaction || !activeTransaction.token) {
        toast.error("Transaksi tidak ditemukan atau tidak valid.");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${userToken}` },
      };

      // ✅ Jika status transaksi sudah late, proses denda
      if (activeTransaction.status === "late") {
        const res = await api.post(
          "/transactions/return",
          {
            token: activeTransaction.token,
            returnLocationId,
          },
          config
        );

        if (res.data.status === "late") {
          // → Snap token denda tersedia, tampilkan Midtrans
          window.snap.pay(res.data.snapToken, {
            onSuccess: () => {
              toast.success("Pembayaran denda berhasil!");
              window.location.reload();
            },
            onPending: () => {
              toast("Menunggu pembayaran denda...");
            },
            onError: () => {
              toast.error("Pembayaran denda gagal.");
            },
          });
        }
      } else {
        // ✅ Jika masih active, lakukan validasi QR
        const res = await axios.get(
          `/api/transactions/return/validate/${activeTransaction.token}?locationId=${returnLocationId}`,
          config
        );

        if (res.data.valid) {
          setQRData(res.data.transaction); // atau res.data.transaction.token
          setShowQR(true);
          toast.success("QR Code siap untuk pengembalian.");
        } else {
          toast.error(res.data.message || "Validasi gagal.");
        }
      }
    } catch (err) {
      console.error("❌ Error:", err);
      toast.error(
        err?.response?.data?.message || "Gagal memproses pengembalian."
      );
    }
  };

  const handleRetryPayment = (transaction) => {
    const snapToken =
      transaction.snapToken || transaction.paymentResult?.snapToken;

    if (!snapToken) {
      toast.error("Token pembayaran tidak ditemukan.");
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: async (result) => {
        try {
          await api.post(
            "/transactions/confirm",
            {
              orderId: transaction.orderId,
              paymentResult: { ...result, snapToken },
            },
            {
              headers: { Authorization: `Bearer ${userToken}` },
            }
          );

          toast.success("Pembayaran berhasil dikonfirmasi.");
          await fetchTransactions();
          await fetchLocations();
        } catch (err) {
          console.error(err);
          toast.error("Gagal mengonfirmasi transaksi.");
        }
      },
      onClose: () => {
        toast.warning("Popup ditutup kembali.");
      },
    });
  };

  const handleCancelTransaction = async () => {
    if (!transactionToCancel) return;

    try {
      await api.delete(`/transactions/${transactionToCancel._id}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      toast.success("Transaksi berhasil dibatalkan.");
      await fetchTransactions();
    } catch (err) {
      console.error("Gagal membatalkan transaksi:", err);
      toast.error("Gagal membatalkan transaksi.");
    } finally {
      setShowCancelModal(false);
      setTransactionToCancel(null);
    }
  };

  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung oleh browser Anda");
      return;
    }

    const loadingToast = toast.loading("Mencari lokasi Anda...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserLocation({ latitude: userLat, longitude: userLng });

        const nearestLoc = locations.reduce((nearest, loc) => {
          const dist = Math.sqrt(
            Math.pow(loc.latitude - userLat, 2) +
              Math.pow(loc.longitude - userLng, 2)
          );
          return !nearest || dist < nearest.dist ? { ...loc, dist } : nearest;
        }, null);

        setNearest(nearestLoc);

        if (viewMode === "map" && mapInstance.current && nearestLoc) {
          mapInstance.current.setView([userLat, userLng], 15);

          const userIcon = L.divIcon({
            html: `<div class="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>`,
            className: "user-location-marker",
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          L.marker([userLat, userLng], { icon: userIcon })
            .addTo(mapInstance.current)
            .bindPopup("Lokasi Anda")
            .openPopup();

          L.polyline(
            [
              [userLat, userLng],
              [nearestLoc.latitude, nearestLoc.longitude],
            ],
            { color: "#3b82f6", dashArray: "5, 5", weight: 2 }
          ).addTo(mapInstance.current);

          if (markers.current[nearestLoc._id]) {
            markers.current[nearestLoc._id].openPopup();
          }
        }

        // Dismiss loading toast dan tampilkan success
        toast.dismiss(loadingToast);
        toast.success(
          `Lokasi terdekat: ${nearestLoc.name} (${(
            nearestLoc.dist * 111
          ).toFixed(2)} km)`
        );

        // Set alert untuk ditampilkan di bawah peta
        setAlert({
          show: true,
          type: "success",
          message: `✅ Lokasi Anda berhasil terdeteksi! Lokasi terdekat: ${
            nearestLoc.name
          } (${(nearestLoc.dist * 111).toFixed(2)} km)`,
        });

        setLocId(nearestLoc._id);
      },
      (err) => {
        // Dismiss loading toast dan tampilkan error
        toast.dismiss(loadingToast);
        toast.error(`Gagal mendapatkan lokasi: ${err.message}`);
        console.error(err);
      }
    );
  };

  const formatDate = (dateString) => {
    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "returned":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case "returned":
        return "Dikembalikan";
      case "active":
        return "Aktif";
      case "pending":
        return "Menunggu";
      default:
        return status || "Unknown";
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 pt-24 px-4 sm:px-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center">
              <Umbrella className="mr-3 h-8 w-8" />
              Peminjaman & Pengembalian
            </h2>
            <p className="text-blue-100">
              Pinjam dan kembalikan payung dengan mudah di lokasi terdekat
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Kembali
            </button>
            <button
              onClick={detectUserLocation}
              className="flex items-center px-4 py-2 rounded-lg bg-white text-blue-700 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg">
              <Navigation className="mr-2 h-5 w-5" />
              Deteksi Lokasi Saya
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("rent")}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === "rent"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}>
              <div className="flex items-center justify-center">
                <Umbrella className="mr-2 h-5 w-5" />
                Pinjam Payung
              </div>
            </button>
            <button
              onClick={() => setActiveTab("return")}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === "return"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}>
              <div className="flex items-center justify-center">
                <RotateCw className="mr-2 h-5 w-5" />
                Kembalikan Payung
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === "rent" ? (
              <div className="space-y-6">
                {/* Toggle View */}
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-gray-100 p-1 rounded-lg flex">
                    <button
                      onClick={() => setViewMode("map")}
                      className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === "map"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}>
                      <Map className="h-4 w-4 mr-1.5" />
                      Peta
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === "list"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}>
                      <List className="h-4 w-4 mr-1.5" />
                      Daftar
                    </button>
                  </div>
                </div>

                {/* Peta atau List Lokasi */}
                {viewMode === "map" ? (
                  <div className="relative">
                    <div
                      ref={mapRef}
                      className="h-[350px] rounded-lg border border-gray-200 shadow-sm z-0 overflow-hidden"></div>
                    {fetching && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <Loader className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                          <p className="text-gray-600">Memuat peta...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    <select
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      value={locId}
                      onChange={(e) => setLocId(e.target.value)}>
                      <option value=""> Pilih Lokasi </option>
                      {locations.map((l) => (
                        <option
                          key={l._id}
                          value={l._id}
                          disabled={l.stock <= 0}>
                          {l.name}{" "}
                          {l.stock <= 0 ? "(Stok Habis)" : `(Stok: ${l.stock})`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Info Lokasi */}
                {selected && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500 shadow-sm">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800 text-lg">
                          {selected.name}
                        </h4>
                        <p className="text-blue-700 mt-1">
                          Stok payung:{" "}
                          <span
                            className={`font-medium ${
                              selected.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}>
                            {selected.stock}
                          </span>
                        </p>
                        {selected.address && (
                          <p className="text-sm text-blue-700 mt-1">
                            {selected.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Location Success Alert - Tampil setelah deteksi lokasi berhasil */}
                {alert.show && alert.type === "success" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-md flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-green-800 font-medium">
                        {alert.message}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setAlert({ show: false, type: "", message: "" })
                      }
                      className="ml-auto text-green-500 hover:text-green-700">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* Warning Alert - Untuk peringatan deteksi lokasi */}
                {alert.show && alert.type === "warning" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-md flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-yellow-800 font-medium">
                        {alert.message}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setAlert({ show: false, type: "", message: "" })
                      }
                      className="ml-auto text-yellow-500 hover:text-yellow-700">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* Locker Code Display */}
                {lockerCode && activeTab === "rent" && (
                  <div className="mt-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <CheckCircle className="h-8 w-8 text-green-600 mr-2" />
                        <h4 className="text-lg font-semibold text-green-800">
                          Peminjaman Berhasil!
                        </h4>
                      </div>
                      <p className="text-green-700 mb-4">
                        Silakan ambil payung Anda di loker dengan kode:
                      </p>
                      <div className="bg-white inline-block px-8 py-4 rounded-xl border-2 border-green-300 shadow-lg">
                        <div className="text-4xl font-bold text-green-700 tracking-wider">
                          {lockerCode}
                        </div>
                      </div>
                      <p className="text-sm text-green-600 mt-4">
                        Simpan kode ini dengan baik untuk mengambil payung Anda
                      </p>
                    </div>
                  </div>
                )}

                {/* Tombol Pinjam */}
                <button
                  onClick={handlePinjam}
                  disabled={!selected || selected.stock <= 0 || isProcessing}
                  className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center ${
                    !selected || selected.stock <= 0 || isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
                  }`}>
                  {isProcessing ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Umbrella className="mr-2 h-5 w-5" />
                      Pinjam Sekarang
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                    <RotateCw className="mr-2 h-5 w-5 text-blue-600" />
                    Pengembalian Payung
                  </h3>
                  <p className="text-sm text-green-600 mt-1">
                    Rekomendasi terdekat:{" "}
                    <strong>
                      {nearest?.name || "Lokasi tidak terdeteksi"}
                    </strong>
                  </p>
                </div>

                {/* Toggle View for Return Tab */}
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-gray-100 p-1 rounded-lg flex">
                    <button
                      onClick={() => setViewMode("map")}
                      className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === "map"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}>
                      <Map className="h-4 w-4 mr-1.5" />
                      Peta
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === "list"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}>
                      <List className="h-4 w-4 mr-1.5" />
                      Daftar
                    </button>
                  </div>
                </div>

                {/* Map for Return Tab */}
                {viewMode === "map" ? (
                  <div className="relative mb-4">
                    <div
                      ref={mapRef}
                      className="h-[350px] rounded-lg border border-gray-200 shadow-sm overflow-hidden"></div>
                    {fetching && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <Loader className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                          <p className="text-gray-600">Memuat peta...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative mb-4 flex items-center">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <select
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      value={returnLocationId}
                      onChange={(e) => setReturnLocationId(e.target.value)}>
                      <option value="">Pilih Titik Pengembalian</option>
                      {locations.map((l) => (
                        <option key={l._id} value={l._id}>
                          {l.name} {l.stock <= 0 ? "(Stok Habis)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    {selectedReturnLocation && (
                      <div className="text-sm text-blue-800 mt-2">
                        Lokasi pengembalian yang dipilih:{" "}
                        <strong>{selectedReturnLocation.name}</strong>
                      </div>
                    )}
                  </div>

                  {nearest && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-800">
                            Lokasi Pengembalian Terdeteksi
                          </h4>
                          <p className="text-green-700 mt-1">{nearest.name}</p>
                          {nearest?.address && (
                            <p className="text-sm text-green-700 mt-1">
                              {nearest.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!nearest && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        </div>
                        <p className="text-yellow-700">
                          Silakan deteksi lokasi Anda terlebih dahulu untuk
                          menemukan titik pengembalian terdekat.
                        </p>
                      </div>
                    </div>
                  )}

                  {showQR && activeTransaction ? (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center space-y-4">
                      <p className="text-green-700 font-semibold">
                        Silakan scan QR Code berikut untuk validasi
                        pengembalian:
                      </p>

                      <div className="flex flex-col items-center space-y-4">
                        {showQR && activeTransaction?.token && (
                          <div className="p-4 bg-white rounded-lg border-2 border-blue-100 shadow">
                            <QRCode
                              value={`https://payungku.vercel.app/return/validate/${activeTransaction.token}`}
                              size={180}
                            />
                          </div>
                        )}

                        <div className="bg-blue-50 rounded-lg px-4 py-2">
                          <p className="text-blue-700 font-medium text-sm">
                            Kode:{" "}
                            <span className="font-bold tracking-widest">
                              {activeTransaction.rentCode}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleReturnClick}
                      disabled={!nearest || isProcessing}
                      className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center ${
                        !nearest || isProcessing
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all"
                      }`}>
                      {isProcessing ? (
                        <>
                          <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <RotateCw className="mr-2 h-5 w-5" />
                          Kembalikan Payung
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Riwayat Transaksi */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-600" />
              Riwayat Transaksi
            </h3>
          </div>

          {fetching ? (
            <div className="p-6 flex justify-center">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <Umbrella className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-gray-500 mb-2">Belum ada transaksi.</p>
              <p className="text-sm text-gray-400">
                Transaksi Anda akan muncul di sini setelah Anda melakukan
                peminjaman.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
              {transactions.map((t) => (
                <div
                  key={t._id}
                  className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h4 className="font-medium text-gray-900">
                          {t.location?.name || "Lokasi tidak ditemukan"}
                          {t.returnLocation && (
                            <>
                              <span className="mx-1 text-gray-400">→</span>
                              {t.returnLocation?.name}
                            </>
                          )}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            t.status
                          )}`}>
                          {getStatusLabel(t.status)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1 text-blue-500" />
                        <span>{formatDate(t.createdAt)}</span>
                      </div>
                    </div>
                    {t.status === "pending" ? (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleRetryPayment(t)}
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition">
                          Bayar
                        </button>
                        <button
                          onClick={() => {
                            setTransactionToCancel(t);
                            setShowCancelModal(true);
                          }}
                          className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 transition">
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/detail-transaksi/${t._id}`)}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Detail
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {showCancelModal && transactionToCancel && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30  bg-opacity-50">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Batalkan Transaksi?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Anda yakin ingin membatalkan transaksi di{" "}
                  <strong>{transactionToCancel?.location?.name}</strong>?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                    Tidak
                  </button>
                  <button
                    onClick={handleCancelTransaction}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                    Ya, Batalkan
                  </button>
                </div>
              </div>
            </div>
          )}

          {transactions.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center w-full">
                Lihat Semua Transaksi
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Butuh bantuan?{" "}
          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
            Hubungi customer service
          </a>
        </p>
      </div>
    </div>
  );
}
