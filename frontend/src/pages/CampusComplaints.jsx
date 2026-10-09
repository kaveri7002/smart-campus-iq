import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  AlertCircle,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Tag,
  MessageSquare,
  ShieldCheck,
  Send,
  Loader2
} from 'lucide-react';

export const CampusComplaints = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [category, setCategory] = useState('Wi-Fi & Internet');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const categories = [
    'Wi-Fi & Internet',
    'Drinking Water',
    'Classrooms & Projectors',
    'Laboratory Equipment',
    'Electricity & AC',
    'Library & Hostel Facilities',
    'Canteen & Cleanliness'
  ];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
      if (res.data?.success) setComplaints(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!location || !description) return;

    setSubmitting(true);
    try {
      const res = await api.post('/complaints', {
        category,
        location,
        priority,
        description
      });

      if (res.data?.success) {
        setActionMsg(`Ticket ${res.data.data.complaint_id} logged successfully with Maintenance Desk!`);
        setShowModal(false);
        setLocation('');
        setDescription('');
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComplaint = async (complaintId, newStatus) => {
    const remarks = prompt("Enter administrative resolution remarks:", "Technician dispatched / issue addressed.");
    if (remarks === null) return;

    try {
      const res = await api.patch(`/complaints/${complaintId}`, {
        status: newStatus,
        admin_remarks: remarks
      });
      if (res.data?.success) {
        fetchComplaints();
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <AlertCircle className="w-6 h-6 text-cyan-500" />
            Campus Infrastructure & Complaints Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Report Wi-Fi, electricity, lab equipment, or facility maintenance tickets with tracking
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>File Maintenance Ticket</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Complaints List */}
      <div className="space-y-3">
        {complaints.map((c) => (
          <div key={c._id} className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                  {c.complaint_id}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{c.category}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  c.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-500' :
                  c.priority === 'High' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-300'
                }`}>
                  Priority: {c.priority}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {c.location}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {c.description}
              </p>

              {c.admin_remarks && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/60 dark:border-navy-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex-shrink-0">Desk Remark:</span>
                  <span>{c.admin_remarks}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col md:items-end gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full self-start md:self-auto ${
                c.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                c.status === 'In Progress' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' :
                'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                {c.status}
              </span>

              {(role === 'admin' || role === 'faculty') && c.status !== 'Resolved' && (
                <div className="flex items-center gap-1.5 pt-1">
                  {c.status === 'Submitted' && (
                    <button
                      onClick={() => handleUpdateComplaint(c._id, 'In Progress')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-colors"
                    >
                      Assign In-Progress
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateComplaint(c._id, 'Resolved')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">File Infrastructure Complaint</h3>
            
            <form onSubmit={handleCreateComplaint} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Campus Location / Room #</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Block A, 3rd Floor - Seminar Hall 2"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Severity / Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent (Interferes with Class/Exam)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue specifically (e.g., projector HDMI pin damaged)..."
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  {submitting ? 'Submitting...' : 'Register Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
