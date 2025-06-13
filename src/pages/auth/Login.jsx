"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import {
  Umbrella,
  User,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const schema = z.object({
  phone: z.string().min(8, "Nomor telepon wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        "https://payungku-backend.vercel.app/auth/login",
        data,
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      toast.success("Login berhasil!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login gagal.");
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post(
        "https://payungku-backend.vercel.app/auth/google-login",
        {
          token: credentialResponse.credential,
        }
      );

      const { token, role, name, phone, photo } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);
      localStorage.setItem("photo", photo);

      toast.success("Login Google berhasil!");

      if (!phone) {
        navigate("/set-password");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error("Gagal login dengan Google");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
      {/* Simple background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Back to home button */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => {
            console.log("navigating...");
            navigate("/");
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Kembali ke Beranda</span>
        </button>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <Umbrella className="h-12 w-12 text-blue-600 mx-auto" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Masuk ke PayungKu
              </h1>
              <p className="text-gray-600">
                Masukkan nomor telepon dan password untuk melanjutkan
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                    placeholder="081234567890"
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone.message}</p>
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
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                    placeholder="Masukkan password"
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
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200">
                  Lupa Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                <div className="flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </div>
              </button>

              {/* Divider */}
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="px-4 text-sm text-gray-500 bg-white">
                  atau
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Google Login */}
              <div className="space-y-4">
                <GoogleOAuthProvider clientId="220023925897-7rte78t4mevjsfl91i8te2grcahcjsbl.apps.googleusercontent.com">
                  <div className="flex justify-center">
                    <div className="w-full">
                      <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => toast.error("Login Google gagal")}
                        width="100%"
                        shape="rectangular"
                        size="large"
                        theme="outline"
                        text="signin_with"
                      />
                    </div>
                  </div>
                </GoogleOAuthProvider>
              </div>
            </form>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
              <p className="text-gray-600">
                Belum punya akun?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200">
                  Daftar di sini
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
