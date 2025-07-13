"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Umbrella,
  Edit,
  Save,
  X,
  ArrowLeft,
  AlertCircle,
  Navigation,
  Home,
  Lock,
  Trash2,
  CheckCircle,
  XCircle,
  Info,
  Map,
  RefreshCw,
} from "lucide-react";
import api from "../../utils/axiosInstance";
import "leaflet/dist/leaflet.css";

// Zod validation schema
const locationSchema = z
  .object({
    name: z.string().min(1, { message: "Nama lokasi harus diisi" }),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    stock: z.coerce.number().int().min(0),
    lockers: z.coerce.number().int().min(1),
  })
  .refine((data) => data.stock <= data.lockers, {
    path: ["stock"],
    message: "Stok payung harus lebih sedikit dari jumlah loker",
  })
  .refine((data) => data.lockers >= data.stock, {
    message: "Jumlah loker harus lebih banyak daripada jumlah stok",
    path: ["lockers"],
  });

// Fix Leaflet icon issue
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Map center update component
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 17);
  return null;
}

const LocationDetail = ({ locationId, onClose, onUpdate, onDelete }) => {
  const modalRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [mapCenter, setMapCenter] = useState([0, 0]);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      latitude: "",
      longitude: "",
      stock: 0,
      lockers: 0,
    },
  });

  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        setLoading(true);
        const toastId = toast.loading("Memuat data lokasi...");

        const response = await api.get(`/locations/${locationId}`);
        const data = response.data;
        setLocation(data);

        // Set form values
        reset({
          name: data.name || "",
          latitude: data.latitude || "",
          longitude: data.longitude || "",
          stock: data.stock || 0,
          lockers: data.lockers || 0,
        });

        // Set map center
        setMapCenter([data.latitude, data.longitude]);

        setError("");
        toast.dismiss(toastId);
        toast.success("Data lokasi berhasil dimuat");
      } catch (err) {
        console.error("Error fetching location details:", err);
        setError("Gagal memuat data lokasi");
        toast.error("Gagal memuat data lokasi");
      } finally {
        setLoading(false);
      }
    };

    if (locationId) {
      fetchLocationDetails();
    }
  }, [locationId, reset]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const toastId = toast.loading("Menyimpan perubahan...");

      const response = await api.put(`/locations/${locationId}`, data);
      setLocation(response.data);
      setIsEditing(false);

      if (onUpdate) {
        onUpdate(response.data);
      }

      setError("");
      toast.dismiss(toastId);
      toast.success("Lokasi berhasil diperbarui");
    } catch (err) {
      console.error("Error updating location:", err);
      setError("Gagal memperbarui data lokasi");
      toast.error("Gagal memperbarui data lokasi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const toastId = toast.loading("Menghapus lokasi...");

      await api.delete(`/locations/${locationId}`);

      if (onDelete) {
        onDelete(locationId);
      }

      toast.dismiss(toastId);
      toast.success("Lokasi berhasil dihapus");

      if (onClose) {
        onClose(true);
      }
    } catch (err) {
      console.error("Error deleting location:", err);
      setError("Gagal menghapus lokasi");
      toast.error("Gagal menghapus lokasi");
      setLoading(false);
    }
  };

  // Loading skeleton
  if (loading && !location) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
              <div className="absolute inset-3 rounded-full bg-blue-50 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Memuat Lokasi
            </h3>
            <p className="text-gray-500 mb-6">
              Sedang mengambil data lokasi dari server
            </p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !location) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 z-50 flex items-center justify-center">
        <div
          ref={modalRef}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100">
          <div className="text-center">
            <div className="bg-red-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Data Tidak Ditemukan
            </h3>
            <p className="text-gray-600 mb-8">
              {error ||
                "Lokasi tidak ditemukan atau terjadi kesalahan saat memuat data."}
            </p>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tab button component
  // eslint-disable-next-line no-unused-vars
  const TabButton = ({ id, label, icon: Icon, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-2.5 rounded-lg ${
        active
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      } transition-all`}>
      <Icon
        className={`h-4 w-4 mr-2 ${active ? "text-blue-500" : "text-gray-400"}`}
      />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="bg-white rounded-2xl shadow-xl max-w-4xl w-full border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="mr-3 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold text-white">Detail Lokasi</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Location Header */}
          {location && (
            <div className="bg-gradient-to-b from-gray-50 to-white px-6 py-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <MapPin className="h-12 w-12 text-white" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {location.name}
                  </h3>
                  <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        location.stock > 5
                          ? "bg-green-100 text-green-800"
                          : location.stock > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                      {location.stock > 5 ? (
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      ) : location.stock > 0 ? (
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                      )}
                      {location.stock > 5
                        ? "Tersedia"
                        : location.stock > 0
                        ? "Terbatas"
                        : "Kosong"}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Umbrella className="h-3.5 w-3.5 mr-1" />
                      {location.stock} Payung
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Lock className="h-3.5 w-3.5 mr-1" />
                      {location.lockers} Loker
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      isEditing
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } transition-colors shadow-sm`}>
                    {isEditing ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Batal
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </>
                    )}
                  </button>
                  {!isEditing && (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="px-4 py-2 rounded-lg flex items-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          {location && !isEditing && (
            <div className="px-6 pt-4 border-b border-gray-200">
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                <TabButton
                  id="info"
                  label="Informasi"
                  icon={Info}
                  active={activeTab === "info"}
                />
                <TabButton
                  id="map"
                  label="Peta"
                  icon={Map}
                  active={activeTab === "map"}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lokasi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Home className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        {...register("name")}
                        className={`w-full pl-10 px-3 py-2 border ${
                          errors.name
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Navigation className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        {...register("latitude")}
                        className={`w-full pl-10 px-3 py-2 border ${
                          errors.latitude
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent`}
                      />
                    </div>
                    {errors.latitude && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.latitude.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Navigation className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        {...register("longitude")}
                        className={`w-full pl-10 px-3 py-2 border ${
                          errors.longitude
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent`}
                      />
                    </div>
                    {errors.longitude && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.longitude.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Payung
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Umbrella className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        {...register("stock")}
                        className={`w-full pl-10 px-3 py-2 border ${
                          errors.stock
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent`}
                      />
                    </div>
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.stock.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Loker
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        {...register("lockers")}
                        className={`w-full pl-10 px-3 py-2 border ${
                          errors.lockers
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent`}
                      />
                    </div>
                    {errors.lockers && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lockers.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors shadow-sm flex items-center"
                    disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              location && (
                <>
                  {activeTab === "info" && (
                    <div className="animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                              <h4 className="font-semibold text-blue-800">
                                Informasi Lokasi
                              </h4>
                            </div>
                            <div className="p-5 space-y-5">
                              <div className="flex items-start">
                                <div className="bg-blue-50 p-2 rounded-lg">
                                  <Home className="h-5 w-5 text-blue-500" />
                                </div>
                                <div className="ml-4">
                                  <p className="text-sm font-medium text-gray-500">
                                    Nama Lokasi
                                  </p>
                                  <p className="text-base font-medium text-gray-900">
                                    {location.name}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start">
                                <div className="bg-purple-50 p-2 rounded-lg">
                                  <Navigation className="h-5 w-5 text-purple-500" />
                                </div>
                                <div className="ml-4">
                                  <p className="text-sm font-medium text-gray-500">
                                    Koordinat
                                  </p>
                                  <p className="text-base font-medium text-gray-900">
                                    {location.latitude}, {location.longitude}
                                  </p>
                                </div>
                              </div>

                              {location.createdAt && (
                                <div className="flex items-start">
                                  <div className="bg-orange-50 p-2 rounded-lg">
                                    <RefreshCw className="h-5 w-5 text-orange-500" />
                                  </div>
                                  <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">
                                      Dibuat Pada
                                    </p>
                                    <p className="text-base font-medium text-gray-900">
                                      {new Date(
                                        location.createdAt
                                      ).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-gray-200">
                              <h4 className="font-semibold text-yellow-800">
                                Inventaris
                              </h4>
                            </div>
                            <div className="p-5">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5">
                                  <Umbrella className="h-8 w-8 text-blue-500 mb-2" />
                                  <p className="text-sm font-medium text-blue-700">
                                    Total Payung
                                  </p>
                                  <p className="text-3xl font-bold text-blue-900">
                                    {location.stock}
                                  </p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5">
                                  <Lock className="h-8 w-8 text-purple-500 mb-2" />
                                  <p className="text-sm font-medium text-purple-700">
                                    Total Loker
                                  </p>
                                  <p className="text-3xl font-bold text-purple-900">
                                    {location.lockers}
                                  </p>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5">
                                  <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                                  <p className="text-sm font-medium text-green-700">
                                    Tersedia
                                  </p>
                                  <p className="text-3xl font-bold text-green-900">
                                    {location.stock - (location.borrowed || 0)}
                                  </p>
                                </div>

                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5">
                                  <RefreshCw className="h-8 w-8 text-orange-500 mb-2" />
                                  <p className="text-sm font-medium text-orange-700">
                                    Dipinjam
                                  </p>
                                  <p className="text-3xl font-bold text-orange-900">
                                    {location.borrowed || 0}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-6">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    Status Ketersediaan
                                  </span>
                                  <span
                                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                                      location.stock > 5
                                        ? "bg-green-100 text-green-800"
                                        : location.stock > 0
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}>
                                    {location.stock > 5
                                      ? "Tersedia"
                                      : location.stock > 0
                                      ? "Terbatas"
                                      : "Kosong"}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full ${
                                      location.stock > 5
                                        ? "bg-green-500"
                                        : location.stock > 0
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (location.stock / location.lockers) *
                                          100
                                      )}%`,
                                    }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {location.stock} dari {location.lockers} unit
                                  tersedia (
                                  {Math.round(
                                    (location.stock / location.lockers) * 100
                                  )}
                                  %)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "map" && (
                    <div className="animate-fadeIn">
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-gray-200">
                          <h4 className="font-semibold text-green-800">
                            Lokasi di Peta
                          </h4>
                        </div>
                        <div className="p-5">
                          <div className="rounded-xl overflow-hidden h-[400px] shadow-inner">
                            {mapCenter[0] !== 0 && (
                              <MapContainer
                                center={mapCenter}
                                zoom={17}
                                style={{ height: "100%", width: "100%" }}
                                scrollWheelZoom={false}
                                zoomControl={true}>
                                <TileLayer
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={mapCenter}>
                                  <Popup>
                                    <div className="p-1">
                                      <h3 className="font-bold text-gray-900">
                                        {location.name}
                                      </h3>
                                      <div className="mt-2 flex items-center text-xs text-blue-600">
                                        <Umbrella className="h-3 w-3 mr-1" />
                                        <span>
                                          {location.stock} payung tersedia
                                        </span>
                                      </div>
                                    </div>
                                  </Popup>
                                </Marker>
                                <ChangeView center={mapCenter} />
                              </MapContainer>
                            )}
                          </div>
                          <div className="mt-4 flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                              Koordinat: {location.latitude},{" "}
                              {location.longitude}
                            </div>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                              <Map className="h-4 w-4 mr-1" />
                              Buka di Google Maps
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 border border-gray-200">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Hapus Lokasi
              </h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus lokasi{" "}
                <span className="font-semibold">{location?.name}</span>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDetail;
