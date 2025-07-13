"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import TransactionDetail from "../../components/admin/TransactionDetail";
import UserDetail from "../../components/admin/UserDetail";
import LocationDetail from "../../components/admin/LocationDetail";
import AddLocationForm from "../../components/admin/AddLocation";
import { toast } from "sonner";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Users,
  UserIcon,
  ShoppingBag,
  Loader,
  AlertCircle,
  Home,
  LogOut,
  MapPin,
  Filter,
  User,
  Umbrella,
  Menu,
  X,
  PlusCircle,
  Eye,
  Trash2,
  RotateCw,
} from "lucide-react";

const SidebarLink = ({ icon, text, active, onClick, collapsed = false }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-all ${
        active ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
      }`}>
      <div
        className={`${collapsed ? "" : "mr-3"} ${
          active ? "text-blue-700" : "text-gray-500"
        }`}>
        {icon}
      </div>
      {!collapsed && <span>{text}</span>}
    </button>
  );
};

// Consistent Loader Component
const DashboardLoader = ({ message = "Memuat dashboard..." }) => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="text-center max-w-md">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
        <div className="absolute inset-3 rounded-full bg-blue-50 flex items-center justify-center">
          <Umbrella className="h-8 w-8 text-blue-500" />
        </div>
      </div>
      <p className="text-gray-600 font-medium">{message}</p>
      <p className="text-gray-500 text-sm mt-2">
        Sedang mengambil data dari server
      </p>
      <div className="mt-4 bg-gray-200 rounded-full h-2">
        <div className="bg-blue-500 h-full rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Dashboard Stats Component - Integrated
const DashboardStats = ({ stats, locations, isLoading }) => {
  // Fallback values with validation
  const safeStats = {
    totalUsers: Math.max(0, stats?.totalUsers || 0),
    totalAdmins: Math.max(0, stats?.totalAdmins || 0),
    totalTransactions: Math.max(0, stats?.totalTransactions || 0),
    totalLocations: Math.max(0, locations?.length || 0),
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-12 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{safeStats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">Pengguna terdaftar</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Admin</CardTitle>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{safeStats.totalAdmins}</div>
          <p className="text-xs text-muted-foreground">Administrator aktif</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {safeStats.totalTransactions}
          </div>
          <p className="text-xs text-muted-foreground">Semua transaksi</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Lokasi</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{safeStats.totalLocations}</div>
          <p className="text-xs text-muted-foreground">Lokasi tersedia</p>
        </CardContent>
      </Card>
    </div>
  );
};

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [allTransactions, setAllTransactions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentUser, setCurrentUser] = useState(null);
  const [userFilter, setUserFilter] = useState("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => () => {});

  const token = useMemo(() => localStorage.getItem("token"), []);

  // Ganti fetchAllData dengan implementasi baru
  const fetchAllData = useCallback(async () => {
    if (!token) {
      setError("Token tidak ditemukan. Silakan login kembali.");
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Fetch all data in parallel with proper error handling
      const [dashboardRes, usersRes, transactionsRes, locationsRes] =
        await Promise.allSettled([
          api.get("/admin/dashboard/data", { timeout: 30000 }),
          api.get("/admin/users", { timeout: 30000 }),
          api.get("/admin/transactions", { timeout: 30000 }),
          api.get("/admin/locations", { timeout: 30000 }),
        ]);

      // Process dashboard stats
      if (dashboardRes.status === "fulfilled") {
        const dashboardData = dashboardRes.value.data;
        setStats({
          totalUsers: dashboardData.totalUsers || 0,
          totalAdmins: dashboardData.totalAdmins || 0,
          totalTransactions: dashboardData.totalTransactions || 0,
        });
      } else {
        console.error("Dashboard fetch failed:", dashboardRes.reason);
        // Set default stats if dashboard fails
        setStats({
          totalUsers: 0,
          totalAdmins: 0,
          totalTransactions: 0,
        });
      }

      // Process users
      if (usersRes.status === "fulfilled") {
        const users = usersRes.value.data || [];
        setAllUsers(users);
        // Update stats from actual user data if dashboard failed
        if (dashboardRes.status === "rejected") {
          setStats((prev) => ({
            ...prev,
            totalUsers: users.filter(
              (u) => u.role === "user" || u.role === "peminjam"
            ).length,
            totalAdmins: users.filter((u) => u.role === "admin").length,
          }));
        }
      } else {
        console.error("Users fetch failed:", usersRes.reason);
        setAllUsers([]);
      }

      // Process transactions
      if (transactionsRes.status === "fulfilled") {
        const transactions = transactionsRes.value.data || [];
        setAllTransactions(transactions);
        // Update stats from actual transaction data if dashboard failed
        if (dashboardRes.status === "rejected") {
          setStats((prev) => ({
            ...prev,
            totalTransactions: transactions.length,
          }));
        }
      } else {
        console.error("Transactions fetch failed:", transactionsRes.reason);
        setAllTransactions([]);
      }

      // Process locations
      if (locationsRes.status === "fulfilled") {
        const locations = locationsRes.value.data || [];
        const sorted = [...locations].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLocations(sorted);
      } else {
        console.error("Locations fetch failed:", locationsRes.reason);
        setLocations([]);
      }

      // Check if any critical data failed to load
      const failedRequests = [
        dashboardRes,
        usersRes,
        transactionsRes,
        locationsRes,
      ].filter((res) => res.status === "rejected");

      if (failedRequests.length > 0) {
        const failedCount = failedRequests.length;
        setError(
          `${failedCount} dari 4 data gagal dimuat. Beberapa fitur mungkin terbatas.`
        );
        // Log specific errors for debugging
        failedRequests.forEach((req, index) => {
          const endpoints = ["dashboard", "users", "transactions", "locations"];
          console.error(`${endpoints[index]} error:`, req.reason);
        });
      }
    } catch (err) {
      console.error("Critical error in fetchAllData:", err);
      setError("Gagal memuat data dashboard. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate]);

  // Fallback function to fetch data one by one if parallel fails
  const fetchDataSequentially = useCallback(async () => {
    if (!token) {
      setError("Token tidak ditemukan. Silakan login kembali.");
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      let users = [];
      let transactions = [];
      let locations = [];

      // Fetch users
      try {
        const usersResponse = await api.get("/admin/users", { timeout: 30000 });
        users = usersResponse.data || [];
        setAllUsers(users);
      } catch {
        setAllUsers([]);
      }

      // Fetch transactions
      try {
        const transactionsResponse = await api.get("/admin/transactions", {
          timeout: 30000,
        });
        transactions = transactionsResponse.data || [];
        setAllTransactions(transactions);
      } catch {
        setAllTransactions([]);
      }

      // Fetch locations
      try {
        const locationsResponse = await api.get("/locations", {
          timeout: 30000,
        });
        locations = locationsResponse.data || [];
        const sorted = [...locations].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLocations(sorted);
      } catch {
        setLocations([]);
      }

      // Calculate stats
      const totalUsers = users.filter(
        (u) => u.role === "user" || u.role === "peminjam"
      ).length;
      const totalAdmins = users.filter((u) => u.role === "admin").length;
      const totalTransactions = transactions.length;

      setStats({
        totalUsers,
        totalAdmins,
        totalTransactions,
      });

      // Check for failed fetches
      const failedItems = [];
      if (users.length === 0) failedItems.push("users");
      if (transactions.length === 0) failedItems.push("transactions");
      if (locations.length === 0) failedItems.push("locations");

      if (failedItems.length > 0) {
        setError(
          `Beberapa data gagal dimuat: ${failedItems.join(
            ", "
          )}. Silakan refresh halaman.`
        );
      } else {
        setError("");
      }
    } catch {
      setError("Gagal memuat data dashboard. Periksa koneksi internet Anda.");
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate]);

  // Ganti retryFetch function
  const retryFetch = useCallback(() => {
    fetchDataSequentially();
  }, [fetchDataSequentially]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get("/users/me");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  }, []);

  // Ganti useEffect untuk initial data fetch
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchDataSequentially();
        await fetchCurrentUser();
      } catch {
        await fetchDataSequentially();
      }
    };

    loadData();
  }, [fetchDataSequentially, fetchCurrentUser]);

  const handleDeleteLocation = async (id) => {
    try {
      await api.delete(`/admin/locations/${id}`);
      toast.success("Lokasi berhasil dihapus");
      const response = await api.get("/admin/locations");
      setLocations(response.data);
    } catch (err) {
      console.error("Gagal menghapus lokasi:", err);
      toast.error("Gagal menghapus lokasi");
    }
  };

  const showDeleteConfirmation = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getFilteredTransactions = () => {
    return allTransactions.filter((trx) => {
      const matchStatus = filterStatus ? trx.status === filterStatus : true;
      const matchDate = filterDate
        ? new Date(trx.createdAt).toDateString() ===
          new Date(filterDate).toDateString()
        : true;
      return matchStatus && matchDate;
    });
  };

  const getFilteredUsers = () => {
    if (userFilter === "all") return allUsers;
    if (userFilter === "peminjam")
      return allUsers.filter(
        (user) => user.role === "user" || user.role === "peminjam"
      );
    if (userFilter === "admin")
      return allUsers.filter((user) => user.role === "admin");
    return allUsers;
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await api.delete(`/admin/transactions/${id}`);
      toast.success("Transaksi berhasil dihapus");
      setAllTransactions((prev) => prev.filter((trx) => trx._id !== id));
    } catch (err) {
      console.error("Gagal menghapus transaksi:", err);
      toast.error("Gagal menghapus transaksi");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("Pengguna berhasil dihapus");
      setAllUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Gagal menghapus pengguna:", error);
      toast.error("Gagal menghapus pengguna");
    }
  };

  // Fixed popular locations function - now properly updates with latest transactions
  const getPopularLocations = () => {
    if (!allTransactions.length) {
      return [];
    }

    // Create a more accurate location count map
    const locationCounts = new Map();

    // Process transactions - only count completed/active ones
    allTransactions
      .filter((trx) => {
        const hasLocation =
          trx.location &&
          (typeof trx.location === "object" ? trx.location._id : trx.location);
        const validStatus = ["returned", "active", "completed"].includes(
          trx.status
        );
        return hasLocation && validStatus;
      })
      .forEach((trx) => {
        const locationId =
          typeof trx.location === "object" ? trx.location._id : trx.location;
        const locationName =
          typeof trx.location === "object"
            ? trx.location.name
            : locations.find((loc) => loc._id === locationId)?.name ||
              `Location ${locationId}`;

        if (locationId) {
          const existing = locationCounts.get(locationId);
          if (existing) {
            existing.count++;
            // Update with latest transaction if newer
            if (new Date(trx.createdAt) > new Date(existing.lastTransaction)) {
              existing.lastTransaction = trx.createdAt;
            }
          } else {
            locationCounts.set(locationId, {
              id: locationId,
              name: locationName,
              count: 1,
              lastTransaction: trx.createdAt,
            });
          }
        }
      });

    // Convert to array and sort
    const result = Array.from(locationCounts.values())
      .sort((a, b) => {
        // Primary sort: by count (descending)
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        // Secondary sort: by latest transaction (descending)
        return new Date(b.lastTransaction) - new Date(a.lastTransaction);
      })
      .slice(0, 5);

    return result;
  };

  // Get 5 locations with lowest stock
  const getLowestStockLocations = () => {
    if (!locations.length) {
      return [];
    }

    const result = [...locations]
      .filter((loc) => typeof loc.stock === "number") // Ensure stock is a number
      .sort((a, b) => {
        // Primary sort: by stock (ascending)
        if (a.stock !== b.stock) {
          return a.stock - b.stock;
        }
        // Secondary sort: by name (alphabetical)
        return a.name.localeCompare(b.name);
      })
      .slice(0, 5);

    return result;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "returned":
        return "bg-green-100 text-green-800";
      case "pending":
      case "active":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredUsers = getFilteredUsers();
  const currentUsers = Array.isArray(filteredUsers)
    ? filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const filteredTransactions = getFilteredTransactions();
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Loading state
  if (isLoading) {
    return <DashboardLoader />;
  }

  // Critical error state
  if (!stats && error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Gagal Memuat Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={retryFetch}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition">
              {isLoading ? "Sedang mencoba..." : "Coba Lagi"}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
              Refresh Halaman
            </button>
            <button
              onClick={() => navigate("/")}
              className="block w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition">
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ConfirmModal = ({ show, title, message, onCancel, onConfirm }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Tidak
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Warning banner for partial data load */}
      {error && stats && (
        <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">{error}</p>
              <button
                onClick={retryFetch}
                className="mt-2 text-xs text-yellow-700 underline hover:text-yellow-900">
                Coba muat ulang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden md:flex flex-col bg-white border-r border-gray-200 w-60">
        <div className="flex items-center justify-start px-4 py-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600 flex items-center">
            <Umbrella className="h-6 w-6 mr-2" />
            PayungKu
          </h1>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          <SidebarLink
            icon={<Home />}
            text="Ringkasan"
            active={activeTab === "ringkasan"}
            onClick={() => setActiveTab("ringkasan")}
          />
          <SidebarLink
            icon={<Users />}
            text="Pengguna"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <SidebarLink
            icon={<ShoppingBag />}
            text="Transaksi"
            active={activeTab === "transactions"}
            onClick={() => setActiveTab("transactions")}
          />
          <SidebarLink
            icon={<MapPin />}
            text="Lokasi"
            active={activeTab === "locations"}
            onClick={() => setActiveTab("locations")}
          />
        </nav>

        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:bg-red-50 rounded-md w-full px-3 py-2">
            <LogOut className="h-5 w-5" />
            <span className="ml-3 text-sm font-medium">Keluar</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-white w-72 max-w-full h-full shadow-xl z-50">
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <div className="flex items-center space-x-2">
                <Umbrella className="text-blue-500 h-6 w-6" />
                <span className="text-lg font-semibold text-gray-800">
                  PayungKu
                </span>
              </div>
              <button
                className="text-gray-500 hover:text-red-600 transition"
                onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col py-4 px-3 space-y-2">
              <SidebarLink
                icon={<Home />}
                text="Ringkasan"
                active={activeTab === "ringkasan"}
                onClick={() => {
                  setActiveTab("ringkasan");
                  setMobileMenuOpen(false);
                }}
              />
              <SidebarLink
                icon={<Users />}
                text="Pengguna"
                active={activeTab === "users"}
                onClick={() => {
                  setActiveTab("users");
                  setMobileMenuOpen(false);
                }}
              />
              <SidebarLink
                icon={<ShoppingBag />}
                text="Transaksi"
                active={activeTab === "transactions"}
                onClick={() => {
                  setActiveTab("transactions");
                  setMobileMenuOpen(false);
                }}
              />
              <SidebarLink
                icon={<MapPin />}
                text="Lokasi"
                active={activeTab === "locations"}
                onClick={() => {
                  setActiveTab("locations");
                  setMobileMenuOpen(false);
                }}
              />
            </div>

            <div className="mt-auto px-4 py-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-md">
                <LogOut className="h-5 w-5 mr-3" />
                <span className="text-sm font-medium">Keluar</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-2 md:ml-0 text-xl font-bold text-gray-800">
                {activeTab === "ringkasan" && "Ringkasan Statistik"}
                {activeTab === "users" && "Manajemen Pengguna"}
                {activeTab === "transactions" && "Manajemen Transaksi"}
                {activeTab === "locations" && "Manajemen Lokasi"}
              </h1>
            </div>
            {/* Tambahkan refresh button di header untuk debugging: */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  <Home className="h-4 w-4 mr-2" />
                  Beranda
                </button>
              </div>
              {/* Debug refresh button */}
              <button
                onClick={retryFetch}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition disabled:opacity-50"
                title="Refresh data">
                <RotateCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
              <div className="relative">
                {currentUser?.profilePhoto ? (
                  <img
                    src={currentUser.profilePhoto || "/placeholder.svg"}
                    alt={currentUser.name || "Profile"}
                    className="h-8 w-8 rounded-full object-cover border-2 border-blue-500 cursor-pointer hover:border-blue-600 transition-colors"
                    onClick={() => navigate("/profile")}
                  />
                ) : (
                  <button
                    onClick={() => navigate("/profile")}
                    className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium hover:bg-blue-700 transition-colors">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || "A"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          {/* Ringkasan Tab */}
          {activeTab === "ringkasan" && (
            <section className="w-full space-y-6">
              {/* Summary Cards - Using separate component for better accuracy */}
              <DashboardStats
                stats={stats}
                locations={locations}
                isLoading={isLoading}
              />

              {/* Analytics Cards */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {/* Distribusi Status Transaksi */}
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Distribusi Status Transaksi</CardTitle>
                    <CardDescription>
                      Visualisasi status transaksi saat ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={Object.entries(
                            allTransactions.reduce((acc, trx) => {
                              acc[trx.status] = (acc[trx.status] || 0) + 1;
                              return acc;
                            }, {})
                          ).map(([status, value]) => ({
                            name: status,
                            value,
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value">
                          {Object.keys(
                            allTransactions.reduce((acc, trx) => {
                              acc[trx.status] = (acc[trx.status] || 0) + 1;
                              return acc;
                            }, {})
                          ).map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Transaksi Terbaru */}
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Transaksi Terbaru</CardTitle>
                    <CardDescription>5 transaksi terakhir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {allTransactions.slice(0, 5).map((trx) => (
                        <div
                          key={trx._id}
                          className="flex items-center space-x-4">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {trx.user?.name?.charAt(0) ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {trx.user?.name ?? "Pengguna tidak diketahui"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(trx.createdAt)}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {trx.status}
                          </Badge>
                        </div>
                      ))}
                      {allTransactions.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Belum ada transaksi</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Lokasi Terpopuler - Fixed to update with latest transactions */}
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Lokasi Terpopuler</CardTitle>
                    <CardDescription>
                      5 lokasi terbanyak dipinjam (terbaru)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getPopularLocations().map((loc, index) => (
                        <div
                          key={loc.id}
                          className="flex items-center space-x-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {loc.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {loc.count} kali peminjaman
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {loc.count}x
                          </Badge>
                        </div>
                      ))}
                      {getPopularLocations().length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Belum ada data peminjaman</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 5 Lokasi Stok Terendah - Replaced status lokasi */}
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Stok Payung Terendah</CardTitle>
                    <CardDescription>
                      5 lokasi dengan stok paling sedikit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getLowestStockLocations().map((loc) => (
                        <div
                          key={loc._id}
                          className="flex items-center space-x-4">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full ${
                              loc.stock === 0
                                ? "bg-red-100 text-red-600"
                                : loc.stock <= 2
                                ? "bg-orange-100 text-orange-600"
                                : loc.stock <= 5
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-green-100 text-green-600"
                            }`}>
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {loc.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {loc.lockers} loker tersedia
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge
                              variant={
                                loc.stock === 0
                                  ? "destructive"
                                  : loc.stock <= 2
                                  ? "secondary"
                                  : loc.stock <= 5
                                  ? "outline"
                                  : "default"
                              }
                              className="text-xs">
                              {loc.stock} stok
                            </Badge>
                            <span
                              className={`text-xs ${
                                loc.stock === 0
                                  ? "text-red-600"
                                  : loc.stock <= 2
                                  ? "text-orange-600"
                                  : loc.stock <= 5
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}>
                              {loc.stock === 0
                                ? "Kosong"
                                : loc.stock <= 2
                                ? "Kritis"
                                : loc.stock <= 5
                                ? "Rendah"
                                : "Aman"}
                            </span>
                          </div>
                        </div>
                      ))}
                      {locations.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Belum ada lokasi terdaftar</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {/* Users Tab */}
          {selectedUserId && (
            <UserDetail
              userId={selectedUserId}
              onClose={() => setSelectedUserId(null)}
            />
          )}
          {activeTab === "users" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Manajemen Pengguna
                  </h3>
                  <p className="text-sm text-gray-500">
                    Kelola semua pengguna dalam sistem
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={userFilter}
                    onChange={(e) => {
                      setUserFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">
                      Semua Pengguna ({allUsers.length})
                    </option>
                    <option value="peminjam">
                      Peminjam (
                      {
                        allUsers.filter(
                          (u) => u.role === "user" || u.role === "peminjam"
                        ).length
                      }
                      )
                    </option>
                    <option value="admin">
                      Admin ({allUsers.filter((u) => u.role === "admin").length}
                      )
                    </option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pengguna
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.profilePhoto ? (
                              <img
                                src={user.profilePhoto || "/placeholder.svg"}
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                {user.name.charAt(0)}
                              </div>
                            )}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                            }`}>
                            {user.role === "admin"
                              ? "Administrator"
                              : "Peminjam"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedUserId(user._id)}
                              className="text-gray-400 hover:text-blue-500 transition-colors"
                              title="Lihat Detail">
                              <Eye className="h-4 w-4" />
                            </button>
                            {user.role !== "admin" && (
                              <button
                                onClick={() =>
                                  showDeleteConfirmation(
                                    `Yakin ingin menghapus pengguna "${user.name}"?`,
                                    () => handleDeleteUser(user._id)
                                  )
                                }
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Hapus Pengguna">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {currentUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">
                            {userFilter === "all"
                              ? "Belum ada pengguna terdaftar"
                              : `Belum ada ${
                                  userFilter === "admin"
                                    ? "administrator"
                                    : "peminjam"
                                } terdaftar`}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Menampilkan {indexOfFirstItem + 1} -{" "}
                  {Math.min(indexOfLastItem, filteredUsers.length)} dari{" "}
                  {filteredUsers.length}{" "}
                  {userFilter === "all" ? "pengguna" : userFilter} pengguna
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredUsers.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={paginate}
                />
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {selectedTransactionId && (
            <TransactionDetail
              transactionId={selectedTransactionId._id}
              onClose={() => setSelectedTransactionId(null)}
            />
          )}
          {isFilterOpen && (
            <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4">Filter Transaksi</h2>
                <div className="space-y-4">
                  <select
                    className="w-full border rounded p-2"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="returned">Dikembalikan</option>
                    <option value="late">Terlambat</option>
                    <option value="pending">Pending</option>
                  </select>

                  <input
                    type="date"
                    className="w-full border rounded p-2"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-4 py-2 bg-gray-200 rounded-md">
                      Batal
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage(1);
                        setIsFilterOpen(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md">
                      Terapkan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Transaksi
                  </h3>
                  <p className="text-sm text-gray-500">
                    Daftar transaksi peminjaman dan pengembalian payung
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pengguna
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lokasi
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktivitas
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center text-gray-500 py-6 text-sm font-medium">
                          Tidak ada data transaksi.
                        </td>
                      </tr>
                    ) : (
                      currentTransactions.map((transaction) => {
                        const tanggalTransaksi =
                          transaction.date ||
                          transaction.createdAt ||
                          transaction.borrowDate ||
                          transaction.returnDate ||
                          null;

                        return (
                          <tr
                            key={transaction._id}
                            className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{transaction._id.slice(-6)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-4 w-4 text-gray-500" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {transaction.user?.name ?? "-"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {typeof transaction.location === "object"
                                ? transaction.location?.name
                                : transaction.location}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(tanggalTransaksi)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  transaction.status
                                )}`}>
                                {transaction.type === "borrow"
                                  ? "Peminjaman"
                                  : "Pengembalian"}{" "}
                                - {transaction.status ?? "-"}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    setSelectedTransactionId(transaction)
                                  }
                                  className="text-gray-400 hover:text-gray-500">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    showDeleteConfirmation(
                                      `Yakin ingin menghapus transaksi #${transaction._id.slice(
                                        -6
                                      )}?`,
                                      () =>
                                        handleDeleteTransaction(transaction._id)
                                    )
                                  }
                                  className="text-gray-400 hover:text-red-500"
                                  title="Hapus Transaksi">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Menampilkan {indexOfFirstItem + 1} -{" "}
                  {Math.min(indexOfLastItem, filteredTransactions.length)} dari{" "}
                  {filteredTransactions.length} transaksi
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredTransactions.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={paginate}
                />
              </div>
            </div>
          )}

          {/* Locations Tab */}
          {selectedLocation && (
            <LocationDetail
              locationId={selectedLocation._id}
              onClose={(shouldRefresh) => {
                setSelectedLocation(null);
                if (shouldRefresh) {
                  fetchAllData();
                }
              }}
            />
          )}

          {showAddLocation && (
            <AddLocationForm
              onClose={() => setShowAddLocation(false)}
              onAdd={(newLocation) => {
                setShowAddLocation(false);
                setLocations((prev) => [newLocation, ...prev]);
                fetchAllData();
              }}
            />
          )}

          {activeTab === "locations" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Lokasi Payung
                  </h3>
                  <p className="text-sm text-gray-500">
                    Kelola lokasi peminjaman dan pengembalian payung
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowAddLocation(true)}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Tambah Lokasi
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                        Nama Lokasi
                      </th>
                      <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase">
                        Stok
                      </th>
                      <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase">
                        Loker
                      </th>
                      <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {[...locations]
                      .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      )
                      .map((location) => (
                        <tr key={location._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {location.name}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-900">
                            {location.stock}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-900">
                            {location.lockers}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                location.stock > 5
                                  ? "bg-green-100 text-green-800"
                                  : location.stock > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                              {location.stock > 5
                                ? "Tersedia"
                                : location.stock > 0
                                ? "Terbatas"
                                : "Kosong"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setSelectedLocation(location)}
                              className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                              title="Lihat Detail">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                showDeleteConfirmation(
                                  `Yakin ingin menghapus lokasi "${location.name}"?`,
                                  () => handleDeleteLocation(location._id)
                                )
                              }
                              className="p-1 rounded-full text-gray-400 hover:text-red-500"
                              title="Hapus Lokasi">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <ConfirmModal
            show={showConfirmModal}
            title="Konfirmasi Penghapusan"
            message={confirmMessage}
            onCancel={() => setShowConfirmModal(false)}
            onConfirm={() => {
              confirmAction();
              setShowConfirmModal(false);
            }}
          />
        </main>
      </div>
    </div>
  );
};

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50">
        Sebelumnya
      </button>
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
            currentPage === number
              ? "text-gray-700 bg-gray-100"
              : "text-gray-500 bg-white hover:bg-gray-50"
          }`}>
          {number}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50">
        Berikutnya
      </button>
    </div>
  );
};

export default DashboardAdmin;
