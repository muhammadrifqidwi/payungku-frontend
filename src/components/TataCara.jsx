"use client";

import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  UserCheck,
  MapPin,
  CreditCard,
  QrCode,
  Umbrella,
  Search,
  Key,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

function HowItWorks() {
  const [activeTab, setActiveTab] = useState("peminjaman");

  const peminjamanSteps = [
    {
      icon: UserCheck,
      title: "Registrasi / Login",
      description: "Masuk ke akun Anda dengan nomor HP dan password.",
    },
    {
      icon: MapPin,
      title: "Temukan Titik Lokasi",
      description:
        "Lihat peta untuk menemukan titik penyewaan payung terdekat.",
    },
    {
      icon: CreditCard,
      title: "Lakukan Pembayaran",
      description: "Pilih lokasi dan lakukan pembayaran melalui Midtrans.",
    },
    {
      icon: QrCode,
      title: "Dapatkan Kode Sewa",
      description: "Setelah pembayaran berhasil, Anda akan menerima kode unik.",
    },
    {
      icon: Umbrella,
      title: "Ambil Payung di Lokasi",
      description:
        "Gunakan kode tersebut untuk membuka loker dan ambil payung.",
    },
  ];

  const pengembalianSteps = [
    {
      icon: Search,
      title: "Deteksi Lokasi Anda",
      description: "Sistem akan mencarikan titik pengembalian terdekat.",
    },
    {
      icon: MapPin,
      title: "Kunjungi Titik Pengembalian",
      description: "Datangi lokasi yang ditunjukkan oleh sistem.",
    },
    {
      icon: QrCode,
      title: "Scan Barcode di Loker",
      description: "Scan kode di lokasi sebagai validasi pengembalian.",
    },
    {
      icon: Key,
      title: "Masukkan Kode Pengembalian",
      description: "Gunakan kode sewa untuk membuka dan mengembalikan payung.",
    },
    {
      icon: CheckCircle,
      title: "Konfirmasi Selesai",
      description: "Sistem akan memperbarui status transaksi dan stok payung.",
    },
  ];

  return (
    <section id="cara-kerja" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Cara Kerja PayungKu
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Sewa payung dengan mudah melalui website kami
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mt-12 flex justify-center">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setActiveTab("peminjaman")}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "peminjaman"
                  ? "bg-white text-[#3b82f6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}>
              Tata Cara Peminjaman
            </button>
            <button
              onClick={() => setActiveTab("pengembalian")}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "pengembalian"
                  ? "bg-white text-[#3b82f6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}>
              Tata Cara Pengembalian
            </button>
          </div>
        </div>

        {/* Tata Cara Peminjaman */}
        {activeTab === "peminjaman" && (
          <div className="mt-16">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Steps */}
                <div className="hidden md:flex z-10 justify-between">
                  {peminjamanSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center mb-12 md:mb-0">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="relative">
                        {/* Step Number */}
                        <div className="absolute -top-3 -right-3 bg-[#3b82f6] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>

                        {/* Icon Circle */}
                        <div className="w-20 h-20 rounded-full bg-white border-4 border-[#dbeafe] flex items-center justify-center shadow-md mb-4">
                          <step.icon className="h-8 w-8 text-[#3b82f6]" />
                        </div>

                        {/* Arrow for mobile */}
                        <div className="md:hidden flex justify-center my-2">
                          <ArrowRight className="h-5 w-5 text-[#3b82f6]" />
                        </div>
                      </motion.div>

                      {/* Text Content */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="text-center px-4 max-w-[180px]">
                        <h3 className="font-semibold text-[#3b82f6] mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {step.description}
                        </p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile View - Vertical Steps */}
              <div className="md:hidden mt-8">
                {peminjamanSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start mb-8 relative">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#dbeafe] flex items-center justify-center mr-4 z-10">
                      <step.icon className="h-6 w-6 text-[#3b82f6]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#3b82f6]">
                        {index + 1}. {step.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tata Cara Pengembalian */}
        {activeTab === "pengembalian" && (
          <div className="mt-16">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Steps */}
                <div className="hidden md:flex z-10 justify-between">
                  {pengembalianSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center mb-12 md:mb-0">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="relative">
                        {/* Step Number */}
                        <div className="absolute -top-3 -right-3 bg-[#3b82f6] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>

                        {/* Icon Circle */}
                        <div className="w-20 h-20 rounded-full bg-white border-4 border-[#dbeafe] flex items-center justify-center shadow-md mb-4">
                          <step.icon className="h-8 w-8 text-[#3b82f6]" />
                        </div>

                        {/* Arrow for mobile */}
                        <div className="md:hidden flex justify-center my-2">
                          <ArrowRight className="h-5 w-5 text-[#3b82f6]" />
                        </div>
                      </motion.div>

                      {/* Text Content */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="text-center px-4 max-w-[180px]">
                        <h3 className="font-semibold text-[#3b82f6] mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {step.description}
                        </p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile View - Vertical Steps */}
              <div className="md:hidden mt-8">
                {pengembalianSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start mb-8 relative">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e0f2fe] flex items-center justify-center mr-4 z-10">
                      <step.icon className="h-6 w-6 text-[#3b82f6]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#3b82f6]">
                        {index + 1}. {step.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 text-center">
          <a
            href="#lokasi"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors duration-300 shadow-md">
            Temukan Lokasi Terdekat
          </a>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
