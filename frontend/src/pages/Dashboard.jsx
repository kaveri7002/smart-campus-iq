import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import {
  CalendarCheck,
  AlertTriangle,
  QrCode,
  FlaskConical,
  GitBranch,
  Briefcase,
  Users,
  MessageSquareCode,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  PhoneCall,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'student';

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [role]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      let endpoint = '/dashboard/student';
      if (role === 'faculty') endpoint = '/dashboard/faculty';
      if (role === 'admin') endpoint = '/dashboard/admin';

      const res = await api.get(endpoint);
      if (res.data?.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading campus analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-800 text-white shadow-xl relative overflow-hidden border border-navy-700">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart Campus IQ • Engineering Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user?.name || 'Engineer'}!
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {role === 'student' && `USN: ${user?.usn || '1IT21CS001'} | Department of ${user?.department || 'CSE'} (Semester ${user?.semester || 6})`}
              {role === 'faculty' && `Department of ${user?.department || 'CSE'} | Cabin: ${user?.cabin || 'A-304'}`}
              {role === 'admin' && `Institutional Administrator | System Monitoring & Automated SMS Engine`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {role === 'faculty' && (
              <button
                onClick={() => navigate('/attendance')}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Mark Attendance</span>
              </button>
            )}
            {role === 'student' && (
              <button
                onClick={() => navigate('/qr-attendance')}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan QR Check-In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STUDENT DASHBOARD VIEW */}
      {role === 'student' && dashboardData && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Overall Attendance"
              value={`${dashboardData.overall_attendance_pct}%`}
              subtitle={dashboardData.is_low_attendance ? "CRITICAL (<75% threshold)" : "Satisfactory status"}
              icon={CalendarCheck}
              color={dashboardData.is_low_attendance ? 'rose' : 'emerald'}
              trend={{
                text: dashboardData.is_low_attendance ? "Shortage Alert" : "Eligible for Exams",
                positive: !dashboardData.is_low_attendance
              }}
            />
            <StatCard
              title="Classes Attended"
              value={`${dashboardData.attended_classes} / ${dashboardData.total_classes}`}
              subtitle="Total classes held so far"
              icon={Clock}
              color="cyan"
            />
            <StatCard
              title="Academic CGPA"
              value={dashboardData.profile?.cgpa || '8.92'}
              subtitle="Cumulative Grade Point Avg"
              icon={Sparkles}
              color="purple"
            />
            <StatCard
              title="Verified Mobile"
              value={dashboardData.profile?.phone || '+919876543210'}
              subtitle="SMS Notifications Target"
              icon={PhoneCall}
              color="blue"
            />
          </div>

          {/* Quick Shortcuts & Today Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Schedule */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Class Schedule</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Timetable for {dashboardData.profile?.department} Sem {dashboardData.profile?.semester}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  {dashboardData.today_schedule?.length || 0} Periods Today
                </span>
              </div>

              <div className="space-y-3">
                {dashboardData.today_schedule?.length > 0 ? (
                  dashboardData.today_schedule.map((slot, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-800/60 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-xs flex items-center justify-center">
                          P{slot.period}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{slot.subject_name} ({slot.subject_code})</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{slot.faculty} • Room {slot.room}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-navy-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-navy-800">
                        {slot.time}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No scheduled lectures for today.</p>
                )}
              </div>
            </div>

            {/* Recent SMS Notification Alerts */}
            <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquareCode className="w-4 h-4 text-cyan-500" />
                    SMS Attendance Feed
                  </h3>
                  <button onClick={() => navigate('/attendance-view')} className="text-xs text-cyan-500 font-semibold hover:underline">
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {dashboardData.recent_sms?.length > 0 ? (
                    dashboardData.recent_sms.map((sms, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-800/60">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">{sms.subject_code}</span>
                          <span className="text-[10px] text-slate-400">{sms.date}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {sms.message_body}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-500 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {sms.status}
                          </span>
                          <span className="text-slate-400">To: {sms.phone}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-8 text-center">No SMS alerts received yet.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-navy-800">
                <button
                  onClick={() => navigate('/attendance-view')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Detailed Attendance Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FACULTY DASHBOARD VIEW */}
      {role === 'faculty' && dashboardData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Assigned Subjects"
              value={dashboardData.assigned_subjects?.length || 2}
              subtitle="Teaching in current semester"
              icon={CalendarCheck}
              color="cyan"
            />
            <StatCard
              title="Attendance Sessions"
              value={dashboardData.recent_sessions?.length || 0}
              subtitle="Conducted this term"
              icon={Clock}
              color="blue"
            />
            <StatCard
              title="Low Attendance Alerts"
              value={dashboardData.low_attendance_alerts?.length || 0}
              subtitle="Students below 75%"
              icon={AlertTriangle}
              color="rose"
            />
            <StatCard
              title="Pending Lab Bookings"
              value={dashboardData.pending_lab_approvals?.length || 0}
              subtitle="Awaiting faculty approval"
              icon={FlaskConical}
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions & Recent Sessions */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Attendance Sessions</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Mark attendance, trigger automated SMS, and export reports</p>
                </div>
                <button
                  onClick={() => navigate('/attendance')}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Launch Session</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {dashboardData.recent_sessions?.length > 0 ? (
                  dashboardData.recent_sessions.map((sess, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sess.subject_name || sess.subject_code}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {sess.department} • Sem {sess.semester} - Sec {sess.section} • Period {sess.period} • {sess.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {sess.is_finalized ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Finalized
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No attendance sessions recorded yet.</p>
                )}
              </div>
            </div>

            {/* Critical Low Attendance Student List */}
            <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Shortage Alerts (&lt;75%)
                </h3>
              </div>

              <div className="space-y-3">
                {dashboardData.low_attendance_alerts?.length > 0 ? (
                  dashboardData.low_attendance_alerts.map((st, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{st.name}</span>
                        <span className="text-xs font-black text-rose-600 dark:text-rose-400">{st.percentage}%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">USN: {st.usn} • {st.department}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Mobile: {st.phone}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-8 text-center">All students are above the 75% threshold.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMINISTRATOR DASHBOARD VIEW */}
      {role === 'admin' && dashboardData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Students"
              value={dashboardData.metrics?.total_students || 0}
              subtitle="Registered across engineering depts"
              icon={Users}
              color="cyan"
            />
            <StatCard
              title="Campus Attendance Avg"
              value={`${dashboardData.metrics?.average_attendance || 88.5}%`}
              subtitle="Overall institution average"
              icon={CalendarCheck}
              color="emerald"
            />
            <StatCard
              title="Total SMS Dispatched"
              value={dashboardData.sms_stats?.total || 0}
              subtitle={`Mode: ${dashboardData.sms_stats?.mode?.toUpperCase() || 'DEMO'}`}
              icon={MessageSquareCode}
              color="purple"
            />
            <StatCard
              title="Open Complaints"
              value={dashboardData.metrics?.open_complaints || 0}
              subtitle="Campus infrastructure tickets"
              icon={AlertTriangle}
              color={dashboardData.metrics?.open_complaints > 0 ? 'amber' : 'emerald'}
            />
          </div>

          {/* Department Breakdown & SMS Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Student Enrollment by Engineering Department</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Distribution across CSE, AI & ML, ECE, ISE, ME, and Civil</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.department_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="students" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">SMS Engine Statistics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Twilio Live vs Demo Simulation</p>

              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Current Mode</span>
                  <p className="text-base font-black text-slate-900 dark:text-white uppercase mt-0.5">
                    {dashboardData.sms_stats?.mode || 'DEMO MODE'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Demo Mode logs simulated messages safely without incurring SMS fees.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 text-center">
                    <p className="text-xs font-semibold text-slate-400">Delivered/Demo</p>
                    <p className="text-lg font-black text-emerald-500 mt-1">{dashboardData.sms_stats?.demo + dashboardData.sms_stats?.sent || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 text-center">
                    <p className="text-xs font-semibold text-slate-400">Failed / Retried</p>
                    <p className="text-lg font-black text-rose-500 mt-1">{dashboardData.sms_stats?.failed || 0}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/sms-logs')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquareCode className="w-4 h-4 text-cyan-500" />
                  <span>Inspect Audit Logs & Retries</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
