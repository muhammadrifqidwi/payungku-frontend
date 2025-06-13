"use client";

import { useEffect, useState } from "react";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  CloudRain,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sun,
  Cloud,
  CloudSnow,
  Zap,
  Wind,
  Eye,
  Droplets,
  Thermometer,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import TataCara from "../components/TataCara";
import LocationSection from "../components/LocationSection";
import FaqList from "../components/FaqList";
import HeroImage from "../assets/HeroSection.png";

// Fix icon leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
};

// Weather icon component
const WeatherIcon = ({ weatherCode, className = "w-6 h-6" }) => {
  const getWeatherIcon = (code) => {
    if (code >= 200 && code < 300) return <Zap className={className} />;
    if (code >= 300 && code < 600) return <CloudRain className={className} />;
    if (code >= 600 && code < 700) return <CloudSnow className={className} />;
    if (code >= 700 && code < 800) return <Wind className={className} />;
    if (code === 800) return <Sun className={className} />;
    if (code > 800) return <Cloud className={className} />;
    return <Sun className={className} />;
  };

  return getWeatherIcon(weatherCode);
};

// Compact Weather Widget for Hero Section
const WeatherWidget = ({ weather, currentDate }) => {
  const getWeatherRecommendation = (weatherCode, temp) => {
    if (weatherCode >= 200 && weatherCode < 600) {
      return {
        message: "Cuaca hujan - Sangat disarankan membawa payung!",
        color: "text-red-600",
        bgColor: "bg-red-50/90",
        borderColor: "border-red-200",
      };
    }
    if (temp > 30) {
      return {
        message: "Cuaca panas - Payung bisa melindungi dari sinar matahari",
        color: "text-orange-600",
        bgColor: "bg-orange-50/90",
        borderColor: "border-orange-200",
      };
    }
    return {
      message: "Cuaca cerah - Hari yang baik untuk beraktivitas",
      color: "text-green-600",
      bgColor: "bg-green-50/90",
      borderColor: "border-green-200",
    };
  };

  const recommendation = getWeatherRecommendation(
    weather.weather[0].id,
    weather.main.temp
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`${recommendation.bgColor} ${recommendation.borderColor} border backdrop-blur-sm rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        <div className="bg-white/80 rounded-full p-2 shadow-sm">
          <WeatherIcon
            weatherCode={weather.weather[0].id}
            className="w-6 h-6 text-blue-600"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <MapPin className="w-3 h-3" />
            <span className="text-xs">{currentDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {Math.round(weather.main.temp)}°C
            </span>
            <span className="text-sm font-medium text-gray-700 capitalize">
              {weather.weather[0].description}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs font-medium flex items-center gap-1">
        <CloudRain className="w-3 h-3" />
        <span className={recommendation.color}>{recommendation.message}</span>
      </div>
    </motion.div>
  );
};

// Enhanced Weather Card Component for dedicated section
const WeatherCard = ({ weather, currentDate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getWeatherRecommendation = (weatherCode, temp) => {
    if (weatherCode >= 200 && weatherCode < 600) {
      return {
        message: "Cuaca hujan - Sangat disarankan membawa payung!",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    }
    if (temp > 30) {
      return {
        message: "Cuaca panas - Payung bisa melindungi dari sinar matahari",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      };
    }
    return {
      message: "Cuaca cerah - Hari yang baik untuk beraktivitas",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    };
  };

  const recommendation = getWeatherRecommendation(
    weather.weather[0].id,
    weather.main.temp
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`${recommendation.bgColor} ${recommendation.borderColor} border-2 rounded-2xl shadow-lg backdrop-blur-sm overflow-hidden`}>
      {/* Main Weather Display */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/80 rounded-full p-3 shadow-md">
              <WeatherIcon
                weatherCode={weather.weather[0].id}
                className="w-8 h-8 text-blue-600"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <MapPin className="w-4 h-4" />
                <span>{currentDate}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {Math.round(weather.main.temp)}°C
                </span>
                <div>
                  <p className="font-semibold text-gray-800 capitalize">
                    {weather.weather[0].description}
                  </p>
                  <p className="text-sm text-gray-600">
                    Terasa seperti {Math.round(weather.main.feels_like)}°C
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-md transition-all duration-200">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Weather Recommendation */}
        <div
          className={`mt-4 p-3 ${recommendation.bgColor} rounded-lg border ${recommendation.borderColor}`}>
          <p
            className={`text-sm font-medium ${recommendation.color} flex items-center gap-2`}>
            <CloudRain className="w-4 h-4" />
            {recommendation.message}
          </p>
        </div>
      </div>

      {/* Expanded Weather Details */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden">
        <div className="px-6 pb-6 border-t border-white/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 mb-1">Jarak Pandang</p>
              <p className="font-semibold text-gray-800">
                {(weather.visibility / 1000).toFixed(1)} km
              </p>
            </div>

            <div className="bg-white/60 rounded-lg p-3 text-center">
              <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 mb-1">Kelembaban</p>
              <p className="font-semibold text-gray-800">
                {weather.main.humidity}%
              </p>
            </div>

            <div className="bg-white/60 rounded-lg p-3 text-center">
              <Wind className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 mb-1">Kecepatan Angin</p>
              <p className="font-semibold text-gray-800">
                {weather.wind?.speed || 0} m/s
              </p>
            </div>

            <div className="bg-white/60 rounded-lg p-3 text-center">
              <Thermometer className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 mb-1">Tekanan</p>
              <p className="font-semibold text-gray-800">
                {weather.main.pressure} hPa
              </p>
            </div>
          </div>

          {/* Temperature Range */}
          <div className="mt-4 bg-white/60 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-2">Rentang Suhu Hari Ini</p>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-sm text-gray-600">Minimum</p>
                <p className="font-semibold text-blue-600">
                  {Math.round(weather.main.temp_min)}°C
                </p>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gradient-to-r from-blue-400 to-red-400 rounded-full"></div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Maksimum</p>
                <p className="font-semibold text-red-600">
                  {Math.round(weather.main.temp_max)}°C
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function LandingPage() {
  const [locations, setLocations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedLocations, setDisplayedLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [setNearestLoc] = useState(null);
  const [weather, setWeather] = useState(null);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    axios
      .get("https://backend-payungku.vercel.app/api/locations")
      .then((res) => {
        setLocations(res.data);
        setTotalPages(Math.ceil(res.data.length / itemsPerPage));
      })
      .catch(console.error);
  }, [itemsPerPage]);

  useEffect(() => {
    if (locations.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setDisplayedLocations(locations.slice(startIndex, endIndex));
    }
  }, [currentPage, locations, itemsPerPage]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API; // Ganti dengan API key kamu
    const lat = -6.595; // Koordinat Bogor
    const lon = 106.816;

    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`
      )
      .then((res) => {
        setWeather(res.data);
      })
      .catch(console.error);

    const today = new Date();
    const formatted = today.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formatted);
  }, []);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      document
        .getElementById("location-cards")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung di browser ini.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Hitung jarak terdekat
        let minDistance = Number.POSITIVE_INFINITY;
        let closest = null;

        locations.forEach((loc) => {
          const d = Math.sqrt(
            Math.pow(latitude - loc.latitude, 2) +
              Math.pow(longitude - loc.longitude, 2)
          );
          if (d < minDistance) {
            minDistance = d;
            closest = loc;
          }
        });

        setNearestLoc(closest);
      },
      () => {
        alert("Gagal mendapatkan lokasi.");
      }
    );
  };

  const center = locations.length
    ? [locations[0].latitude, locations[0].longitude]
    : [-6.597708, 106.804984];

  return (
    <>
      {/* Hero Section */}
      <section
        id="beranda"
        className="bg-gradient-to-b from-[#ebf5ff] to-white min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 sm:pt-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <motion.div
              className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}>
              <motion.div
                className="inline-flex items-center px-4 py-2 rounded-full bg-[#dbeafe] text-[#1e40af] mb-4"
                variants={fadeUp}
                custom={1}>
                <CloudRain className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  Siap Menghadapi Hujan
                </span>
              </motion.div>

              <motion.h1
                className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                variants={fadeUp}
                custom={2}>
                <span className="block">Sewa Payung</span>
                <span className="block text-[#3b82f6]">
                  Kapanpun Dibutuhkan
                </span>
              </motion.h1>

              <motion.p
                className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                variants={fadeUp}
                custom={3}>
                PayungKu menyediakan layanan sewa payung mandiri di berbagai
                lokasi strategis. Ambil payung saat hujan dan kembalikan di
                lokasi terdekat.
              </motion.p>

              <motion.div
                className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4"
                variants={fadeUp}
                custom={4}>
                <a
                  onClick={() => {
                    document
                      .getElementById("lokasi")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center px-5 py-3 text-base font-medium rounded-md text-[#3b82f6] bg-[#dbeafe] hover:bg-[#bfdbfe] transition-shadow duration-300 shadow scroll-smooth cursor-pointer">
                  <MapPin className="h-5 w-5 mr-2" />
                  Temukan Lokasi
                </a>
                <a
                  href="/transaksi"
                  className="inline-flex items-center justify-center px-5 py-3 text-base font-medium rounded-md text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-shadow duration-300 shadow">
                  Sewa Sekarang
                </a>
              </motion.div>

              {/* Compact Weather Widget in Hero */}
              {weather && (
                <motion.div
                  className="mt-8"
                  variants={fadeUp}
                  custom={5}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}>
                  <WeatherWidget weather={weather} currentDate={currentDate} />
                </motion.div>
              )}
            </motion.div>
            <motion.div
              className="mt-10 order-last lg:order-none relative w-full sm:max-w-full sm:mx-auto lg:col-span-6 lg:flex lg:items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={5}>
              <div className="relative mx-auto w-full max-w-md sm:max-w-lg">
                <img
                  src={HeroImage}
                  alt="Ilustrasi Pengguna Payung"
                  className="w-full h-auto object-contain transition-transform duration-500 ease-in-out hover:scale-105"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Weather Section - Dedicated section between Hero and Tata Cara*/}
      {/* {weather && (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Kondisi Cuaca Hari Ini
              </h2>
              <p className="text-gray-600">
                Pantau cuaca untuk merencanakan aktivitas Anda
              </p>
            </motion.div>
            <WeatherCard weather={weather} currentDate={currentDate} />
          </div>
        </section>
      )} */}

      {/* Tata Cara */}
      <section id="tata-cara" className="max-w-6xl mx-auto px-4 py-24">
        <TataCara />
      </section>

      {/* Biaya */}
      <motion.section
        id="biaya"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, amount: 0.3 }}
        className="bg-[#f8fafc] min-h-[80vh] py-24 flex items-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Biaya Sewa Payung
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Sewa payung dengan harga terjangkau untuk kebutuhan harian Anda
          </p>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white shadow-lg rounded-2xl p-8 border border-blue-200 inline-block">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">
              Paket Harian
            </h3>
            <p className="text-5xl font-extrabold text-gray-900 mb-1">
              Rp12.000
            </p>
            <p className="text-gray-500 mb-4">
              Berlaku hingga pukul 19.00 di hari yang sama
            </p>
            <ul className="text-left text-gray-600 space-y-2 mb-6">
              <li>✔ Gunakan payung seharian penuh</li>
              <li>✔ Kembalikan di lokasi manapun</li>
              <li>✔ Tidak perlu registrasi ulang</li>
            </ul>
            <a
              href="#lokasi"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow transition">
              Mulai Sewa Sekarang
            </a>
          </motion.div>
        </div>
      </motion.section>

      {/* Location Section */}
      <LocationSection
        center={center}
        locations={locations}
        userLocation={userLocation}
        displayedLocations={displayedLocations}
        currentPage={currentPage}
        totalPages={totalPages}
        handleGetUserLocation={handleGetUserLocation}
        goToPage={goToPage}
        getPageNumbers={getPageNumbers}
        fadeUp={fadeUp}
      />

      {/* FAQ Section */}
      <section id="faq" className="bg-[#f8fafc] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-500">
              Temukan jawaban untuk pertanyaan umum tentang PayungKu
            </p>
          </motion.div>

          {/* Komponen FAQ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={2}>
            <FaqList />
          </motion.div>

          <motion.div
            className="mt-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={3}>
            <p className="text-gray-600">
              Masih punya pertanyaan?{" "}
              <a
                href="#"
                className="font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors duration-300">
                Hubungi kami
              </a>
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
