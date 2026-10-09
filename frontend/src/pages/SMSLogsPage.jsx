import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  MessageSquareCode,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Search,
  Filter,
  ShieldCheck,
  Smartphone,
  Check,
  Clock,
  Loader2
} from 'lucide-react';

export const SMSLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [retryingId, setRetryingId] = useState(null);

  useEffect(() => {
    fetchLogsAndStats();
  }, [statusFilter]);

  const fetchLogsAndStats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      
      const [logsRes, statsRes] = await Promise.all([
        api.get('/sms/logs', { params }),
        api.get('/sms/stats')
      ]);

      if (logsRes.data?.success) setLogs(logsRes.data.data || []);
      if (statsRes.data?.success) setStats(statsRes.data.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (notifId) => {
    setRetryingId(notifId);
    setActionMsg('');
    try {
      const res = await api.post(`/sms/${notifId}/retry`);
      if (res.data?.success) {
        setActionMsg(`SMS notification retry completed: ${res.data.data.status}`);
        fetchLogsAndStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Retry failed');
    } finally {
      setRetryingId(null);
    }
  };

  const filteredLogs = logs.filter(l =>
    (l.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.usn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.phone || '').includes(searchQuery) ||
    (l.subject_code || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquareCode className="w-6 h-6 text-cyan-500" />
            SMS Notification Engine & Audit Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Twilio delivery logs, provider Message SID tracking, retry queue, and delivery receipts
          </p>
        </div>

        <button
          onClick={fetchLogsAndStats}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">Engine Mode</span>
            <p className="text-base font-black text-cyan-500 mt-0.5 uppercase">{stats.current_mode}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Dispatched</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
            <span className="text-[10px] font-bold uppercase text-emerald-500">Live Sent</span>
            <p className="text-xl font-black text-emerald-500 mt-0.5">{stats.sent}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
            <span className="text-[10px] font-bold uppercase text-cyan-500">Demo Simulated</span>
            <p className="text-xl font-black text-cyan-500 mt-0.5">{stats.demo}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
            <span className="text-[10px] font-bold uppercase text-rose-500">Failed / Retried</span>
            <p className="text-xl font-black text-rose-500 mt-0.5">{stats.failed}</p>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, USN, phone number (+91...), or subject..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'Demo', 'Sent', 'Failed', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-navy-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-navy-800">
              <tr>
                <th className="py-3 px-4">Student (USN)</th>
                <th className="py-3 px-4">Recipient Mobile</th>
                <th className="py-3 px-4">Subject & Date</th>
                <th className="py-3 px-4">Message Body Preview</th>
                <th className="py-3 px-4">Provider Message SID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-navy-950/30">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{log.student_name}</p>
                    <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400">{log.usn}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-600 dark:text-slate-300">
                    {log.phone}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{log.subject_code}</p>
                    <span className="text-[10px] text-slate-400">{log.date}</span>
                  </td>
                  <td className="py-3 px-4 max-w-sm">
                    <p className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed text-[11px]">
                      {log.message_body}
                    </p>
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                    {log.provider_message_id || 'N/A (Pending)'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      log.status === 'Sent' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      log.status === 'Demo' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' :
                      log.status === 'Failed' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                      'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {log.status} ({log.delivery_status || 'Processed'})
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {log.status === 'Failed' ? (
                      <button
                        onClick={() => handleRetry(log._id)}
                        disabled={retryingId === log._id}
                        className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 flex items-center gap-1 transition-colors"
                      >
                        <RotateCw className={`w-3 h-3 ${retryingId === log._id ? 'animate-spin' : ''}`} />
                        <span>Retry</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Dispatched
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
