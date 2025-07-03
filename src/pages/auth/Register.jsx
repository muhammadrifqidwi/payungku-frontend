"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Umbrella,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// Skema validasi Zod
const schema = z
  .object({
    name: z
      .string()
      .min(1, "Nama wajib diisi")
      .min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    phone: z
      .string()
      .min(8, "Nomor telepon minimal 8 digit")
      .regex(/^[0-9]+$/, "Nomor telepon hanya boleh berisi angka"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak cocok",
  });

// Simplified password strength checker
const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: "", color: "" };

  const length = password.length;
  let strength = 0;
  let label = "";
  let color = "";

  if (length >= 6 && length < 8) {
    strength = 1;
    label = "Cukup";
    color = "text-yellow-600 bg-yellow-50 border-yellow-200";
  } else if (length >= 8 && length < 12) {
    strength = 2;
    label = "Baik";
    color = "text-green-600 bg-green-50 border-green-200";
  } else if (length >= 12) {
    strength = 3;
    label = "Sangat Baik";
    color = "text-green-700 bg-green-50 border-green-200";
  } else {
    strength = 0;
    label = "Terlalu Pendek";
    color = "text-red-500 bg-red-50 border-red-200";
  }

  return { strength, label, color };
};

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    label: "",
    color: "",
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid, touchedFields },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const watchedPassword = watch("password", "");
  const watchedConfirmPassword = watch("confirmPassword", "");
  const watchedName = watch("name", "");
  const watchedEmail = watch("email", "");
  const watchedPhone = watch("phone", "");

  const onSubmit = async (data) => {
    try {
      await axios.post(
        "https://backend-psi-blond-70.vercel.app/auth/register",
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }
      );

      toast.success(
        "Registrasi berhasil! Anda akan diarahkan ke halaman login."
      );
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Registrasi gagal.");
    }
  };

  // Helper function untuk menampilkan status validasi field
  const getFieldStatus = (fieldName, value) => {
    if (!touchedFields[fieldName]) return null;
    if (errors[fieldName]) return "error";
    if (value && value.length > 0) return "success";
    return null;
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPasswordStrength(getPasswordStrength(value));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
      {/* Simple background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Back to home button - Mobile Responsive */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="font-medium hidden xs:inline">
            Kembali ke Beranda
          </span>
          <span className="font-medium xs:hidden">Beranda</span>
        </button>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100">
                <Umbrella className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto" />
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Daftar Akun PayungKu
              </h1>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Bergabunglah dan nikmati layanan sewa payung dengan mudah
              </p>
            </div>
          </div>

          {/* Register Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    {...register("name")}
                    className={`w-full pl-12 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 placeholder-gray-400 ${
                      getFieldStatus("name", watchedName) === "error"
                        ? "border-red-300 focus:border-red-500"
                        : getFieldStatus("name", watchedName) === "success"
                        ? "border-green-300 focus:border-green-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="Masukkan nama lengkap"
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  {getFieldStatus("name", watchedName) === "success" && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
                  )}
                  {getFieldStatus("name", watchedName) === "error" && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5" />
                  )}
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700">
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    {...register("email")}
                    className={`w-full pl-12 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 placeholder-gray-400 ${
                      getFieldStatus("email", watchedEmail) === "error"
                        ? "border-red-300 focus:border-red-500"
                        : getFieldStatus("email", watchedEmail) === "success"
                        ? "border-green-300 focus:border-green-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="email@example.com"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  {getFieldStatus("email", watchedEmail) === "success" && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
                  )}
                  {getFieldStatus("email", watchedEmail) === "error" && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5" />
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="phone"
                    {...register("phone")}
                    className={`w-full pl-12 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 placeholder-gray-400 ${
                      getFieldStatus("phone", watchedPhone) === "error"
                        ? "border-red-300 focus:border-red-500"
                        : getFieldStatus("phone", watchedPhone) === "success"
                        ? "border-green-300 focus:border-green-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="081234567890"
                  />
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  {getFieldStatus("phone", watchedPhone) === "success" && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
                  )}
                  {getFieldStatus("phone", watchedPhone) === "error" && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5" />
                  )}
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    {...register("password")}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    onChange={(e) => {
                      handlePasswordChange(e);
                      register("password").onChange(e);
                    }}
                    className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 placeholder-gray-400 ${
                      errors.password
                        ? "border-red-300 focus:border-red-500"
                        : watchedPassword && passwordStrength.strength >= 1
                        ? "border-green-300 focus:border-green-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="Minimal 6 karakter"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Simplified Password Strength - Show only when focused or has content */}
                {(isPasswordFocused || watchedPassword) && watchedPassword && (
                  <div
                    className={`border rounded-lg p-3 transition-all duration-300 ${passwordStrength.color}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Kekuatan Password:</span>
                      <span className="text-sm font-semibold">
                        {passwordStrength.label}
                      </span>
                    </div>

                    {/* Simple tip */}
                    <p className="text-xs text-gray-600 mt-2">
                      {watchedPassword.length < 6
                        ? "Minimal 6 karakter diperlukan"
                        : watchedPassword.length < 8
                        ? "Gunakan 8+ karakter untuk keamanan lebih baik"
                        : "Password sudah aman!"}
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    {...register("confirmPassword")}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => setIsConfirmPasswordFocused(false)}
                    className={`w-full pl-12 pr-16 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 placeholder-gray-400 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-500"
                        : watchedConfirmPassword &&
                          watchedPassword === watchedConfirmPassword
                        ? "border-green-300 focus:border-green-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="Ulangi password"
                  />

                  {/* Icon Lock */}
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />

                  {/* Tombol Show/Hide Password */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10">
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>

                  {/* Validasi password cocok/tidak */}
                  {watchedConfirmPassword &&
                    (watchedPassword === watchedConfirmPassword ? (
                      <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
                    ) : (
                      <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5" />
                    ))}
                </div>

                {/* Confirm Password Status - Show when focused or has content */}
                {(isConfirmPasswordFocused || watchedConfirmPassword) &&
                  watchedPassword && (
                    <div
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        watchedConfirmPassword === watchedPassword
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}>
                      <div className="flex items-center gap-2 text-sm">
                        {watchedConfirmPassword === watchedPassword ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Password cocok</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span>Password tidak cocok</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className={`w-full font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 ${
                  isSubmitting || !isValid
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]"
                }`}>
                <div className="flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Sekarang</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
              <p className="text-sm sm:text-base text-gray-600">
                Sudah punya akun?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200">
                  Masuk di sini
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
