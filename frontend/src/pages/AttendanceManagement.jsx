import React, { useState, useEffect } from 'react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Send,
  AlertTriangle,
  RotateCw,
  Search,
  Sparkles,
  Lock,
  PhoneCall,
  Loader2,
  Check,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const AttendanceManagement = () => {
  // Filters
  const [departments] = useState(["CSE", "ISE", "AI & ML", "ECE", "EEE", "ME", "Civil"]);
  const [semesters] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [sections] = useState(["A", "B", "C"]);
  const [periods] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [subjects, setSubjects] = useState([
    { code: "CS601", name: "Cloud Computing & Distributed Systems" },
    { code: "CS602", name: "Full Stack Web Engineering" },
    { code: "CS603", name: "Advanced Database Management" },
    { code: "AI601", name: "Deep Learning & Computer Vision" },
    { code: "EC601", name: "Embedded Systems & IoT Protocols" }
  ]);

  const [selectedDept, setSelectedDept] = useState("CSE");
  const [selectedSem, setSelectedSem] = useState(6);
  const [selectedSec, setSelectedSec] = useState("A");
  const [selectedSubject, setSelectedSubject] = useState("CS601");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(1);

  // Session & Student Records state
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Load session on initial render
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    setLoading(true);
    setActionSuccess('');
    setActionError('');
    try {
      const payload = {
        department: selectedDept,
        semester: Number(selectedSem),
        section: selectedSec,
        subject_code: selectedSubject,
        date: selectedDate,
        period: Number(selectedPeriod)
      };

      const res = await api.post('/attendance/sessions', payload);
      if (res.data?.success) {
        setSession(res.data.data.session);
        setStudents(res.data.data.students || []);
        setSmsLogs(res.data.data.sms_logs || []);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to load class attendance session.');
    } finally {
      setLoading(false);
    }
  };

  const updateStudentStatus = (studentId, newStatus) => {
    if (session?.is_finalized) return;
    setStudents(prev =>
      prev.map(s => s.student_id === studentId ? { ...s, status: newStatus } : s)
    );
  };

  const markAll = (status) => {
    if (session?.is_finalized) return;
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSaveDraft = async () => {
    if (!session?._id) return;
    setSaving(true);
    setActionSuccess('');
    setActionError('');

    try {
      const records = students.map(s => ({
        student_id: s.student_id,
        usn: s.usn,
        name: s.name,
        status: s.status
      }));

      const res = await api.post(`/attendance/sessions/${session._id}/records`, { records });
      if (res.data?.success) {
        setActionSuccess('Attendance draft saved successfully!');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Error saving draft attendance.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizeAndSMS = async () => {
    if (!session?._id) return;
    const confirmMsg = "Finalizing attendance will lock this session and automatically trigger SMS notifications to all students' verified phone numbers. Proceed?";
    if (!window.confirm(confirmMsg)) return;

    setFinalizing(true);
    setActionSuccess('');
    setActionError('');

    try {
      // First save current state
      const records = students.map(s => ({
        student_id: s.student_id,
        usn: s.usn,
        name: s.name,
        status: s.status
      }));
      await api.post(`/attendance/sessions/${session._id}/records`, { records });

      // Finalize and dispatch SMS
      const res = await api.post(`/attendance/sessions/${session._id}/finalize`);
      if (res.data?.success) {
        setSession(prev => ({ ...prev, is_finalized: true, sms_dispatched: true }));
        setSmsLogs(res.data.data.sms_logs || []);
        setActionSuccess('Attendance successfully finalized! Automated SMS notifications dispatched to verified numbers.');
        
        // Confetti effect
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to finalize attendance session.');
    } finally {
      setFinalizing(false);
    }
  };

  const handleRetrySMS = async (notifId) => {
    try {
      const res = await api.post(`/sms/${notifId}/retry`);
      if (res.data?.success) {
        setActionSuccess('SMS notification retry triggered.');
        // Reload session data
        loadSession();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Retry failed.');
    }
  };

  const handleExportCSV = () => {
    const url = `${api.defaults.baseURL}/attendance/export-csv?department=${selectedDept}&semester=${selectedSem}&section=${selectedSec}`;
    window.open(url, '_blank');
  };

  // Calculations
  const presentCount = students.filter(s => s.status === 'Present').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;
  const lateCount = students.filter(s => s.status === 'Late').length;
  const totalCount = students.length;
  const attendanceRate = totalCount > 0 ? (((presentCount + lateCount) / totalCount) * 100).toFixed(1) : 0;

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.usn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-cyan-500" />
            Smart Attendance Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time attendance marking with automated SMS dispatch upon session finalization
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Download CSV Attendance Ledger"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Action Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Selector Panel */}
      <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Department */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
            >
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Semester</label>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
            >
              {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Section</label>
            <select
              value={selectedSec}
              onChange={(e) => setSelectedSec(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
            >
              {sections.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
            >
              {subjects.map(sub => <option key={sub.code} value={sub.code}>{sub.code} - {sub.name.slice(0, 15)}...</option>)}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          {/* Period */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Class Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
            >
              {periods.map(p => <option key={p} value={p}>Period {p}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-navy-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Session: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDept} Sem {selectedSem}-{selectedSec} ({selectedSubject}) • Period {selectedPeriod}</span>
          </div>

          <button
            onClick={loadSession}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
            <span>Fetch Class Roster</span>
          </button>
        </div>
      </div>

      {/* Session Status & Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Enrolled</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
          <span className="text-[11px] font-bold uppercase text-emerald-500">Present</span>
          <p className="text-2xl font-black text-emerald-500 mt-0.5">{presentCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
          <span className="text-[11px] font-bold uppercase text-rose-500">Absent</span>
          <p className="text-2xl font-black text-rose-500 mt-0.5">{absentCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
          <span className="text-[11px] font-bold uppercase text-amber-500">Late / Attendance %</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{attendanceRate}%</p>
        </div>
      </div>

      {/* Main Attendance Roster Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student by name or USN..."
                className="pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white w-64"
              />
            </div>

            {/* Quick All Buttons */}
            {!session?.is_finalized && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => markAll('Present')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                >
                  All Present
                </button>
                <button
                  onClick={() => markAll('Absent')}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors"
                >
                  All Absent
                </button>
              </div>
            )}
          </div>

          {/* Status Badge & Action Buttons */}
          <div className="flex items-center gap-2.5">
            {session?.is_finalized ? (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Session Finalized & Locked</span>
              </div>
            ) : (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>

                <button
                  onClick={handleFinalizeAndSMS}
                  disabled={finalizing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {finalizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Finalize & Send SMS</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-navy-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-navy-800">
              <tr>
                <th className="py-3 px-4">USN</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Verified Mobile</th>
                <th className="py-3 px-4">Subject %</th>
                <th className="py-3 px-4">Attendance Status</th>
                {session?.is_finalized && <th className="py-3 px-4">SMS Notification</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filteredStudents.map((st) => {
                const sLog = smsLogs.find(l => l.student_id === st.student_id);
                return (
                  <tr key={st.student_id} className="hover:bg-slate-50/50 dark:hover:bg-navy-950/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">{st.usn}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {st.name}
                      {st.is_low_attendance && (
                        <span className="ml-2 inline-flex items-center text-[10px] text-rose-500 font-semibold" title="Attendance below 75%">
                          <AlertTriangle className="w-3 h-3 mr-0.5" /> Shortage
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{st.phone}</td>
                    <td className="py-3 px-4 font-bold">
                      <span className={st.is_low_attendance ? 'text-rose-500' : 'text-emerald-500'}>
                        {st.cumulative_percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={session?.is_finalized}
                          onClick={() => updateStudentStatus(st.student_id, 'Present')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            st.status === 'Present'
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                              : 'bg-slate-100 dark:bg-navy-800 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          P
                        </button>
                        <button
                          type="button"
                          disabled={session?.is_finalized}
                          onClick={() => updateStudentStatus(st.student_id, 'Absent')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            st.status === 'Absent'
                              ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                              : 'bg-slate-100 dark:bg-navy-800 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          A
                        </button>
                        <button
                          type="button"
                          disabled={session?.is_finalized}
                          onClick={() => updateStudentStatus(st.student_id, 'Late')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            st.status === 'Late'
                              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                              : 'bg-slate-100 dark:bg-navy-800 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          L
                        </button>
                      </div>
                    </td>
                    {session?.is_finalized && (
                      <td className="py-3 px-4">
                        {sLog ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sLog.status === 'Sent' || sLog.status === 'Demo'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                              {sLog.status} ({sLog.delivery_status || 'Delivered'})
                            </span>
                            {sLog.status === 'Failed' && (
                              <button
                                onClick={() => handleRetrySMS(sLog._id)}
                                className="p-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-[10px]"
                                title="Retry SMS"
                              >
                                <RotateCw className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Queued</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
