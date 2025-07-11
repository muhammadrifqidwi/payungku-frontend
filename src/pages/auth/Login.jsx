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
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// Skema validasi Zod untuk Login
const schema = z.object({
  phone: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .min(8, "Nomor telepon minimal 8 digit")
    .regex(/^[0-9]+$/, "Nomor telepon hanya boleh berisi angka"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
});

// Custom Google Login Button Component
const CustomGoogleButton = ({ onClick, disabled }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md">
      <div className="flex items-center justify-center w-5 h-5">
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      </div>
      <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-200">
        Masuk dengan Google
      </span>
    </button>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid, touchedFields },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange", // Validasi real-time
  });

  const watchedPhone = watch("phone", "");
  const watchedPassword = watch("password", "");

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        "https://backend-psi-blond-70.vercel.app/auth/login",
        data,
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("photo", res.data.photo || "");

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
        "https://backend-psi-blond-70.vercel.app/auth/google-login",
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

  // Helper function untuk menampilkan status validasi field
  const getFieldStatus = (fieldName, value) => {
    if (!touchedFields[fieldName]) return null;
    if (errors[fieldName]) return "error";
    if (value && value.length > 0) return "success";
    return null;
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
          onClick={() => {
            console.log("navigating...");
            navigate("/");
          }}
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
                Masuk ke PayungKu
              </h1>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Masukkan nomor telepon dan password untuk melanjutkan
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6">
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
                    className={`w-full pl-12 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 placeholder-gray-400 ${
                      getFieldStatus("phone", watchedPhone) === "error"
                        ? "border-red-300 focus:border-red-500"
                        : getFieldStatus("phone", watchedPhone) === "success"
                        ? "border-green-300 focus:border-green-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="081234567890"
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
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
                    className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 placeholder-gray-400 ${
                      getFieldStatus("password", watchedPassword) === "error"
                        ? "border-red-300 focus:border-red-500"
                        : getFieldStatus("password", watchedPassword) ===
                          "success"
                        ? "border-green-300 focus:border-green-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
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
                  {getFieldStatus("password", watchedPassword) === "error" && (
                    <AlertCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5" />
                  )}
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
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
              <div>
                <GoogleOAuthProvider clientId="257154767258-plt1ivj5fash7e6qcek6mlfih9gpbprl.apps.googleusercontent.com">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => toast.error("Login Google gagal")}
                    render={(renderProps) => (
                      <CustomGoogleButton
                        onClick={renderProps.onClick}
                        disabled={renderProps.disabled}
                      />
                    )}
                    useOneTap={false}
                    auto_select={false}
                    theme="outline"
                    size="large"
                    width="100%"
                  />
                </GoogleOAuthProvider>
              </div>
            </form>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
              <p className="text-sm sm:text-base text-gray-600">
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
