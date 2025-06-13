"use client";

/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import {
  Mail,
  Shield,
  Key,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Umbrella,
  Send,
  Lock,
} from "lucide-react";

const ForgotPasswordPage = () => {
  const [userId, setUserId] = useState("");
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // STEP 1: Input nomor/email
  const formSchema1 = z.object({
    input: z.string().min(5, "Isi nomor telepon atau email"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(formSchema1) });

  const handleFindAccount = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post("/auth/forgot-check", data);
      setUserData(res.data);
      setEmail(res.data.email);
      setUserId(res.data.userId);
      setStep(2);

      await axios.post("/auth/send-otp", {
        userId: res.data.userId,
        email: res.data.email,
      });

      toast.success("Kode OTP telah dikirim ke email");
    } catch (err) {
      console.error("ERR:", err);
      toast.error(err.response?.data?.message || "Akun tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: OTP Form
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Masukkan kode OTP");
      return;
    }

    try {
      setLoading(true);
      console.log("Verify OTP Payload:", { email, otp });

      await axios.post("/auth/verify-otp", {
        email,
        otp,
      });
      setStep(3);
      toast.success("OTP valid! Silakan ubah password");
    } catch (err) {
      toast.error("Kode OTP salah atau kedaluwarsa");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async () => {
    if (password.length < 6) return toast.error("Password minimal 6 karakter");
    if (password !== confirmPassword)
      return toast.error("Password tidak cocok");

    try {
      setLoading(true);
      await axios.post("/auth/reset-password", {
        email,
        password,
      });
      toast.success("Password berhasil diubah!");
      window.location.href = "/";
    } catch (err) {
      toast.error("Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await axios.post("/auth/send-otp", {
        userId,
        email,
      });
      toast.success("Kode OTP baru telah dikirim");
    } catch (err) {
      toast.error("Gagal mengirim ulang OTP");
    } finally {
      setLoading(false);
    }
  };

  const stepConfig = [
    {
      number: 1,
      title: "Verifikasi Email",
      description: "Masukkan email yang terdaftar",
      icon: Mail,
      color: "blue",
    },
    {
      number: 2,
      title: "Kode OTP",
      description: "Masukkan kode verifikasi",
      icon: Shield,
      color: "orange",
    },
    {
      number: 3,
      title: "Password Baru",
      description: "Buat password yang aman",
      icon: Key,
      color: "green",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Umbrella className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            Ikuti langkah-langkah untuk mengatur ulang password Anda
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {stepConfig.map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div
                  className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${
                    step >= stepItem.number
                      ? `bg-${stepItem.color}-600 border-${stepItem.color}-600 text-white`
                      : "bg-white border-gray-300 text-gray-400"
                  }
                `}>
                  {step > stepItem.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <stepItem.icon className="w-5 h-5" />
                  )}
                </div>
                {index < stepConfig.length - 1 && (
                  <div
                    className={`
                    w-35 h-0.5 mx-2 transition-all duration-300
                    ${step > stepItem.number ? "bg-green-600" : "bg-gray-300"}
                  `}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-gray-900">
              {stepConfig[step - 1]?.title}
            </h3>
            <p className="text-sm text-gray-600">
              {stepConfig[step - 1]?.description}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Step 1: Email Input */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Temukan Akun Anda
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Masukkan email yang terdaftar untuk melanjutkan
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit(handleFindAccount)}
                  className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...register("input")}
                        type="email"
                        className={`
                          w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                          ${
                            errors.input
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }
                        `}
                        placeholder="example@gmail.com"
                      />
                    </div>
                    {errors.input && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠️</span>
                        {errors.input.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Mencari Akun...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Kirim Kode OTP
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Verifikasi Kode OTP
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Kode verifikasi telah dikirim ke email:
                  </p>
                  <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-700">
                      {userData?.maskedEmail}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode OTP (6 digit)
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center text-2xl font-mono tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Memverifikasi...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Verifikasi Kode
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Tidak menerima kode?
                    </p>
                    <button
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm underline disabled:opacity-50">
                      Kirim Ulang Kode OTP
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <Key className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Buat Password Baru
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Buat password yang kuat untuk keamanan akun Anda
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Baru
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Minimal 6 karakter"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <div className="mt-2">
                      <div
                        className={`text-xs ${
                          password.length >= 6
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}>
                        ✓ Minimal 6 karakter
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Ulangi password baru"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && (
                      <div
                        className={`text-xs mt-2 ${
                          password === confirmPassword
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                        {password === confirmPassword
                          ? "✓ Password cocok"
                          : "✗ Password tidak cocok"}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleResetPassword}
                    disabled={
                      loading ||
                      password.length < 6 ||
                      password !== confirmPassword
                    }
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Menyimpan Password...
                      </>
                    ) : (
                      <>
                        <Key className="w-5 h-5 mr-2" />
                        Simpan Password Baru
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          {step > 1 && (
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="flex items-center text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke langkah sebelumnya
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Ingat password Anda?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium">
              Masuk di sini
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
