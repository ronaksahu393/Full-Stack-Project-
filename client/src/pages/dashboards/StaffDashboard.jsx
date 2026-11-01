import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Divider,
  Alert
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNotify } from "../../context/NotificationContext";
import { api } from "../../services/api";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ClipboardList,
  Bed,
  RefreshCw,
  Check,
  LogIn,
  LogOut,
  MessageSquare,
  Building,
  ShieldCheck
} from "lucide-react";

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const { notify } = useNotify();
  const navigate = useNavigate();

  const handleStaffSignOut = async () => {
    try {
      await logout();
      notify("Staff session terminated securely.", "info");
      navigate("/login");
    } catch (err) {
      navigate("/login");
    }
  };

  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [updatingRoomId, setUpdatingRoomId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Operational note modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const [overviewRes, tasksRes] = await Promise.all([
        api.getStaffOverview(),
        api.getStaffTasks().catch(() => ({ tasks: [] }))
      ]);
      setData(overviewRes);
      setTasks(tasksRes.tasks || overviewRes.housekeepingTasks || []);
    } catch (err) {
      setFetchError(err.message || "Failed to retrieve staff operations data.");
      notify(err.message || "Failed to retrieve staff operations data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleUpdateCleaning = async (roomId, cleaningStatus) => {
    try {
      setUpdatingRoomId(roomId);
      await api.updateCleaningStatus(roomId, cleaningStatus);
      notify(`Suite cleaning status set to "${cleaningStatus}".`, "success");
      fetchStaffData();
    } catch (err) {
      notify("Failed to update suite cleaning status.", "error");
    } finally {
      setUpdatingRoomId(null);
    }
  };

  const handleCheckIn = async (bookingId, guestName) => {
    try {
      setActionLoadingId(bookingId);
      await api.recordStaffCheckIn(bookingId);
      notify(`Check-in recorded for guest ${guestName}. Welcome to AtithiGo.`, "success");
      fetchStaffData();
    } catch (err) {
      notify(err.message || "Failed to record guest check-in.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCheckOut = async (bookingId, guestName) => {
    try {
      setActionLoadingId(bookingId);
      await api.recordStaffCheckOut(bookingId);
      notify(`Check-out completed for ${guestName}. Room marked for turnover.`, "success");
      fetchStaffData();
    } catch (err) {
      notify(err.message || "Failed to record guest check-out.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenNoteModal = (task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setNoteText("");
    setNoteModalOpen(true);
  };

  const handleSaveTaskStatus = async () => {
    if (!selectedTask) return;
    try {
      setSavingNote(true);
      await api.updateTaskStatus(selectedTask._id, newStatus, noteText.trim());
      notify(`Task "${selectedTask.title || selectedTask.task}" updated to ${newStatus}.`, "success");
      setNoteModalOpen(false);
      fetchStaffData();
    } catch (err) {
      notify(err.message || "Failed to update task.", "error");
    } finally {
      setSavingNote(false);
    }
  };

  const arrivals = data?.arrivalsToday || [];
  const departures = data?.departuresToday || [];
  const rooms = data?.roomsCleaning || [];

  if (fetchError && !data) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#F8F6F0] flex items-center justify-center px-6">
        <div className="bg-white border border-[#E7E3D9] p-8 max-w-md w-full text-center space-y-4 shadow-card">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 flex items-center justify-center rounded-full mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl text-[#173F35]">Operations Board Unavailable</h2>
          <p className="text-xs text-[#72776F] leading-relaxed">{fetchError}</p>
          <button
            onClick={fetchStaffData}
            className="btn-primary inline-block px-6 py-2.5 text-xs shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#F8F6F0]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
        {/* Operations Header */}
        <div className="bg-white border border-[#E7E3D9] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-subtle">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-eyebrow text-[#C4A46B] font-semibold px-2 py-0.5 bg-[#F8F6F0] border border-[#E7E3D9]">
                Staff Operations &amp; Concierge
              </span>
              <span className="text-xs text-[#72776F] font-light">
                On Duty: <strong>{user?.name}</strong> ({user?.department || "Operations"})
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#173F35]">
              Daily Property Operations &amp; Guest Services
            </h1>
            <p className="text-xs text-[#72776F] font-light">
              Manage arrivals, check-outs, room turnovers, housekeeping, and assigned operational duties.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={fetchStaffData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-medium border border-[#173F35] text-[#173F35] hover:bg-[#173F35] hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Board</span>
            </button>
            <button
              onClick={handleStaffSignOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-medium border border-red-500/40 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 border border-[#E7E3D9] space-y-2 shadow-subtle">
            <span className="text-[10px] uppercase tracking-wider text-[#C4A46B] font-semibold block">
              Expected Arrivals Today
            </span>
            <div className="font-serif text-3xl font-normal text-[#173F35]">
              {arrivals.length}
            </div>
            <p className="text-[11px] text-[#72776F] font-light">Guest check-ins</p>
          </div>

          <div className="bg-white p-6 border border-[#E7E3D9] space-y-2 shadow-subtle">
            <span className="text-[10px] uppercase tracking-wider text-[#C4A46B] font-semibold block">
              Departures Today
            </span>
            <div className="font-serif text-3xl font-normal text-[#173F35]">
              {departures.length}
            </div>
            <p className="text-[11px] text-[#72776F] font-light">Scheduled check-outs</p>
          </div>

          <div className="bg-white p-6 border border-[#E7E3D9] space-y-2 shadow-subtle">
            <span className="text-[10px] uppercase tracking-wider text-[#C4A46B] font-semibold block">
              Active Operational Tasks
            </span>
            <div className="font-serif text-3xl font-normal text-[#173F35]">
              {tasks.filter((t) => t.status !== "Completed").length}
            </div>
            <p className="text-[11px] text-[#72776F] font-light">Pending &amp; In-progress items</p>
          </div>

          <div className="bg-white p-6 border border-[#E7E3D9] space-y-2 shadow-subtle">
            <span className="text-[10px] uppercase tracking-wider text-[#C4A46B] font-semibold block">
              Suites Under Management
            </span>
            <div className="font-serif text-3xl font-normal text-[#173F35]">
              {rooms.length}
            </div>
            <p className="text-[11px] text-[#72776F] font-light">Total portfolio units</p>
          </div>
        </div>

        {/* Guest Arrival & Departure Operational Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Arrivals with 1-Click Check-In */}
          <div className="bg-white border border-[#E7E3D9] p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-normal text-[#173F35] flex items-center gap-2">
                <LogIn className="w-5 h-5 text-[#C4A46B]" />
                <span>Today's Arrivals</span>
              </h3>
              <span className="text-xs font-sans text-[#72776F]">
                {arrivals.length} reservations
              </span>
            </div>

            {arrivals.length > 0 ? (
              <div className="divide-y divide-[#E7E3D9] text-xs">
                {arrivals.map((b) => (
                  <div key={b._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-medium text-[#173F35] text-sm block">{b.guestName}</span>
                      <span className="text-[#72776F]">
                        {b.roomName || "Deluxe Suite"} &bull; {b.guests || 2} Guest(s) &bull; {b.nights || 1} Night(s)
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-[#173F35] border border-[#E7E3D9]">
                          Status: {b.status}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 border ${b.paymentStatus === "Paid" ? "bg-emerald-50 text-[#287A55] border-emerald-200" : "bg-amber-50 text-[#B77924] border-amber-200"}`}>
                          Payment: {b.paymentStatus || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div>
                      {b.status === "Checked-In" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-[#287A55] font-semibold text-[11px] border border-emerald-300">
                          <Check className="w-3.5 h-3.5" /> In-House
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(b._id, b.guestName)}
                          disabled={actionLoadingId === b._id}
                          className="px-3 py-1.5 bg-[#173F35] text-white hover:bg-[#102E28] font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {actionLoadingId === b._id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                          Record Check-In
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#72776F] italic py-6 text-center">No pending arrivals scheduled for today.</p>
            )}
          </div>

          {/* Today's Departures with 1-Click Check-Out */}
          <div className="bg-white border border-[#E7E3D9] p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-normal text-[#173F35] flex items-center gap-2">
                <LogOut className="w-5 h-5 text-[#C4A46B]" />
                <span>Today's Departures</span>
              </h3>
              <span className="text-xs font-sans text-[#72776F]">
                {departures.length} scheduled
              </span>
            </div>

            {departures.length > 0 ? (
              <div className="divide-y divide-[#E7E3D9] text-xs">
                {departures.map((b) => (
                  <div key={b._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-medium text-[#173F35] text-sm block">{b.guestName}</span>
                      <span className="text-[#72776F]">
                        {b.roomName} &bull; Check-out: {new Date(b.checkOut).toLocaleDateString()}
                      </span>
                      <div className="mt-1">
                        <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-[#173F35] border border-[#E7E3D9]">
                          Status: {b.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      {b.status === "Completed" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-[#72776F] font-semibold text-[11px] border border-[#E7E3D9]">
                          Checked Out
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCheckOut(b._id, b.guestName)}
                          disabled={actionLoadingId === b._id}
                          className="px-3 py-1.5 bg-[#C4A46B] text-[#173F35] hover:bg-[#B39155] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {actionLoadingId === b._id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                          Complete Check-Out
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#72776F] italic py-6 text-center">No scheduled departures remaining for today.</p>
            )}
          </div>
        </div>

        {/* Assigned Operational Tasks & Housekeeping */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-normal text-[#173F35]">
                Operational Tasks &amp; Department Assignments
              </h2>
              <p className="text-xs text-[#72776F] font-light">
                Track assigned maintenance, front-desk duties, VIP guest amenities, and turnover requests.
              </p>
            </div>
            <span className="text-xs text-[#C4A46B] font-semibold uppercase tracking-wider">
              {tasks.length} total tasks
            </span>
          </div>

          <div className="bg-white border border-[#E7E3D9] overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F6F0] border-b border-[#E7E3D9] text-[#C4A46B] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Task Details</th>
                    <th className="py-3.5 px-4">Department / Room</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Progress Status</th>
                    <th className="py-3.5 px-4">Deadline</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3D9] text-[#252923]">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <tr key={task._id} className="hover:bg-[#F8F6F0]/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-[#173F35]">
                          <div className="flex items-start gap-2">
                            <ClipboardList className="w-4 h-4 text-[#C4A46B] shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold block">{task.title || task.task}</span>
                              {task.description && (
                                <span className="text-[#72776F] text-[11px] block mt-0.5 line-clamp-1">{task.description}</span>
                              )}
                              {task.notes && task.notes.length > 0 && (
                                <span className="text-[10px] text-[#287A55] block mt-0.5">
                                  💬 {task.notes.length} operational note(s) logged
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#72776F]">
                          <div>{task.department || "Front Desk"}</div>
                          {task.roomName && <div className="text-[11px] text-[#173F35]">Suite: {task.roomName}</div>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] uppercase font-semibold border ${
                              task.priority === "Urgent" || task.priority === "High"
                                ? "bg-red-50 text-[#B83D3D] border-red-300"
                                : "bg-[#F8F6F0] text-[#173F35] border-[#E7E3D9]"
                            }`}
                          >
                            {task.priority || "Normal"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold border ${
                              task.status === "Completed"
                                ? "bg-emerald-50 text-[#287A55] border-emerald-300"
                                : task.status === "In Progress"
                                ? "bg-amber-50 text-[#B77924] border-amber-300"
                                : "bg-stone-50 text-[#72776F] border-stone-300"
                            }`}
                          >
                            {task.status || "Pending"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#72776F]">
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : "Today"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenNoteModal(task)}
                            className="px-3 py-1 bg-white border border-[#E7E3D9] hover:border-[#173F35] text-[#173F35] text-xs font-medium transition-colors cursor-pointer"
                          >
                            Update / Note
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-[#72776F] italic">
                        No operational tasks currently assigned to your station.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Suite Cleaning Board */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-normal text-[#173F35]">
              Suite Turnover &amp; Cleaning Status Board
            </h2>
            <span className="text-xs text-[#72776F] font-light">
              Click status buttons to update room state directly
            </span>
          </div>

          <div className="bg-white border border-[#E7E3D9] overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F6F0] border-b border-[#E7E3D9] text-[#C4A46B] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Suite Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Occupancy Status</th>
                    <th className="py-3.5 px-4">Cleaning Status</th>
                    <th className="py-3.5 px-4 text-right">Quick Update Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3D9] text-[#252923]">
                  {rooms.map((room) => {
                    const status = room.cleaningStatus || "Clean";
                    return (
                      <tr key={room._id} className="hover:bg-[#F8F6F0]/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-[#173F35] flex items-center gap-2">
                          <Bed className="w-3.5 h-3.5 text-[#C4A46B]" />
                          <span>{room.name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-[#72776F]">{room.category}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-stone-100 text-[#173F35] border border-[#E7E3D9]">
                            {room.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold border ${
                              status === "Clean"
                                ? "bg-emerald-50 text-[#287A55] border-emerald-300"
                                : status === "In Progress"
                                ? "bg-amber-50 text-[#B77924] border-amber-300"
                                : status === "Inspecting"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : "bg-red-50 text-[#B83D3D] border-red-300"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {["Clean", "In Progress", "Dirty", "Inspecting"].map((s) => (
                              <button
                                key={s}
                                onClick={() => handleUpdateCleaning(room._id, s)}
                                disabled={status === s || updatingRoomId === room._id}
                                className={`px-2 py-1 text-[10px] uppercase tracking-wider font-medium border transition-colors cursor-pointer ${
                                  status === s
                                    ? "bg-[#173F35] text-white border-[#173F35] opacity-50 cursor-default"
                                    : "bg-white text-[#252923]/80 border-[#E7E3D9] hover:border-[#173F35]"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Task Update & Operational Note Dialog */}
      <Dialog
        open={noteModalOpen}
        onClose={() => !savingNote && setNoteModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#173F35" }}>
          Update Operational Task
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedTask && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
              <Box sx={{ p: 2, background: "#F8F6F0", border: "1px solid #E7E3D9" }}>
                <Typography variant="subtitle2" sx={{ color: "#173F35", fontWeight: 700 }}>
                  {selectedTask.title || selectedTask.task}
                </Typography>
                <Typography variant="caption" sx={{ color: "#72776F" }}>
                  Department: {selectedTask.department || "Operations"} &bull; Priority: {selectedTask.priority || "Normal"}
                </Typography>
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  label="Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Operational Note / Observation"
                placeholder="e.g. Fresh linen placed, guest requested extra pillows at 8 PM..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />

              {selectedTask.notes && selectedTask.notes.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: "#C4A46B", fontWeight: 700, textTransform: "uppercase" }}>
                    Prior Notes History:
                  </Typography>
                  <Box sx={{ mt: 1, maxHeight: 120, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
                    {selectedTask.notes.map((n, i) => (
                      <Box key={i} sx={{ p: 1, background: "rgba(0,0,0,0.02)", borderLeft: "2px solid #C4A46B" }}>
                        <Typography variant="caption" sx={{ color: "#252923", display: "block" }}>{n.text}</Typography>
                        <Typography variant="caption" sx={{ color: "#72776F", fontSize: "0.6875rem" }}>
                          Logged by {n.author} &bull; {new Date(n.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setNoteModalOpen(false)} disabled={savingNote}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTaskStatus}
            disabled={savingNote}
            sx={{ background: "#173F35", color: "#FFFFFF", "&:hover": { background: "#102E28" } }}
          >
            {savingNote ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
