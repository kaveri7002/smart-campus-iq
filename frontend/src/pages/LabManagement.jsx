import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FlaskConical,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Send,
  Loader2,
  Cpu
} from 'lucide-react';

export const LabManagement = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const [labs, setLabs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('14:00 - 16:00');
  const [purpose, setPurpose] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState('');
  const [msgError, setMsgError] = useState('');

  useEffect(() => {
    fetchLabsAndBookings();
  }, []);

  const fetchLabsAndBookings = async () => {
    setLoading(true);
    try {
      const [labsRes, bookingsRes] = await Promise.all([
        api.get('/labs'),
        api.get('/labs/bookings')
      ]);

      if (labsRes.data?.success) setLabs(labsRes.data.data || []);
      if (bookingsRes.data?.success) setBookings(bookingsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!selectedLab || !purpose) return;

    setSubmitting(true);
    setMsgError('');
    setMsgSuccess('');

    try {
      const res = await api.post('/labs/bookings', {
        lab_id: selectedLab._id,
        date,
        time_slot: timeSlot,
        purpose,
        team_members: teamMembers
      });

      if (res.data?.success) {
        setMsgSuccess('Lab booking request submitted successfully for faculty approval!');
        setShowBookingModal(false);
        setPurpose('');
        setTeamMembers('');
        fetchLabsAndBookings();
      }
    } catch (err) {
      setMsgError(err.response?.data?.message || 'Booking conflict or submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      const res = await api.patch(`/labs/bookings/${bookingId}`, {
        status,
        remarks: status === 'Confirmed' ? 'Slot approved by faculty in-charge.' : 'Slot unavailable due to scheduled maintenance.'
      });
      if (res.data?.success) {
        fetchLabsAndBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating booking status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-cyan-500" />
            Engineering Laboratories & Slot Reservations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            GPU compute clusters, IoT robotics testbeds, and advanced computing facilities
          </p>
        </div>
      </div>

      {msgSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msgSuccess}</span>
        </div>
      )}

      {msgError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{msgError}</span>
        </div>
      )}

      {/* Laboratories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {labs.map((lab) => (
          <div key={lab._id} className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 uppercase font-mono">
                  {lab.lab_code || lab.department}
                </span>
                <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">{lab.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{lab.location}</span>
              </p>

              {/* Equipment list */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Equipped With:</span>
                <div className="flex flex-wrap gap-1.5">
                  {lab.equipment?.map((eq, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">Capacity: <b className="text-slate-800 dark:text-slate-200">{lab.capacity} seats</b></span>
              <button
                onClick={() => {
                  setSelectedLab(lab);
                  setShowBookingModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings / Approval Requests Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {role === 'student' ? 'My Lab Booking Requests' : 'Laboratory Reservations & Approval Desk'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track confirmation status and conflict resolutions</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-navy-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-navy-800">
              <tr>
                <th className="py-3 px-4">Laboratory</th>
                <th className="py-3 px-4">Student / Lead</th>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4">Research Purpose</th>
                <th className="py-3 px-4">Status</th>
                {(role === 'faculty' || role === 'admin') && <th className="py-3 px-4">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-navy-950/30">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{b.lab_name}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{b.student_name}</p>
                    <span className="text-[10px] text-slate-400">{b.student_email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{b.date}</p>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">{b.time_slot}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{b.purpose}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'Confirmed'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : b.status === 'Rejected'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  {(role === 'faculty' || role === 'admin') && (
                    <td className="py-3 px-4">
                      {b.status === 'Pending Approval' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'Confirmed')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'Rejected')}
                            className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">{b.action_by || 'Processed'}</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Reserve {selectedLab?.name}</h3>
            
            <form onSubmit={handleCreateBooking} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
                >
                  {selectedLab?.available_slots?.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  )) || (
                    <>
                      <option value="09:00 - 11:00">09:00 - 11:00</option>
                      <option value="11:15 - 13:15">11:15 - 13:15</option>
                      <option value="14:00 - 16:00">14:00 - 16:00</option>
                      <option value="16:15 - 18:15">16:15 - 18:15</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Experiment / Project Purpose</label>
                <textarea
                  rows="3"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Describe hardware/compute requirements (e.g., fine-tuning PyTorch CNN model on RTX 4090)..."
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Collaborating Team USNs (Optional)</label>
                <input
                  type="text"
                  value={teamMembers}
                  onChange={(e) => setTeamMembers(e.target.value)}
                  placeholder="1IT21CS002, 1IT21CS003..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  {submitting ? 'Submitting...' : 'Submit Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
