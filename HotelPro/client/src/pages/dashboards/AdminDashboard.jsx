import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  Alert,
  IconButton,
  InputAdornment
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNotify } from "../../context/NotificationContext";
import { api } from "../../services/api";
import { formatINR } from "../../utils/currency";
import { handleImageFallback, getHotelImageUrl, getRoomImageUrl } from "../../utils/imageFallback";
import {
  TrendingUp,
  DollarSign,
  Users,
  Bed,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  X,
  ShieldCheck,
  Building,
  RefreshCw,
  AlertCircle,
  Search,
  UserPlus,
  Briefcase,
  ClipboardList,
  CreditCard,
  Ban,
  Check,
  LogOut
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { notify } = useNotify();
  const navigate = useNavigate();

  const handleAdminSignOut = async () => {
    try {
      await logout();
      notify("Administrator session terminated securely.", "info");
      navigate("/login");
    } catch (err) {
      navigate("/login");
    }
  };

  const [metrics, setMetrics] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Tabs: 0: Overview, 1: Users, 2: Staff & Tasks, 3: Bookings & Payments, 4: Hotels, 5: Suites
  const [activeTab, setActiveTab] = useState(0);

  // User search and filter
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  // Booking search and filter
  const [bookingFilter, setBookingFilter] = useState("all");

  // Staff provisioning modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [newStaffData, setNewStaffData] = useState({
    name: "",
    email: "",
    password: "",
    department: "Front Desk",
    employeeId: ""
  });
  const [staffSubmitting, setStaffSubmitting] = useState(false);

  // Task creation modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    department: "Front Desk",
    priority: "Normal",
    deadline: "",
    assignedTo: ""
  });
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  // Hotel modal
  const [isAddHotelModalOpen, setIsAddHotelModalOpen] = useState(false);
  const [newHotelData, setNewHotelData] = useState({
    name: "",
    propertyCategory: "Heritage Palace",
    city: "Jaipur",
    state: "Rajasthan",
    startingPrice: 6500,
    starClassification: 5,
    summary: ""
  });

  // Suite modal
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: "",
    category: "Garden Suite",
    property: "HotelPro Estate & Botanical Sanctuary",
    location: "Cotswolds, United Kingdom",
    pricePerNight: 450,
    guests: 2,
    bedrooms: 1,
    sizeSqM: 65,
    summary: "",
    description: "",
    heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=85",
    amenities: "Private Plunge Pool, Wood-Burning Fireplace, High-Speed Wi-Fi, Dyptique Toiletries"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const [
        metricsRes,
        roomsRes,
        bookingsRes,
        hotelsRes,
        usersRes,
        staffRes,
        tasksRes
      ] = await Promise.all([
        api.getAdminMetrics(),
        api.getRooms(),
        api.getAllAdminBookings ? api.getAllAdminBookings() : api.getAllBookings(),
        api.getAdminHotels(),
        api.getAllUsers().catch(() => ({ users: [] })),
        api.getAllStaff().catch(() => ({ staff: [] })),
        api.getAllAdminTasks().catch(() => ({ tasks: [] }))
      ]);

      setMetrics(metricsRes.metrics);
      setRooms(roomsRes || []);
      setBookings(bookingsRes.bookings || bookingsRes || []);
      setHotels(hotelsRes.hotels || []);
      setUsersList(usersRes.users || []);
      setStaffList(staffRes.staff || []);
      setTasksList(tasksRes.tasks || []);
    } catch (err) {
      setFetchError(err.message || "Failed to retrieve administrative data.");
      notify(err.message || "Failed to retrieve administrative data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // User Actions: Suspend / Reactivate
  const handleToggleUserStatus = async (userId, currentStatus, userName) => {
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
    try {
      await api.updateUserStatus(userId, nextStatus);
      notify(`User ${userName} is now ${nextStatus}.`, "success");
      fetchData();
    } catch (err) {
      notify(err.message || "Failed to update user status.", "error");
    }
  };

  // User Actions: Delete User
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you certain you wish to delete user "${userName}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteUser(userId);
      notify(`User account for ${userName} removed.`, "success");
      fetchData();
    } catch (err) {
      notify(err.message || "Failed to delete user.", "error");
    }
  };

  // Staff Provisioning
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      setStaffSubmitting(true);
      await api.createStaffAccount(newStaffData);
      notify(`Staff profile created for ${newStaffData.name}. Credentials active.`, "success");
      setIsStaffModalOpen(false);
      setNewStaffData({ name: "", email: "", password: "", department: "Front Desk", employeeId: "" });
      fetchData();
    } catch (err) {
      notify(err.message || "Failed to create staff account.", "error");
    } finally {
      setStaffSubmitting(false);
    }
  };

  // Task Creation
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setTaskSubmitting(true);
      await api.createAdminTask(newTaskData);
      notify("Operational task assigned successfully.", "success");
      setIsTaskModalOpen(false);
      setNewTaskData({ title: "", description: "", department: "Front Desk", priority: "Normal", deadline: "", assignedTo: "" });
      fetchData();
    } catch (err) {
      notify(err.message || "Failed to create operational task.", "error");
    } finally {
      setTaskSubmitting(false);
    }
  };

  // Hotel Creation
  const handleCreateHotel = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newHotelData.name,
        propertyCategory: newHotelData.propertyCategory,
        summary: newHotelData.summary,
        description: newHotelData.summary,
        address: {
          city: newHotelData.city,
          state: newHotelData.state,
          addressLine: `Main Heritage Road, ${newHotelData.city}`
        },
        startingPrice: Number(newHotelData.startingPrice) || 5000,
        starClassification: Number(newHotelData.starClassification) || 5,
        heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"]
      };

      await api.createAdminHotel(payload);
      notify(`Hotel sanctuary "${newHotelData.name}" published!`, "success");
      setIsAddHotelModalOpen(false);
      setNewHotelData({ name: "", propertyCategory: "Heritage Palace", city: "Jaipur", state: "Rajasthan", startingPrice: 6500, starClassification: 5, summary: "" });
      fetchData();
    } catch (err) {
      notify(err.message || "Failed to register property.", "error");
    }
  };

  // Suite Creation
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newRoomData,
        pricePerNight: Number(newRoomData.pricePerNight),
        guests: Number(newRoomData.guests),
        bedrooms: Number(newRoomData.bedrooms),
        sizeSqM: Number(newRoomData.sizeSqM),
        amenities: newRoomData.amenities.split(",").map((a) => a.trim())
      };
      await api.createRoom(payload);
      notify(`Suite "${newRoomData.name}" created!`, "success");
      setIsAddRoomModalOpen(false);
      setNewRoomData({
        name: "",
        category: "Garden Suite",
        property: "HotelPro Estate & Botanical Sanctuary",
        location: "Cotswolds, United Kingdom",
        pricePerNight: 450,
        guests: 2,
        bedrooms: 1,
        sizeSqM: 65,
        summary: "",
        description: "",
        heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=85",
        amenities: "Private Plunge Pool, Wood-Burning Fireplace, High-Speed Wi-Fi, Dyptique Toiletries"
      });
      fetchData();
    } catch (err) {
      notify(err.message || "Failed to create suite.", "error");
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "all") return true;
    return b.status === bookingFilter || b.paymentStatus === bookingFilter;
  });

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#F8F6F0]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-8">
        {/* Top Header */}
        <div className="bg-white border border-[#E7E3D9] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-subtle">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-eyebrow text-[#C4A46B] font-semibold px-2 py-0.5 bg-[#F8F6F0] border border-[#E7E3D9]">
                Administrator Command Suite
              </span>
              <span className="text-xs text-[#72776F] font-light">Authenticated as {user?.name}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#173F35]">
              Executive Hotel &amp; Portfolio Operations
            </h1>
            <p className="text-xs text-[#72776F] font-light">
              Real-time audit telemetry, user authorization, staff provisioning, and estate reservations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-medium border border-[#173F35] text-[#173F35] hover:bg-[#173F35] hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Telemetry</span>
            </button>
            <button
              onClick={handleAdminSignOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-medium border border-red-500/40 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: "1px solid #E7E3D9", bgcolor: "#FFFFFF" }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{
              "& .MuiTab-root": {
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "#72776F",
                minHeight: 48,
                "&.Mui-selected": { color: "#173F35" }
              },
              "& .MuiTabs-indicator": { backgroundColor: "#173F35", height: 2 }
            }}
          >
            <Tab label="Executive Overview" />
            <Tab label={`User Management (${usersList.length})`} />
            <Tab label={`Staff & Tasks (${staffList.length})`} />
            <Tab label={`Bookings & Payments (${bookings.length})`} />
            <Tab label={`Hotels Portfolio (${hotels.length})`} />
            <Tab label={`Suites Inventory (${rooms.length})`} />
          </Tabs>
        </Box>

        {/* TAB 0: EXECUTIVE OVERVIEW */}
        {activeTab === 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 border border-[#E7E3D9] space-y-2 shadow-subtle">
                <span className="text-[10px] uppercase tracking-wider text-[#C4A46B] font-semibold block">
                  Verified Portfolio Revenue
                </span>
                <div className="font-serif text-3xl font-normal text-[#173F35]">
                  {formatINR(metrics?.totalRevenue || 0)}
                </div>
                <p className="text-[11px] text-[#72776F] font-light">From settled payment transactions</p>
              </div>

              <div className="bg-white p-6 border border-[#E7E3D9] space-y-2 shadow-subtle">
                <span className="text-[10px] uppercase tracking-wider text-[#C4A46B] font-semibold block">
                  Total Reservations
                </span>
                <div className="font-serif text-3xl font-normal text-[#173F35]">
                  {metrics?.totalBookings || bookings.length}
                </div>
                <p className="text-[11px] text-[#72776F] font-light">
                  {metrics?.confirmedBookings || 0} confirmed &bull; {metrics?.cancelledBookings || 0} cancelled
                </p>
              </div>

              <div className="bg-white p-6 border border-[#E7E3D9] space-y-2 shadow-subtle">
                <span className="text-[10px] uppercase tracking-wider text-[#C4A46B] font-semibold block">
                  Registered Members
                </span>
                <div className="font-serif text-3xl font-normal text-[#173F35]">
                  {metrics?.totalCustomers || usersList.length}
                </div>
                <p className="text-[11px] text-[#72776F] font-light">
                  Active customer identities
                </p>
              </div>

              <div className="bg-white p-6 border border-[#E7E3D9] space-y-2 shadow-subtle">
                <span className="text-[10px] uppercase tracking-wider text-[#C4A46B] font-semibold block">
                  Active Staff On Duty
                </span>
                <div className="font-serif text-3xl font-normal text-[#173F35]">
                  {metrics?.totalStaff || staffList.length}
                </div>
                <p className="text-[11px] text-[#72776F] font-light">Operational personnel</p>
              </div>
            </div>

            {/* Recent Bookings snapshot */}
            <div className="bg-white border border-[#E7E3D9] p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-normal text-[#173F35]">
                  Recent Guest Reservations Snapshot
                </h2>
                <button
                  onClick={() => setActiveTab(3)}
                  className="text-xs text-[#C4A46B] font-semibold hover:underline"
                >
                  View All Bookings &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F6F0] border-b border-[#E7E3D9] text-[#C4A46B] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Guest</th>
                      <th className="py-3 px-4">Suite / Property</th>
                      <th className="py-3 px-4">Dates</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3D9]">
                    {bookings.slice(0, 6).map((b) => (
                      <tr key={b._id} className="hover:bg-[#F8F6F0]/60">
                        <td className="py-3 px-4 font-medium text-[#173F35]">{b.guestName}</td>
                        <td className="py-3 px-4 text-[#72776F]">{b.roomName}</td>
                        <td className="py-3 px-4 text-[#72776F]">
                          {new Date(b.checkIn).toLocaleDateString()} &ndash; {new Date(b.checkOut).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#173F35]">
                          {formatINR(b.totalPrice)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold border ${b.status === "Confirmed" ? "bg-emerald-50 text-[#287A55] border-emerald-300" : "bg-stone-50 text-[#72776F] border-stone-300"}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold border ${b.paymentStatus === "Paid" ? "bg-emerald-50 text-[#287A55] border-emerald-200" : "bg-amber-50 text-[#B77924] border-amber-200"}`}>
                            {b.paymentStatus || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E7E3D9] p-6 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-72">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={16} color="#72776F" />
                      </InputAdornment>
                    )
                  }}
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Role Filter</InputLabel>
                  <Select
                    value={userRoleFilter}
                    label="Role Filter"
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="customer">Customers</MenuItem>
                    <MenuItem value="guest">Guests</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="admin">Administrators</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>

            <div className="bg-white border border-[#E7E3D9] overflow-hidden shadow-subtle">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F6F0] border-b border-[#E7E3D9] text-[#C4A46B] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Account Status</th>
                      <th className="py-3.5 px-4">Email Verified</th>
                      <th className="py-3.5 px-4">Created Date</th>
                      <th className="py-3.5 px-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3D9] text-[#252923]">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-[#F8F6F0]/60 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-[#173F35]">
                            <div className="font-semibold">{u.name}</div>
                            <div className="text-[11px] text-[#72776F]">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-stone-100 text-[#173F35] border border-[#E7E3D9]">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold border ${u.status === "suspended" ? "bg-red-50 text-[#B83D3D] border-red-300" : "bg-emerald-50 text-[#287A55] border-emerald-300"}`}>
                              {u.status || "active"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {u.isEmailVerified ? (
                              <span className="text-[#287A55] font-semibold flex items-center gap-1">
                                <Check size={14} /> Verified
                              </span>
                            ) : (
                              <span className="text-[#B77924]">Unverified</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-[#72776F]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Historical"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {u.role !== "admin" && (
                                <button
                                  onClick={() => handleToggleUserStatus(u._id, u.status || "active", u.name)}
                                  className={`px-2.5 py-1 text-[11px] font-medium border cursor-pointer ${u.status === "suspended" ? "bg-emerald-50 text-[#287A55] border-emerald-300" : "bg-amber-50 text-[#B77924] border-amber-300"}`}
                                >
                                  {u.status === "suspended" ? "Reactivate" : "Suspend"}
                                </button>
                              )}
                              {u.role !== "admin" && (
                                <button
                                  onClick={() => handleDeleteUser(u._id, u.name)}
                                  className="p-1 text-[#B83D3D] hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                                  title="Delete Account"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-[#72776F] italic">
                          No users located matching query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STAFF & TASK PROVISIONING */}
        {activeTab === 2 && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-normal text-[#173F35]">
                  Staff Personnel &amp; Operational Task Assignments
                </h2>
                <p className="text-xs text-[#72776F]">
                  Provision verified staff accounts and dispatch duty assignments.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsStaffModalOpen(true)}
                  className="px-4 py-2 bg-[#173F35] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-[#102E28] cursor-pointer"
                >
                  <UserPlus size={15} />
                  Provision Staff Account
                </button>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-4 py-2 bg-[#C4A46B] text-[#173F35] text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#B39155] cursor-pointer"
                >
                  <ClipboardList size={15} />
                  Assign Operational Task
                </button>
              </div>
            </div>

            {/* Staff list table */}
            <div className="bg-white border border-[#E7E3D9] overflow-hidden shadow-subtle">
              <div className="p-4 bg-[#F8F6F0] border-b border-[#E7E3D9] font-serif font-normal text-lg text-[#173F35]">
                Authorized Staff Members ({staffList.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F6F0] border-b border-[#E7E3D9] text-[#C4A46B] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Employee ID</th>
                      <th className="py-3 px-4">Active Tasks</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3D9]">
                    {staffList.map((s) => (
                      <tr key={s._id} className="hover:bg-[#F8F6F0]/60">
                        <td className="py-3 px-4 font-medium text-[#173F35]">
                          <div>{s.name}</div>
                          <div className="text-[11px] text-[#72776F]">{s.email}</div>
                        </td>
                        <td className="py-3 px-4 text-[#72776F]">{s.department || "Front Desk"}</td>
                        <td className="py-3 px-4 font-mono text-[#173F35]">{s.employeeId || "EMP-" + s._id.slice(-4)}</td>
                        <td className="py-3 px-4 font-semibold text-[#173F35]">{s.activeTaskCount || 0}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-emerald-50 text-[#287A55] border border-emerald-300">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tasks list table */}
            <div className="bg-white border border-[#E7E3D9] overflow-hidden shadow-subtle">
              <div className="p-4 bg-[#F8F6F0] border-b border-[#E7E3D9] font-serif font-normal text-lg text-[#173F35]">
                All Operational Tasks &amp; Housekeeping Schedules ({tasksList.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F6F0] border-b border-[#E7E3D9] text-[#C4A46B] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Task</th>
                      <th className="py-3 px-4">Department / Room</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Assigned To</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3D9]">
                    {tasksList.map((t) => (
                      <tr key={t._id} className="hover:bg-[#F8F6F0]/60">
                        <td className="py-3 px-4 font-medium text-[#173F35]">
                          <div>{t.title || t.task}</div>
                          {t.description && <div className="text-[11px] text-[#72776F]">{t.description}</div>}
                        </td>
                        <td className="py-3 px-4 text-[#72776F]">
                          {t.department} {t.roomName ? `(${t.roomName})` : ""}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold border ${t.priority === "High" || t.priority === "Urgent" ? "bg-red-50 text-[#B83D3D] border-red-300" : "bg-[#F8F6F0] text-[#173F35] border-[#E7E3D9]"}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#72776F]">
                          {t.assignedTo?.name || t.assignedTo || "Unassigned"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold border ${t.status === "Completed" ? "bg-emerald-50 text-[#287A55] border-emerald-300" : "bg-amber-50 text-[#B77924] border-amber-300"}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#72776F]">
                          {t.deadline ? new Date(t.deadline).toLocaleDateString() : "Open"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS & PAYMENT AUDIT */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E7E3D9] p-6 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-normal text-[#173F35]">
                  Reservation Records &amp; Payment Settlements
                </h2>
                <p className="text-xs text-[#72776F]">
                  Audited financial ledger backed by Razorpay and reservation verification.
                </p>
              </div>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={bookingFilter}
                  label="Status Filter"
                  onChange={(e) => setBookingFilter(e.target.value)}
                >
                  <MenuItem value="all">All Records</MenuItem>
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="Checked-In">Checked-In</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="Paid">Payment Settled</MenuItem>
                  <MenuItem value="Pending">Payment Pending</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="bg-white border border-[#E7E3D9] overflow-hidden shadow-subtle">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F6F0] border-b border-[#E7E3D9] text-[#C4A46B] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Confirmation ID</th>
                      <th className="py-3 px-4">Guest Name</th>
                      <th className="py-3 px-4">Suite / Dates</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment Method / Ref</th>
                      <th className="py-3 px-4">Booking Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3D9]">
                    {filteredBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-[#F8F6F0]/60">
                        <td className="py-3 px-4 font-mono text-[#173F35] font-semibold">
                          {b.bookingConfirmation || b._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#173F35]">{b.guestName}</td>
                        <td className="py-3 px-4 text-[#72776F]">
                          <div>{b.roomName}</div>
                          <div className="text-[11px] text-[#A4A8A0]">
                            {new Date(b.checkIn).toLocaleDateString()} &ndash; {new Date(b.checkOut).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#173F35]">
                          {formatINR(b.totalPrice)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold border ${b.paymentStatus === "Paid" ? "bg-emerald-50 text-[#287A55] border-emerald-300" : "bg-amber-50 text-[#B77924] border-amber-300"}`}>
                              {b.paymentStatus || "Pending"}
                            </span>
                          </div>
                          {b.paymentId && (
                            <div className="font-mono text-[10px] text-[#72776F] mt-1">
                              Txn: {b.paymentId}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold border ${b.status === "Confirmed" ? "bg-emerald-50 text-[#287A55] border-emerald-300" : b.status === "Cancelled" ? "bg-red-50 text-[#B83D3D] border-red-300" : "bg-stone-50 text-[#72776F] border-stone-300"}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOTELS PORTFOLIO */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-normal text-[#173F35]">
                  Hotel Sanctuaries &amp; Properties ({hotels.length})
                </h2>
                <p className="text-xs text-[#72776F]">Manage India-wide luxury retreats and estates.</p>
              </div>
              <button
                onClick={() => setIsAddHotelModalOpen(true)}
                className="px-4 py-2 bg-[#173F35] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-[#102E28] cursor-pointer"
              >
                <Plus size={16} /> Add Hotel Property
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((h) => (
                <div key={h._id} className="bg-white border border-[#E7E3D9] overflow-hidden shadow-subtle flex flex-col justify-between">
                  <div>
                    <div className="h-44 relative bg-stone-100">
                      <img
                        src={getHotelImageUrl(h)}
                        alt={h.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageFallback(e, "hotel", h.name)}
                      />
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#0A1628]/80 text-[#D4AF6B] text-[10px] uppercase font-semibold border border-[#D4AF6B]/40">
                        {h.starClassification || 5} Stars
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <span className="text-[10px] uppercase tracking-wider text-[#C4A46B] font-semibold block">
                        {h.propertyCategory}
                      </span>
                      <h3 className="font-serif text-lg text-[#173F35] font-normal leading-tight">{h.name}</h3>
                      <p className="text-xs text-[#72776F]">
                        {h.address?.city}, {h.address?.state}
                      </p>
                      <p className="text-xs text-[#72776F] line-clamp-2 leading-relaxed">
                        {h.summary || h.description}
                      </p>
                    </div>
                  </div>
                  <div className="p-5 pt-0 border-t border-[#E7E3D9] flex items-center justify-between mt-4">
                    <span className="text-xs text-[#173F35] font-semibold">
                      From {formatINR(h.startingPrice || 6000)} / night
                    </span>
                    <span className="text-[10px] text-[#287A55] font-semibold uppercase">Published</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SUITES INVENTORY */}
        {activeTab === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-normal text-[#173F35]">
                  Suites &amp; Room Inventory ({rooms.length})
                </h2>
                <p className="text-xs text-[#72776F]">Configure room pricing, categories, and capacities.</p>
              </div>
              <button
                onClick={() => setIsAddRoomModalOpen(true)}
                className="px-4 py-2 bg-[#173F35] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-[#102E28] cursor-pointer"
              >
                <Plus size={16} /> Add Suite
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div key={room._id} className="bg-white border border-[#E7E3D9] overflow-hidden shadow-subtle flex flex-col justify-between">
                  <div>
                    <div className="h-44 relative bg-stone-100">
                      <img
                        src={getRoomImageUrl(room)}
                        alt={room.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageFallback(e, "room", room.name)}
                      />
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/90 text-[#173F35] text-[10px] uppercase font-semibold border border-[#E7E3D9]">
                        {room.category}
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className="font-serif text-lg text-[#173F35] font-normal">{room.name}</h3>
                      <p className="text-xs text-[#72776F]">{room.property || room.location}</p>
                      <p className="text-xs text-[#72776F]">
                        Capacity: {room.guests} Guests &bull; {room.bedrooms} Bedroom(s) &bull; {room.sizeSqM} m²
                      </p>
                    </div>
                  </div>
                  <div className="p-5 pt-0 border-t border-[#E7E3D9] flex items-center justify-between mt-4">
                    <span className="text-xs text-[#173F35] font-semibold">
                      {formatINR(room.pricePerNight)} / night
                    </span>
                    <span className="text-[10px] text-[#287A55] font-semibold uppercase">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Staff Provisioning Modal */}
      <Dialog open={isStaffModalOpen} onClose={() => !staffSubmitting && setIsStaffModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#173F35" }}>
          Provision Authorized Staff Account
        </DialogTitle>
        <form onSubmit={handleCreateStaff}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Typography variant="body2" sx={{ color: "#72776F" }}>
              Staff credentials created here receive the verified 'staff' role for property operations. Public registration cannot create staff accounts.
            </Typography>

            <TextField
              required
              fullWidth
              label="Staff Member Full Name"
              placeholder="e.g. Rajesh Kumar"
              value={newStaffData.name}
              onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
            />

            <TextField
              required
              fullWidth
              type="email"
              label="Official Staff Email"
              placeholder="rajesh.kumar@hotelpro.com"
              value={newStaffData.email}
              onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
            />

            <TextField
              required
              fullWidth
              type="password"
              label="Initial Password"
              placeholder="At least 6 characters"
              value={newStaffData.password}
              onChange={(e) => setNewStaffData({ ...newStaffData, password: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={newStaffData.department}
                label="Department"
                onChange={(e) => setNewStaffData({ ...newStaffData, department: e.target.value })}
              >
                <MenuItem value="Front Desk">Front Desk &amp; Concierge</MenuItem>
                <MenuItem value="Housekeeping">Housekeeping &amp; Turnovers</MenuItem>
                <MenuItem value="Maintenance">Maintenance &amp; Engineering</MenuItem>
                <MenuItem value="Food & Beverage">Food &amp; Beverage</MenuItem>
                <MenuItem value="Operations">Estate Operations</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Employee ID (Optional)"
              placeholder="e.g. EMP-1048"
              value={newStaffData.employeeId}
              onChange={(e) => setNewStaffData({ ...newStaffData, employeeId: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setIsStaffModalOpen(false)} disabled={staffSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={staffSubmitting}
              sx={{ background: "#173F35", color: "#FFFFFF", "&:hover": { background: "#102E28" } }}
            >
              {staffSubmitting ? <CircularProgress size={20} color="inherit" /> : "Provision Staff Account"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Task Creation Modal */}
      <Dialog open={isTaskModalOpen} onClose={() => !taskSubmitting && setIsTaskModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#173F35" }}>
          Assign Operational Duty to Staff
        </DialogTitle>
        <form onSubmit={handleCreateTask}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              required
              fullWidth
              label="Task Title"
              placeholder="e.g. VIP Floral Arrangement & Suite Inspection"
              value={newTaskData.title}
              onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Detailed Instructions"
              placeholder="Specify requirements, timing, and inspection checklist..."
              value={newTaskData.description}
              onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={newTaskData.department}
                  label="Department"
                  onChange={(e) => setNewTaskData({ ...newTaskData, department: e.target.value })}
                >
                  <MenuItem value="Front Desk">Front Desk</MenuItem>
                  <MenuItem value="Housekeeping">Housekeeping</MenuItem>
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                  <MenuItem value="Food & Beverage">Food &amp; Beverage</MenuItem>
                  <MenuItem value="Operations">Operations</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTaskData.priority}
                  label="Priority"
                  onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Normal">Normal</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </div>

            <TextField
              fullWidth
              type="date"
              label="Deadline"
              InputLabelProps={{ shrink: true }}
              value={newTaskData.deadline}
              onChange={(e) => setNewTaskData({ ...newTaskData, deadline: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Assign to Specific Staff (Optional)</InputLabel>
              <Select
                value={newTaskData.assignedTo}
                label="Assign to Specific Staff (Optional)"
                onChange={(e) => setNewTaskData({ ...newTaskData, assignedTo: e.target.value })}
              >
                <MenuItem value="">Unassigned (Department Queue)</MenuItem>
                {staffList.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.name} ({s.department})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setIsTaskModalOpen(false)} disabled={taskSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={taskSubmitting}
              sx={{ background: "#C4A46B", color: "#173F35", fontWeight: 700, "&:hover": { background: "#B39155" } }}
            >
              {taskSubmitting ? <CircularProgress size={20} color="inherit" /> : "Assign Task"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Hotel Modal */}
      <Dialog open={isAddHotelModalOpen} onClose={() => setIsAddHotelModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#173F35" }}>
          Publish New Hotel Sanctuary
        </DialogTitle>
        <form onSubmit={handleCreateHotel}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              required
              fullWidth
              label="Property Name"
              placeholder="e.g. Rambagh Heritage Estate"
              value={newHotelData.name}
              onChange={(e) => setNewHotelData({ ...newHotelData, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <TextField
                required
                fullWidth
                label="City"
                value={newHotelData.city}
                onChange={(e) => setNewHotelData({ ...newHotelData, city: e.target.value })}
              />
              <TextField
                required
                fullWidth
                label="State"
                value={newHotelData.state}
                onChange={(e) => setNewHotelData({ ...newHotelData, state: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                required
                fullWidth
                type="number"
                label="Starting Price (INR)"
                value={newHotelData.startingPrice}
                onChange={(e) => setNewHotelData({ ...newHotelData, startingPrice: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newHotelData.propertyCategory}
                  label="Category"
                  onChange={(e) => setNewHotelData({ ...newHotelData, propertyCategory: e.target.value })}
                >
                  <MenuItem value="Heritage Palace">Heritage Palace</MenuItem>
                  <MenuItem value="Luxury Resort">Luxury Resort</MenuItem>
                  <MenuItem value="Boutique Haveli">Boutique Haveli</MenuItem>
                  <MenuItem value="Coastal Villa">Coastal Villa</MenuItem>
                </Select>
              </FormControl>
            </div>
            <TextField
              required
              fullWidth
              multiline
              rows={3}
              label="Summary Description"
              value={newHotelData.summary}
              onChange={(e) => setNewHotelData({ ...newHotelData, summary: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setIsAddHotelModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ background: "#173F35", color: "#FFFFFF" }}>
              Publish Property
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Room Modal */}
      <Dialog open={isAddRoomModalOpen} onClose={() => setIsAddRoomModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#173F35" }}>
          Add Suite to Inventory
        </DialogTitle>
        <form onSubmit={handleCreateRoom}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              required
              fullWidth
              label="Suite Title"
              value={newRoomData.name}
              onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <TextField
                required
                fullWidth
                type="number"
                label="Price Per Night (INR)"
                value={newRoomData.pricePerNight}
                onChange={(e) => setNewRoomData({ ...newRoomData, pricePerNight: e.target.value })}
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Max Guests"
                value={newRoomData.guests}
                onChange={(e) => setNewRoomData({ ...newRoomData, guests: e.target.value })}
              />
            </div>
            <TextField
              required
              fullWidth
              label="Amenities (comma-separated)"
              value={newRoomData.amenities}
              onChange={(e) => setNewRoomData({ ...newRoomData, amenities: e.target.value })}
            />
            <TextField
              required
              fullWidth
              multiline
              rows={2}
              label="Suite Description"
              value={newRoomData.summary}
              onChange={(e) => setNewRoomData({ ...newRoomData, summary: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setIsAddRoomModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ background: "#173F35", color: "#FFFFFF" }}>
              Save Suite
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
