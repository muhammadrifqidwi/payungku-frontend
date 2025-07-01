import { Umbrella, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const handleLinkClick = (e, href) => {
    e.preventDefault();

    const targetId = href.replace("#", "");
    if (location.pathname !== "/") {
      navigate(`/#${targetId}`);
    } else {
      const section = document.querySelector(href);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
              <Umbrella className="h-8 w-8 text-[#60a5fa]" />
              <span className="ml-2 text-xl font-bold">PayungKu</span>
            </div>
            <p className="mt-4 text-gray-400">
              Layanan sewa payung mandiri yang praktis dan terjangkau. Siap
              menemani Anda di saat hujan.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#beranda"
                  onClick={(e) => handleLinkClick(e, "#beranda")}
                  className="hover:text-[#60a5fa]">
                  Beranda
                </a>
              </li>
              <li>
                <a
                  href="#tata-cara"
                  onClick={(e) => handleLinkClick(e, "#tata-cara")}
                  className="hover:text-[#60a5fa]">
                  Tata cara
                </a>
              </li>
              <li>
                <a
                  href="#biaya"
                  onClick={(e) => handleLinkClick(e, "#biaya")}
                  className="hover:text-[#60a5fa]">
                  Biaya
                </a>
              </li>
              <li>
                <a
                  href="#lokasi"
                  onClick={(e) => handleLinkClick(e, "#lokasi")}
                  className="hover:text-[#60a5fa]">
                  Lokasi
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => handleLinkClick(e, "#faq")}
                  className="hover:text-[#60a5fa]">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Informasi Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="javascript:void(0)" className="hover:text-[#60a5fa]">
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a href="javascript:void(0)" className="hover:text-[#60a5fa]">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="javascript:void(0)" className="hover:text-[#60a5fa]">
                  Kebijakan Pengembalian
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Ikuti Kami</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 flex justify-between items-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} PayungKu. All rights reserved.
          </p>
          <p className="text-gray-400">Muhammad Rifqi Dwi Putra</p>
        </div>
      </div>
    </footer>
  );
}
