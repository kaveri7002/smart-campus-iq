import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Loader2
} from 'lucide-react';

export const QRAttendancePage = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  // Faculty State
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [qrData, setQrData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [scannedList, setScannedList] = useState([]);
  const [polling, setPolling] = useState(false);

  // Student State
  const [manualToken, setManualToken] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinResult, setCheckinResult] = useState(null);
  const [checkinError, setCheckinError] = useState('');

  useEffect(() => {
    if (role === 'faculty' || role === 'admin') {
      fetchSessions();
    }
  }, [role]);

  // Polling for faculty live scanned check-ins
  useEffect(() => {
    let interval = null;
    if (qrData && selectedSessionId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/attendance/qr/status/${selectedSessionId}`);
          if (res.data?.success) {
            setScannedList(res.data.data.scanned_students || []);
          }
        } catch (err) {
          console.error("QR status poll error", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [qrData, selectedSessionId]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/attendance/sessions');
      if (res.data?.success) {
        setSessions(res.data.data || []);
        if (res.data.data.length > 0) {
          setSelectedSessionId(res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedSessionId) return;
    setGenerating(true);
    try {
      const res = await api.post('/attendance/qr/create', {
        session_id: selectedSessionId,
        valid_minutes: 15
      });
      if (res.data?.success) {
        setQrData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to create QR session", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleStudentCheckin = async (tokenPayload) => {
    setCheckinLoading(true);
    setCheckinError('');
    setCheckinResult(null);

    try {
      const res = await api.post('/attendance/qr/checkin', {
        qr_payload: tokenPayload || manualToken
      });
      if (res.data?.success) {
        setCheckinResult(res.data.data);
        confetti({ particleCount: 60, spread: 60 });
      }
    } catch (err) {
      setCheckinError(err.response?.data?.message || 'Check-in failed. Please verify QR validity.');
    } finally {
      setCheckinLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <QrCode className="w-6 h-6 text-cyan-500" />
          QR Attendance Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          High-security cryptographic QR check-in with identity validation & anti-replay protection
        </p>
      </div>

      {/* FACULTY / ADMIN VIEW: GENERATE QR */}
      {(role === 'faculty' || role === 'admin') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Generator Panel */}
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              Generate Class QR Code
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an attendance session to broadcast a 15-minute dynamic QR code on the lecture hall screen.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Select Active Class Session</label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
              >
                {sessions.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.subject_name || s.subject_code} • {s.department} Sem {s.semester}-{s.section} ({s.date} P{s.period})
                  </option>
                ))}
              </select>

              <button
                onClick={handleGenerateQR}
                disabled={generating || !selectedSessionId}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                <span>Generate Signed QR Code</span>
              </button>
            </div>

            {/* Generated QR Display */}
            {qrData && (
              <div className="mt-6 p-6 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex flex-col items-center text-center animate-in zoom-in-95">
                <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 inline-block mb-3">
                  <img src={qrData.qr_image_data} alt="Attendance QR Code" className="w-48 h-48 rounded-lg" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Valid for 15 Minutes</span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono break-all max-w-xs">
                  Session Token: {qrData.token.slice(0, 16)}...
                </p>
              </div>
            )}
          </div>

          {/* Live Scanned Students Monitor */}
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    Live Student Check-Ins
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Real-time incoming student scans</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {scannedList.length} Checked In
                </span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {scannedList.length > 0 ? (
                  scannedList.map((st, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-xs flex items-center justify-center">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{st.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">USN: {st.usn}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">{st.scanned_at ? new Date(st.scanned_at).toLocaleTimeString() : 'Checked in'}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Smartphone className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-xs">Waiting for student check-ins...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-navy-800 text-[11px] text-slate-400 text-center">
              Scanned records are automatically saved as Present in the attendance session.
            </div>
          </div>
        </div>
      )}

      {/* STUDENT VIEW: SCAN / SUBMIT QR */}
      {role === 'student' && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/25 mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Student QR Attendance Scanner</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Point your camera at the screen or paste the active classroom QR session token
            </p>
          </div>

          {checkinResult && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <p className="font-bold text-sm">Attendance Verified!</p>
                <p className="mt-0.5">{checkinResult.message}</p>
              </div>
            </div>
          )}

          {checkinError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{checkinError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Classroom QR Session Token / Code</label>
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste token or payload (e.g. SMARTCAMPUS_QR_ATTENDANCE:...)"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <button
              onClick={() => handleStudentCheckin(manualToken)}
              disabled={checkinLoading || !manualToken}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {checkinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Submit QR Check-In</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Verification Safeguards:</p>
            <p>• Duplicate scans for the same class period are blocked.</p>
            <p>• Session tokens expire automatically after 15 minutes.</p>
            <p>• SMS confirmation is dispatched once the faculty finalizes the session.</p>
          </div>
        </div>
      )}
    </div>
  );
};
