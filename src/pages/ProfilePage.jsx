"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import api from "../utils/axiosInstance";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Loader,
  Save,
  User,
  Mail,
  Phone,
  Camera,
  Shield,
  LogOut,
  ArrowLeft,
  Home,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link } from "react-router-dom";

// Define the validation schema with Zod
const profileSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "Nomor telepon minimal 8 karakter"),
});

// Define password schema separately
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    newPassword: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");

  // Profile form with React Hook Form + Zod
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Password form with React Hook Form + Zod
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);

        // Set form values
        setProfileValue("name", res.data.name || "");
        setProfileValue("email", res.data.email || "");
        setProfileValue("phone", res.data.phone || "");
        setPhotoPreview(res.data.photo);
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data profil. Silakan coba lagi.");
      }
    };

    fetchUser();
  }, [setProfileValue, token]);

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "un1que");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dz2zybp9y/image/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser((prevUser) => ({
        ...prevUser,
        photo: res.data.secure_url,
      }));

      localStorage.setItem("photo", res.data.secure_url);
      toast.success("Foto profil berhasil diunggah!");
    } catch (err) {
      console.error("Gagal upload ke Cloudinary", err);
      toast.error("Gagal mengunggah foto. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      await api.put(
        "/users/profile",
        { ...data, photo: user?.photo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Profil berhasil diperbarui!");

      // Update user state with new data
      setUser((prev) => ({
        ...prev,
        ...data,
      }));
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbarui profil.");
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await api.put(
        "/users/change-password",
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Kata sandi berhasil diubah.");
      resetPassword();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Gagal mengubah kata sandi. Coba lagi."
      );
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUser((prevUser) => ({
        ...prevUser,
        photo: "",
      }));

      await api.put(
        "/users/profile",
        { ...user, photo: "" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPhotoPreview(null);
      localStorage.setItem("photo", "");
      toast.success("Foto profil berhasil dihapus.");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus foto. Silakan coba lagi.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat profil Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center mb-4">
              <Link
                to="/"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors mr-3">
                <ArrowLeft className="h-5 w-5 text-blue-600" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Pengaturan Akun
              </h1>
            </div>
            <p className="text-gray-600 ml-13 sm:ml-0">
              Kelola informasi profil dan preferensi akun Anda
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-1">
                <button
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "profile"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("profile")}>
                  <User className="mr-3 h-5 w-5" />
                  <span>Informasi Profil</span>
                </button>

                <button
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "security"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("security")}>
                  <Shield className="mr-3 h-5 w-5" />
                  <span>Keamanan</span>
                </button>

                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50">
                    <LogOut className="mr-3 h-5 w-5" />
                    <span>Keluar</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-900">
                    Informasi Profil
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Informasi ini akan ditampilkan secara publik, jadi
                    berhati-hatilah dengan apa yang Anda bagikan.
                  </p>
                </div>

                <div className="p-6">
                  {/* Photo Upload Section */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Foto Profil
                    </label>
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                          {isUploading ? (
                            <Loader className="h-8 w-8 animate-spin text-blue-600" />
                          ) : photoPreview || user.photo ? (
                            <img
                              src={photoPreview || user.photo}
                              alt="Foto Profil"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 text-white shadow-sm hover:bg-blue-700 transition-colors">
                          <Camera className="h-4 w-4" />
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <div className="ml-5 space-y-2">
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          disabled={isUploading}
                          className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Ubah
                        </button>
                        {(photoPreview || user.photo) && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="ml-3 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            Hapus
                          </button>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, GIF atau PNG. Ukuran maksimal 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700">
                          Nama
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            {...registerProfile("name")}
                            type="text"
                            id="name"
                            className={`block w-full pl-10 pr-3 py-2 border ${
                              profileErrors.name
                                ? "border-red-300"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            placeholder="Nama lengkap Anda"
                          />
                        </div>
                        {profileErrors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileErrors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-6">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700">
                          Alamat Email
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            {...registerProfile("email")}
                            type="email"
                            id="email"
                            className={`block w-full pl-10 pr-3 py-2 border ${
                              profileErrors.email
                                ? "border-red-300"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            placeholder="email@example.com"
                          />
                        </div>
                        {profileErrors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileErrors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-6">
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700">
                          Nomor Telepon
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            {...registerProfile("phone")}
                            type="text"
                            id="phone"
                            className={`block w-full pl-10 pr-3 py-2 border ${
                              profileErrors.phone
                                ? "border-red-300"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            placeholder="08 812 3456 7890"
                          />
                        </div>
                        {profileErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileErrors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        type="button"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isProfileSubmitting}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isProfileSubmitting ? (
                          <>
                            <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
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
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-900">
                    Keamanan Akun
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Kelola pengaturan keamanan dan kata sandi akun Anda.
                  </p>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900">
                        Ubah Kata Sandi
                      </h3>
                      <form
                        onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                        className="mt-4 space-y-4">
                        <div>
                          <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-gray-700">
                            Kata Sandi Saat Ini
                          </label>
                          <div className="relative">
                            <input
                              {...registerPassword("currentPassword")}
                              type={showPassword.current ? "text" : "password"}
                              id="currentPassword"
                              className={`mt-1 block w-full border ${
                                passwordErrors.currentPassword
                                  ? "border-red-300"
                                  : "border-gray-300"
                              } rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400"
                              onClick={() =>
                                setShowPassword((prev) => ({
                                  ...prev,
                                  current: !prev.current,
                                }))
                              }>
                              {showPassword.current ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {passwordErrors.currentPassword && (
                            <p className="mt-1 text-sm text-red-600">
                              {passwordErrors.currentPassword.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-700">
                            Kata Sandi Baru
                          </label>
                          <div className="relative">
                            <input
                              {...registerPassword("newPassword")}
                              type={showPassword.new ? "text" : "password"}
                              id="newPassword"
                              className={`mt-1 block w-full border ${
                                passwordErrors.newPassword
                                  ? "border-red-300"
                                  : "border-gray-300"
                              } rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400"
                              onClick={() =>
                                setShowPassword((prev) => ({
                                  ...prev,
                                  new: !prev.new,
                                }))
                              }>
                              {showPassword.new ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {passwordErrors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">
                              {passwordErrors.newPassword.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700">
                            Konfirmasi Kata Sandi Baru
                          </label>
                          <div className="relative">
                            <input
                              {...registerPassword("confirmPassword")}
                              type={showPassword.confirm ? "text" : "password"}
                              id="confirmPassword"
                              className={`mt-1 block w-full border ${
                                passwordErrors.confirmPassword
                                  ? "border-red-300"
                                  : watchPassword("confirmPassword") &&
                                    watchPassword("confirmPassword") ===
                                      watchPassword("newPassword")
                                  ? "border-green-300"
                                  : "border-gray-300"
                              } rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400"
                              onClick={() =>
                                setShowPassword((prev) => ({
                                  ...prev,
                                  confirm: !prev.confirm,
                                }))
                              }>
                              {showPassword.confirm ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {passwordErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">
                              {passwordErrors.confirmPassword.message}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isPasswordSubmitting}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isPasswordSubmitting ? (
                              <>
                                <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Memproses...
                              </>
                            ) : (
                              "Perbarui Kata Sandi"
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
