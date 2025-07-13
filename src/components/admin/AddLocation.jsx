"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import {
  X,
  MapPin,
  Save,
  Navigation,
  Umbrella,
  Lock,
  ArrowLeft,
  MapIcon,
} from "lucide-react";
import api from "../../utils/axiosInstance";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Zod schema untuk validasi form
const schema = z
  .object({
    name: z.string().min(1, "Nama lokasi wajib diisi"),
    latitude: z.string().min(1, "Latitude wajib diisi"),
    longitude: z.string().min(1, "Longitude wajib diisi"),
    stock: z.coerce.number().min(0, "Minimal 0"),
    lockers: z.coerce.number().min(1, "Minimal 1"),
  })
  .refine((data) => data.stock <= data.lockers, {
    path: ["stock"],
    message: "Stok payung harus lebih sedikit dari jumlah loker",
  })
  .refine((data) => data.lockers >= data.stock, {
    path: ["lockers"],
    message: "Jumlah loker harus lebih banyak dari stok payung",
  });

// Komponen untuk menangkap klik pada peta
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Komponen utama
const AddLocationForm = ({ onClose, onAdd }) => {
  const modalRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([-6.598769, 106.798622]);
  const mapRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      latitude: "",
      longitude: "",
      stock: 0,
      lockers: 0,
    },
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // Update position when lat/lng inputs change
  useEffect(() => {
    if (latitude && longitude) {
      setPosition([Number.parseFloat(latitude), Number.parseFloat(longitude)]);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Handle map click
  const handleMapClick = (latlng) => {
    const { lat, lng } = latlng;
    setPosition([lat, lng]);
    setValue("latitude", lat.toFixed(6), { shouldValidate: true });
    setValue("longitude", lng.toFixed(6), { shouldValidate: true });

    // Show toast notification
    toast.success("Koordinat berhasil dipilih", {
      description: `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`,
      duration: 3000,
    });
  };

  // Handle form submission
  const onSubmit = async (data) => {
    const toastId = toast.loading("Menyimpan lokasi baru...");
    try {
      setLoading(true);
      const res = await api.post("/locations", data);
      toast.dismiss(toastId);
      toast.success("Lokasi berhasil ditambahkan!", {
        description: `Lokasi ${data.name} telah berhasil ditambahkan.`,
      });
      if (onAdd) onAdd(res.data);
      reset();
      setPosition(null);
      onClose(true);
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error("Gagal menambahkan lokasi.", {
        description:
          err.response?.data?.message ||
          "Terjadi kesalahan saat menambahkan lokasi.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Gunakan lokasi pengguna saat ini
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.loading("Mendapatkan lokasi Anda...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setValue("latitude", latitude.toFixed(6), { shouldValidate: true });
          setValue("longitude", longitude.toFixed(6), { shouldValidate: true });
          setPosition([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          toast.dismiss();
          toast.success("Lokasi berhasil didapatkan");
        },
        (error) => {
          toast.dismiss();
          toast.error("Gagal mendapatkan lokasi", {
            description: error.message,
          });
        }
      );
    } else {
      toast.error("Browser Anda tidak mendukung geolocation");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div
          ref={modalRef}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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
                  Tambah Lokasi Baru
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Fields */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                      Informasi Lokasi
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Lokasi <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register("name")}
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                              errors.name
                                ? "border-red-300 ring-1 ring-red-300"
                                : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            placeholder="Contoh: Stasiun MRT Bundaran HI"
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              {...register("latitude")}
                              className={`w-full pl-9 pr-3 py-2.5 rounded-lg border ${
                                errors.latitude
                                  ? "border-red-300 ring-1 ring-red-300"
                                  : "border-gray-300"
                              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                              placeholder="-6.1944"
                            />
                            <Navigation className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          </div>
                          {errors.latitude && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.latitude.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              {...register("longitude")}
                              className={`w-full pl-9 pr-3 py-2.5 rounded-lg border ${
                                errors.longitude
                                  ? "border-red-300 ring-1 ring-red-300"
                                  : "border-gray-300"
                              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                              placeholder="106.8230"
                            />
                            <Navigation className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          </div>
                          {errors.longitude && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.longitude.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={useCurrentLocation}
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          Gunakan lokasi saat ini
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <Umbrella className="h-5 w-5 mr-2 text-blue-600" />
                      Informasi Inventaris
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stok Payung <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            {...register("stock")}
                            className={`w-full pl-9 pr-3 py-2.5 rounded-lg border ${
                              errors.stock
                                ? "border-red-300 ring-1 ring-red-300"
                                : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          />
                          <Umbrella className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.stock && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.stock.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jumlah Loker <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            {...register("lockers")}
                            className={`w-full pl-9 pr-3 py-2.5 rounded-lg border ${
                              errors.lockers
                                ? "border-red-300 ring-1 ring-red-300"
                                : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          />
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.lockers && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.lockers.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <MapIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Pilih Lokasi di Peta
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Klik pada peta untuk memilih lokasi dan mengisi koordinat
                      secara otomatis
                    </p>
                  </div>

                  <div className="h-[400px] relative">
                    <MapContainer
                      center={mapCenter}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                      className="h-full"
                      ref={mapRef}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapClickHandler onMapClick={handleMapClick} />
                      {position && (
                        <Marker position={position}>
                          <Popup>
                            <div className="text-center">
                              <strong className="block mb-1">
                                Lokasi yang dipilih
                              </strong>
                              <span className="text-xs block">
                                Lat: {position[0].toFixed(6)}, Lng:{" "}
                                {position[1].toFixed(6)}
                              </span>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </MapContainer>

                    <div className="absolute bottom-4 right-4 z-[1000]">
                      <div className="bg-white rounded-lg shadow-md p-2 text-xs text-gray-600">
                        {position ? (
                          <>
                            <div>Latitude: {position[0].toFixed(6)}</div>
                            <div>Longitude: {position[1].toFixed(6)}</div>
                          </>
                        ) : (
                          <div>Klik pada peta untuk memilih lokasi</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-2 py-2 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center">
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Lokasi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLocationForm;
