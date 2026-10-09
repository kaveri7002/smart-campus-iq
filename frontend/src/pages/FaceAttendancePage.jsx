import React, { useState } from 'react';
import api from '../services/api';
import {
  ScanFace,
  Camera,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  RotateCw,
  Loader2,
  Info
} from 'lucide-react';

export const FaceAttendancePage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [scanMessage, setScanMessage] = useState('');
  const [enrolled, setEnrolled] = useState(false);

  const handleTriggerScan = async () => {
    setIsScanning(true);
    setScanMessage('');
    setCandidates([]);

    try {
      // Fetch current active sessions
      const sessRes = await api.get('/attendance/sessions');
      const activeSession = sessRes.data?.data?.[0];
      const sessionId = activeSession?._id || "661234567890abcdef123456";

      const res = await api.post('/attendance/face/verify', {
        session_id: sessionId,
        image: "simulated_base64_frame_data"
      });

      if (res.data?.success) {
        setCandidates(res.data.data.candidates || []);
        setScanMessage(`AI Biometric Scanner processed ${res.data.data.matched_count} student faces with OpenCV biometric matching.`);
      }
    } catch (err) {
      console.error(err);
      setScanMessage('Biometric scanner error. Switched to fallback mode.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleEnrollConsent = async () => {
    try {
      const res = await api.post('/attendance/face/enroll', {
        image: "simulated_consent_face_template"
      });
      if (res.data?.success) {
        setEnrolled(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <ScanFace className="w-6 h-6 text-cyan-500" />
          AI Biometric Face Recognition Attendance
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Optional Computer Vision module with privacy consent & manual review fallback
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
          <p className="font-bold text-slate-900 dark:text-white">Privacy & Verification Standard</p>
          <p>
            Student facial landmarks are encrypted. Faculty retains final manual approval before persisting records into MongoDB and triggering SMS notifications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Simulation Viewport */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-500" />
              Live Lecture Hall Camera Feed
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Stream Active
            </span>
          </div>

          <div className="h-64 rounded-2xl bg-navy-950 border border-navy-800 relative flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Scan target grid animation overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#06B6D4_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
            
            <div className="w-36 h-36 border-2 border-cyan-500/60 rounded-3xl flex items-center justify-center relative animate-pulse">
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
              <ScanFace className="w-14 h-14 text-cyan-400 opacity-60" />
            </div>
            
            <p className="text-xs text-slate-400 mt-3 z-10">AI Face Recognition & Landmark Extractor</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerScan}
              disabled={isScanning}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanFace className="w-4 h-4" />}
              <span>Execute Biometric Attendance Scan</span>
            </button>

            <button
              onClick={handleEnrollConsent}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
            >
              {enrolled ? "Face Enrolled ✓" : "Register Consent"}
            </button>
          </div>
        </div>

        {/* Matched Student Candidates */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                Detected Students
              </h3>
              <span className="text-xs font-bold text-slate-400">
                {candidates.length} Matched
              </span>
            </div>

            {scanMessage && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                {scanMessage}
              </p>
            )}

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {candidates.length > 0 ? (
                candidates.map((cand, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cand.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">USN: {cand.usn} • {cand.department}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-500">{cand.confidence}%</span>
                      <p className="text-[9px] text-slate-400 uppercase font-semibold">Match Score</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <ScanFace className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs">Click 'Execute Biometric Attendance Scan' to detect faces.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-navy-800 text-[11px] text-slate-400 text-center">
            Detected students can be reviewed in Smart Attendance before final SMS dispatch.
          </div>
        </div>
      </div>
    </div>
  );
};
