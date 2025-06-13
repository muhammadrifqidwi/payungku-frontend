"use client";

import React from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  Umbrella,
  ArrowLeft,
  User,
} from "lucide-react";

const schema = z.object({
  phone: z.string().min(8, "Nomor telepon tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function SetPhonePasswordPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const password = watch("password", "");

  // Calculate password strength
  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 6) strength += 1;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return { text: "Lemah", color: "text-red-500" };
      case 2:
        return { text: "Sedang", color: "text-yellow-500" };
      case 3:
        return { text: "Baik", color: "text-blue-500" };
      case 4:
      case 5:
        return { text: "Kuat", color: "text-green-500" };
      default:
        return { text: "", color: "" };
    }
  };

  // Update password strength when password changes
  React.useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://payungku-backend.vercel.app/auth/set-password",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Berhasil menyimpan nomor telepon dan password");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan");
    }
  };

  const strengthInfo = getPasswordStrengthText(passwordStrength);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8 px-4">
      <div className="max-w-md mx-auto mt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
            <Umbrella className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Lengkapi Akun PayungKu
          </h1>
          <p className="text-gray-600 text-sm">
            Tambahkan nomor telepon dan password untuk keamanan akun Anda
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div className="w-12 h-1 bg-green-500 rounded"></div>
            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="w-12 h-1 bg-gray-300 rounded"></div>
            <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full">
              <Shield className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </button>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Phone Number Field */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Phone className="h-4 w-4 mr-2 text-blue-500" />
                Nomor Telepon
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("phone")}
                  placeholder="Contoh: 08123456789"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.phone
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.phone && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phone.message}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Lock className="h-4 w-4 mr-2 text-blue-500" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Masukkan password yang kuat"
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Kekuatan Password:</span>
                    <span className={`font-medium ${strengthInfo.color}`}>
                      {strengthInfo.text}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength
                            ? passwordStrength <= 2
                              ? "bg-red-400"
                              : passwordStrength <= 3
                              ? "bg-yellow-400"
                              : "bg-green-400"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {errors.password && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password.message}
                </div>
              )}
            </div>

            {/* Password Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    Tips Password Kuat:
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          password.length >= 8 ? "bg-green-400" : "bg-gray-300"
                        }`}
                      />
                      Minimal 8 karakter
                    </li>
                    <li className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          /[A-Z]/.test(password)
                            ? "bg-green-400"
                            : "bg-gray-300"
                        }`}
                      />
                      Mengandung huruf besar
                    </li>
                    <li className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          /[0-9]/.test(password)
                            ? "bg-green-400"
                            : "bg-gray-300"
                        }`}
                      />
                      Mengandung angka
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl">
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  Menyimpan...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Simpan & Lanjutkan
                </div>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Keamanan Data Terjamin</p>
                <p>
                  Nomor telepon dan password Anda akan dienkripsi dan disimpan
                  dengan aman. Data ini diperlukan untuk verifikasi identitas
                  saat menyewa payung.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Dengan melengkapi akun, Anda menyetujui{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Syarat & Ketentuan
            </a>{" "}
            PayungKu
          </p>
        </div>
      </div>
    </div>
  );
}
