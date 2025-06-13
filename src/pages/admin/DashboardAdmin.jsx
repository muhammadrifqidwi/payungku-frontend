"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import TransactionDetail from "../../components/admin/TransactionDetail";
import UserDetail from "../../components/admin/UserDetail";
import LocationDetail from "../../components/admin/LocationDetail";
import AddLocationForm from "../../components/admin/AddLocation";
import { toast } from "sonner";
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
  User as UserIcon,
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
  Edit,
  Trash2,
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

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
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

  const token = localStorage.getItem("token");

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/dashboard"); // Use axiosInstance
      const { users, transactions, locations } = res.data;

      setStats({
        totalUsers: users.filter((u) => u.role === "peminjam").length,
        totalAdmins: users.filter((u) => u.role === "admin").length,
        totalTransactions: transactions.length,
      });

      setAllUsers(users);
      setAllTransactions(transactions);
      setLocations(locations);
      setError("");
    } catch (err) {
      console.error("Failed to load dashboard", err);
      setError("Gagal mengambil data dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get(
        "https://payungku-backend.vercel.app/api/users",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAllUsers(res.data);
    } catch (error) {
      console.error("Gagal memuat pengguna:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, token]);

  const handleDeleteLocation = async (id) => {
    if (window.confirm("Yakin ingin menghapus lokasi ini?")) {
      try {
        await api.delete(`/locations/${id}`);
        // Refresh locations data
        const response = await api.get("/locations");
        setLocations(response.data);
      } catch (err) {
        console.error("Gagal menghapus lokasi:", err);
        setError("Gagal menghapus lokasi");
      }
    }
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

  const handleDeleteTransaction = async (id) => {
    const konfirmasi = window.confirm("Yakin ingin menghapus transaksi ini?");
    if (!konfirmasi) return;

    try {
      await api.delete(`/transactions/${id}`);
      fetchDashboardData(); // refresh data setelah hapus
    } catch (err) {
      console.error(
        "Gagal menghapus transaksi:",
        err.response?.data || err.message
      );
      setError("Gagal menghapus transaksi.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Yakin ingin menghapus pengguna ini?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(
        `https://payungku-backend.vercel.app/api/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Pengguna berhasil dihapus");
      fetchUsers();
    } catch (error) {
      console.error("Gagal menghapus pengguna:", error);
      toast.error("Gagal menghapus pengguna");
    }
  };

  const getPopularLocations = () => {
    const countMap = allTransactions
      .filter(
        (trx) =>
          trx.status === "returned" || (trx.status === "active" && trx.location)
      )
      .reduce((acc, trx) => {
        const locId =
          typeof trx.location === "object" ? trx.location._id : trx.location;
        const locName =
          typeof trx.location === "object" ? trx.location.name : trx.location;
        if (!acc[locId]) {
          acc[locId] = { count: 1, name: locName };
        } else {
          acc[locId].count++;
        }
        return acc;
      }, {});

    return Object.entries(countMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
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
  const currentUsers = Array.isArray(allUsers)
    ? allUsers.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const filteredTransactions = getFilteredTransactions();
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading && !stats) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
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
            text="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
            collapsed={false} // karena tidak collapsible
          />
          <SidebarLink
            icon={<Users />}
            text="Pengguna"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            collapsed={false}
          />
          <SidebarLink
            icon={<ShoppingBag />}
            text="Transaksi"
            active={activeTab === "transactions"}
            onClick={() => setActiveTab("transactions")}
            collapsed={false}
          />
          <SidebarLink
            icon={<MapPin />}
            text="Lokasi"
            active={activeTab === "locations"}
            onClick={() => setActiveTab("locations")}
            collapsed={false}
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
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}>
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-blue-600 flex items-center">
                  <Umbrella className="h-6 w-6 mr-2" />
                  PayungKu
                </h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                <SidebarLink
                  icon={<Home />}
                  text="Dashboard"
                  active={activeTab === "dashboard"}
                  onClick={() => {
                    setActiveTab("dashboard");
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
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button className="flex items-center px-3 py-2 w-full text-red-600 hover:bg-red-50 rounded-md">
                <LogOut className="h-5 w-5 mr-3" />
                <span className="text-sm font-medium">Keluar</span>
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 w-14"></div>
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
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "users" && "Manajemen Pengguna"}
                {activeTab === "transactions" && "Transaksi"}
                {activeTab === "locations" && "Lokasi"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  <Home className="h-4 w-4 mr-2" />
                  Beranda
                </button>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                A
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <>
              {/* Dashboard Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Ringkasan Statistik
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Pantau dan kelola aktivitas PayungKu
                  </p>
                  {activeTab === "dashboard" && (
                    <>
                      <section className="w-full px-6 py-6 space-y-6">
                        {/* Summary Cards */}
                        <div className="grid gap-6 lg:grid-cols-4">
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                Total Pengguna
                              </CardTitle>
                              <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {stats?.totalUsers ?? 0}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Pengguna terdaftar
                              </p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                Total Admin
                              </CardTitle>
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {stats?.totalAdmins ?? 0}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Administrator aktif
                              </p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                Total Transaksi
                              </CardTitle>
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {stats?.totalTransactions ?? 0}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Semua transaksi
                              </p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                Total Lokasi
                              </CardTitle>
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {locations.length}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Lokasi tersedia
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* 4 Analytics Cards Horizontal */}
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
                                        acc[trx.status] =
                                          (acc[trx.status] || 0) + 1;
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
                                        acc[trx.status] =
                                          (acc[trx.status] || 0) + 1;
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
                              <CardDescription>
                                5 transaksi terakhir
                              </CardDescription>
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
                                        {trx.user?.name ??
                                          "Pengguna tidak diketahui"}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDate(trx.createdAt)}
                                      </p>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs">
                                      {trx.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Lokasi Terpopuler */}
                          <Card className="h-full">
                            <CardHeader>
                              <CardTitle>Lokasi Terpopuler</CardTitle>
                              <CardDescription>
                                5 lokasi terbanyak dipinjam
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {getPopularLocations().map(
                                  ([id, loc], index) => (
                                    <div
                                      key={id}
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
                                      <Badge
                                        variant="outline"
                                        className="text-xs">
                                        {loc.count}x
                                      </Badge>
                                    </div>
                                  )
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Status Lokasi */}
                          <Card className="h-full">
                            <CardHeader>
                              <CardTitle>Status Lokasi</CardTitle>
                              <CardDescription>
                                Ketersediaan stok tiap lokasi
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {locations.slice(0, 5).map((loc) => (
                                  <div
                                    key={loc._id}
                                    className="flex items-center space-x-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600">
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
                                          loc.stock > 5
                                            ? "default"
                                            : loc.stock > 0
                                            ? "secondary"
                                            : "destructive"
                                        }
                                        className="text-xs">
                                        {loc.stock} stok
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {loc.stock > 5
                                          ? "Tersedia"
                                          : loc.stock > 0
                                          ? "Terbatas"
                                          : "Kosong"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </section>
                    </>
                  )}
                </div>
              </div>
            </>
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
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                              {user.name.charAt(0)}
                            </div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedUserId(user._id)}
                              className="text-gray-400 hover:text-gray-500">
                              <Eye className="h-4 w-4" />
                            </button>
                            {/* <button className="text-gray-400 hover:text-gray-500">
                              <Edit className="h-4 w-4" />
                            </button> */}
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-gray-400 hover:text-gray-500">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Menampilkan {indexOfFirstItem + 1} -{" "}
                  {Math.min(indexOfLastItem, allUsers.length)} dari{" "}
                  {allUsers.length} pengguna
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalItems={allUsers.length}
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
                  {/* Filter berdasarkan status */}
                  <select
                    className="w-full border rounded p-2"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="returned">Dikembalikan</option>
                  </select>

                  {/* Filter berdasarkan hari */}
                  <input
                    type="date"
                    className="w-full border rounded p-2"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />

                  {/* Tombol aksi */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-4 py-2 bg-gray-200 rounded-md">
                      Batal
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage(1); // penting untuk reset pagination
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
                              #{transaction._id}
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
                                {/* <button className="text-gray-400 hover:text-gray-500">
                                  <Edit className="h-4 w-4" />
                                </button> */}
                                <button
                                  onClick={() =>
                                    handleDeleteTransaction(transaction._id)
                                  }
                                  className="text-gray-400 hover:text-gray-500">
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
                  {Math.min(indexOfLastItem, allTransactions.length)} dari{" "}
                  {allTransactions.length} transaksi
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
              onClose={() => setSelectedLocation(null)}
            />
          )}

          {showAddLocation && (
            <AddLocationForm
              onClose={() => setShowAddLocation(false)}
              onLocationAdded={fetchDashboardData}
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
                    {locations.map((location) => (
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
                        <td className="px-6 py-4 text-center space-x-2">
                          <button
                            onClick={() => setSelectedLocation(location)}
                            className="text-sm text-blue-600 hover:underline">
                            Detail
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(location._id)}
                            className="text-sm text-red-600 hover:underline">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
