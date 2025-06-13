import React, { useEffect } from "react";
import QRCode from "react-qr-code";

const ReturnQRCode = ({ token, rentCode }) => {
  useEffect(() => {
    if (token) {
      const url = `http://localhost:5173/return/validate/${token}`;
      console.log("QR URL:", url);
    }
  }, [token]);

  const url = `http://localhost:5173/return/validate/${token}`;

  return (
    <div className="text-center p-4">
      <h4 className="text-md font-semibold mb-2 text-gray-800">
        Scan QR Code untuk mengembalikan payung
      </h4>
      <div className="inline-block bg-white p-3 rounded-md shadow-md">
        {token && <QRCode value={url} size={160} />}
      </div>
      <p className="text-sm text-gray-500 mt-2">Kode: {rentCode}</p>
    </div>
  );
};

export default ReturnQRCode;
