// components/FaqList.jsx
import { useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqData = [
  {
    question: "Bagaimana cara menyewa payung di PayungKu?",
    answer:
      "Pertama, Anda perlu login ke akun PayungKu. Setelah berhasil masuk, Anda dapat melihat lokasi titik penyewaan di peta. Pilih lokasi yang tersedia, lalu klik tombol 'Pinjam'. Anda akan diarahkan ke halaman pembayaran menggunakan Midtrans. Setelah pembayaran berhasil, sistem akan mengirimkan kode sewa ke nomor WhatsApp Anda. Gunakan kode tersebut untuk mengambil payung di loker yang tersedia.",
  },
  {
    question: "Berapa biaya sewa payung dan berapa lama durasinya?",
    answer:
      "Biaya sewa payung adalah Rp12.000. Durasi peminjaman berlaku untuk **satu hari kalender yang sama**. Payung harus dikembalikan di hari yang sama sebelum pukul 18:00. Jika melewati batas waktu, Anda akan dianggap terlambat dan dapat dikenakan denda sesuai ketentuan.",
  },
  {
    question: "Bagaimana metode pembayaran yang tersedia di PayungKu?",
    answer:
      "PayungKu menggunakan layanan Midtrans untuk proses pembayaran. Anda bisa memilih berbagai metode seperti GoPay, QRIS, transfer bank (BCA, BNI, BRI, dll), kartu kredit/debit, ShopeePay, Dana, dan lainnya. Semua transaksi dijamin aman dan cepat.",
  },
  {
    question: "Bagaimana saya mendapatkan dan menggunakan kode sewa?",
    answer:
      "Setelah Anda menyelesaikan pembayaran, sistem kami akan secara otomatis menampilkan kode loker untuk pengambilan payung pada area tersebut. Kode ini digunakan untuk mengetahui loker dan mengambil payung secara mandiri di lokasi penyewaan.",
  },
  {
    question: "Apakah saya bisa mengembalikan payung di lokasi yang berbeda?",
    answer: "Ya, Anda bisa mengembalikan payung di lokasi PayungKu manapun.",
  },
  {
    question:
      "Apa yang terjadi jika stok payung habis di lokasi yang saya pilih?",
    answer:
      "Jika stok habis, Anda tidak dapat melakukan peminjaman di lokasi tersebut. Sistem akan menampilkan status 'Stok Habis'. Silakan pilih lokasi lain yang masih memiliki ketersediaan payung.",
  },
  {
    question: "Apakah saya bisa meminjam lebih dari satu payung sekaligus?",
    answer:
      "Tidak. Setiap akun hanya dapat memiliki **satu transaksi peminjaman aktif** dalam satu waktu. Setelah Anda mengembalikan payung sebelumnya, Anda bisa melakukan peminjaman kembali.",
  },
  {
    question:
      "Bagaimana jika saya mengalami kendala saat meminjam atau membayar?",
    answer:
      "Jika terjadi kendala saat menggunakan layanan (gagal bayar, kode tidak terkirim, atau kesalahan teknis), silakan hubungi tim dukungan kami melalui email yang tersedia di halaman Kontak. Tim kami siap membantu Anda secepat mungkin.",
  },
];

const FaqList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState(faqData);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFaqs(faqData);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredFaqs(
        faqData.filter(
          (faq) =>
            faq.question.toLowerCase().includes(q) ||
            faq.answer.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery]);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari pertanyaan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#3b82f6] focus:border-[#3b82f6]"
        />
      </div>

      {filteredFaqs.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">Tidak ada pertanyaan yang cocok.</p>
        </div>
      ) : (
        filteredFaqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex justify-between items-center px-6 py-4 text-left text-gray-900 focus:outline-none">
              <span className="text-lg font-medium">{faq.question}</span>
              <span className="ml-6 flex-shrink-0">
                {openFaqIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-[#3b82f6]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </span>
            </button>
            <div
              className={`px-6 pb-4 transition-all duration-300 ease-in-out ${
                openFaqIndex === index
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}>
              <p className="text-base text-gray-500">{faq.answer}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FaqList;
