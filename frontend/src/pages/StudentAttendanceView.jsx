import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Clock,
  ShieldCheck,
  MessageSquareCode,
  BookOpen,
  Edit2,
  Save,
  Loader2
} from 'lucide-react';

export const StudentAttendanceView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/me');
      if (res.data?.success) {
        setData(res.data.data);
        setPhone(res.data.data.student?.phone || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!phone) return;
    setSavingPhone(true);
    try {
      const res = await api.put('/students/me', { phone });
      if (res.data?.success) {
        setEditingPhone(false);
        setPhoneSuccess('Mobile number verified & updated for SMS notifications.');
        setTimeout(() => setPhoneSuccess(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPhone(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Fetching individual attendance ledger...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-cyan-500" />
            My Attendance Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time subject-wise percentage, session audit records, and SMS notifications
          </p>
        </div>

        {/* Verified SMS Mobile Box */}
        <div className="p-3 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SMS Alert Target</span>
            {editingPhone ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="px-2 py-0.5 text-xs bg-slate-50 dark:bg-navy-950 border border-cyan-500 rounded-lg focus:outline-none text-slate-900 dark:text-white font-mono"
                />
                <button
                  onClick={handleUpdatePhone}
                  disabled={savingPhone}
                  className="p-1 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{phone}</span>
                <button onClick={() => setEditingPhone(true)} className="text-slate-400 hover:text-cyan-500">
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {phoneSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{phoneSuccess}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-6 rounded-3xl border shadow-sm ${
          data.is_low_attendance 
            ? 'bg-rose-500/5 border-rose-500/20 dark:bg-navy-900' 
            : 'bg-emerald-500/5 border-emerald-500/20 dark:bg-navy-900'
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cumulative Attendance</span>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className={`text-4xl font-black ${data.is_low_attendance ? 'text-rose-500' : 'text-emerald-500'}`}>
              {data.overall_percentage}%
            </h3>
            <span className="text-xs font-bold text-slate-400">/ 100%</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {data.is_low_attendance ? "⚠️ You are below the 75% eligibility criteria." : "✓ Satisfactory standing for university examinations."}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Classes Attended</span>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-4xl font-black text-cyan-500">{data.attended_classes}</h3>
            <span className="text-xs font-bold text-slate-400">of {data.total_classes} total held</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Includes lectures, tutorials, and practical laboratory sessions.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Absences Recorded</span>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{data.absent_classes}</h3>
            <span className="text-xs font-bold text-slate-400">missed periods</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Immediate SMS sent to registered guardian & student on absence.
          </p>
        </div>
      </div>

      {/* Subject Breakdown Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Subject-wise Attendance Breakdown</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track eligibility per theory and practical course</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-navy-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-navy-800">
              <tr>
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4">Held</th>
                <th className="py-3 px-4">Attended</th>
                <th className="py-3 px-4">Absent</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {data.subject_breakdown?.map((subj) => (
                <tr key={subj.code} className="hover:bg-slate-50/50 dark:hover:bg-navy-950/30">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">{subj.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{subj.name}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{subj.held}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-500">{subj.attended}</td>
                  <td className="py-3 px-4 font-semibold text-rose-500">{subj.absent}</td>
                  <td className="py-3 px-4 font-bold">
                    <span className={subj.is_low ? 'text-rose-500' : 'text-emerald-500'}>
                      {subj.percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      subj.is_low 
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {subj.is_low ? 'Shortage (<75%)' : 'Eligible'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SMS Logs History Feed */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquareCode className="w-4 h-4 text-cyan-500" />
              Automated SMS Audit Trail
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">History of SMS delivery receipts dispatched to {data.student?.phone}</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            {data.sms_history?.length || 0} Alerts
          </span>
        </div>

        <div className="space-y-3">
          {data.sms_history?.map((sms, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 uppercase font-mono">
                    {sms.subject_code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{sms.date}</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed max-w-2xl">
                  {sms.message_body}
                </p>
              </div>

              <div className="flex items-center gap-2 text-right">
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {sms.delivery_status || sms.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
