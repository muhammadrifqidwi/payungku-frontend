import { useState, useEffect } from "react";
import {
  X,
  User,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Umbrella,
  CheckCircle,
  ArrowLeft,
  FileText,
  CreditCard,
  Tag,
  Clipboard,
} from "lucide-react";
import api from "../../utils/axiosInstance";
import { toast } from "sonner";

const TransactionDetail = ({ transactionId, onClose }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState("");

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/transactions/${transactionId}`);
        setTransaction(response.data);
        setError("");
      } catch (err) {
        console.error("❌ Error fetching transaction details:", err);
        setError("Gagal memuat data transaksi");
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransactionDetails();
    }
  }, [transactionId]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Selesai
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4 mr-1" />
            Menunggu
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-4 w-4 mr-1" />
            Gagal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-6" />
            <p className="text-gray-700 font-medium">
              Memuat detail transaksi...
            </p>
            <p className="text-gray-500 text-sm mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Data Tidak Ditemukan
            </h3>
            <p className="text-gray-600 mb-6">
              Transaksi tidak ditemukan atau terjadi kesalahan saat memuat data.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm w-full">
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:py-10">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="mr-3 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold text-white">
                  Detail Transaksi
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Transaction ID & Status Banner */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-sm text-gray-500">ID Transaksi</div>
                <div className="text-lg font-semibold text-gray-800">
                  #{transaction._id}
                </div>
              </div>
              <div>{getStatusBadge(transaction.status)}</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Transaction Type Card */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-200">
              <div className="flex items-center">
                <div
                  className={`p-3 rounded-full ${
                    transaction.type === "borrow"
                      ? "bg-blue-100"
                      : "bg-green-100"
                  }`}>
                  {transaction.type === "borrow" ? (
                    <Umbrella className="h-6 w-6 text-blue-600" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {transaction.type === "borrow"
                      ? "Peminjaman"
                      : "Pengembalian"}{" "}
                    Payung
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(transaction.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* User Information */}
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">
                  Informasi Pengguna
                </h4>

                <div className="flex items-start">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Pengguna
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {typeof transaction.user === "object"
                        ? transaction.user.name
                        : transaction.user}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Lokasi</p>
                    <p className="text-base font-medium text-gray-900">
                      {typeof transaction.location === "object"
                        ? transaction.location.name
                        : transaction.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-50 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Tanggal Transaksi
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                </div>

                {transaction.returnTime && (
                  <div className="flex items-start">
                    <div className="bg-orange-50 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Tanggal Pengembalian
                      </p>
                      <p className="text-base font-medium text-gray-900">
                        {formatDateTime(transaction.returnTime)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Transaction Details */}
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">
                  Detail Transaksi
                </h4>

                <div className="flex items-start">
                  <div className="bg-yellow-50 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Status Pembayaran
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {transaction.paymentStatus || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-indigo-50 p-2 rounded-lg">
                    <Tag className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="ml-4 w-full">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Kode Transaksi
                    </p>
                    <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md">
                      <span className="text-sm font-medium text-gray-800 font-mono">
                        {transaction.rentCode || "-"}
                      </span>
                      {transaction.rentCode && (
                        <button
                          onClick={() => {
                            navigator.clipboard
                              .writeText(transaction.rentCode)
                              .then(() =>
                                toast.success("Kode transaksi disalin!")
                              )
                              .catch(() => toast.error("Gagal menyalin kode"));
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Salin Kode">
                          <Clipboard className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-teal-50 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-teal-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Status Transaksi
                    </p>
                    <div className="mt-1">
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">
                Timeline Transaksi
              </h4>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="rounded-full h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Transaksi Dibuat
                    </h5>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                </div>

                {transaction.processedAt && (
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="rounded-full h-8 w-8 flex items-center justify-center bg-yellow-100 text-yellow-600">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">
                        Transaksi Diproses
                      </h5>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(transaction.processedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {transaction.completedAt && (
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="rounded-full h-8 w-8 flex items-center justify-center bg-green-100 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">
                        Transaksi Selesai
                      </h5>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(transaction.completedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
