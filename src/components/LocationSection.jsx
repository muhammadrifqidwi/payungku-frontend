// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";

function LocationSection({
  center,
  locations,
  userLocation,
  displayedLocations,
  currentPage,
  totalPages,
  handleGetUserLocation,
  goToPage,
  getPageNumbers,
  fadeUp,
}) {
  return (
    <section id="lokasi" className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl font-bold text-center mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}>
          Lokasi Penyewaan Payung
        </motion.h2>

        <motion.div
          className="w-full h-96 rounded-lg overflow-hidden shadow mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={2}>
          <MapContainer
            center={center}
            zoom={14}
            scrollWheelZoom={false}
            className="h-full w-full rounded-lg">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {locations.map((loc) => (
              <Marker key={loc._id} position={[loc.latitude, loc.longitude]}>
                <Popup>
                  <div>
                    <h3 className="font-semibold text-lg">{loc.name}</h3>
                    <p>
                      <strong>Alamat:</strong> {loc.address}
                    </p>
                    <p>
                      <strong>Stok Payung:</strong> {loc.stock}
                    </p>
                    <p>
                      <strong>Loker Tersedia:</strong> {loc.lockers}
                    </p>
                    <p>
                      <strong>Keterangan:</strong>{" "}
                      {loc.description || "Tidak ada keterangan"}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <strong>Anda sedang berada di sini!</strong>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </motion.div>

        <motion.div
          className="flex justify-center mb-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}>
          <button
            onClick={handleGetUserLocation}
            className="px-5 py-2 bg-[#3b82f6] text-white rounded-full hover:bg-[#2563eb] transition">
            Gunakan Lokasi Saya
          </button>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={3}
          key={currentPage}>
          {displayedLocations.map((loc) => (
            <motion.div
              key={loc._id}
              className="bg-white border border-gray-200 p-5 rounded-lg shadow hover:shadow-lg transition"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#dbeafe] text-[#3b82f6]">
                    <MapPin className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {loc.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-medium">Alamat:</span> {loc.address}
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-medium">Stok Payung:</span>{" "}
                    <span
                      className={
                        loc.stock > 10
                          ? "text-green-600 font-medium"
                          : loc.stock > 0
                          ? "text-yellow-600 font-medium"
                          : "text-red-600 font-medium"
                      }>
                      {loc.stock}
                    </span>
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    <span className="font-medium">Loker Tersedia:</span>{" "}
                    {loc.lockers}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#3b82f6] hover:text-[#2563eb] text-sm font-medium flex items-center">
                    Lihat di Google Maps
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md flex items-center justify-center ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#3b82f6] hover:bg-[#dbeafe] transition-colors"
              }`}
              aria-label="Previous page">
              <ChevronLeft className="h-5 w-5" />
            </button>

            {getPageNumbers().map((pageNum, index) => (
              <button
                key={index}
                onClick={() => pageNum !== "..." && goToPage(pageNum)}
                className={`w-10 h-10 flex items-center justify-center rounded-md ${
                  pageNum === currentPage
                    ? "bg-[#3b82f6] text-white font-medium"
                    : pageNum === "..."
                    ? "text-gray-500 cursor-default"
                    : "text-gray-700 hover:bg-[#dbeafe] transition-colors"
                }`}
                disabled={pageNum === "..."}>
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md flex items-center justify-center ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#3b82f6] hover:bg-[#dbeafe] transition-colors"
              }`}
              aria-label="Next page">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default LocationSection;
