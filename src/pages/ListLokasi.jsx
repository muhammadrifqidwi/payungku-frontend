// src/pages/ListLokasi.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function ListLokasi() {
  const [lokasi, setLokasi] = useState([]);

  useEffect(() => {
    fetch("https://payungku-backend.vercel.app/api/lokasi")
      .then((res) => res.json())
      .then((data) => setLokasi(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Daftar Titik Lokasi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lokasi.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="p-5 bg-white rounded-xl shadow-lg transition">
            <h2 className="text-xl font-semibold">{item.nama}</h2>
            <p className="text-gray-600">{item.alamat}</p>
            <p className="text-sm text-gray-500 mt-1">
              Payung tersedia: {item.jumlahPayung}
            </p>
            <Link
              to={`/lokasi/${item.id}`}
              className="inline-block mt-4 text-blue-600 hover:underline">
              Lihat Detail →
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
