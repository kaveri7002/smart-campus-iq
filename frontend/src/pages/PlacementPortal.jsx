import React, { useState, useEffect } from 'react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Code2,
  BookOpen,
  Award,
  ChevronRight,
  Send,
  Building,
  DollarSign
} from 'lucide-react';

export const PlacementPortal = () => {
  const [drives, setDrives] = useState([]);
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const fetchPlacementData = async () => {
    setLoading(true);
    try {
      const [drivesRes, resourcesRes] = await Promise.all([
        api.get('/placement/drives'),
        api.get('/placement/prep-resources')
      ]);

      if (drivesRes.data?.success) setDrives(drivesRes.data.data || []);
      if (resourcesRes.data?.success) setResources(resourcesRes.data.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDrive = async (driveId, companyName) => {
    try {
      const res = await api.post(`/placement/drives/${driveId}/apply`);
      if (res.data?.success) {
        setActionMsg(`Application submitted for ${companyName}! Shortlist status will update upon recruiter review.`);
        confetti({ particleCount: 50, spread: 60 });
        setTimeout(() => setActionMsg(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Eligibility criteria not met or error applying.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Briefcase className="w-6 h-6 text-cyan-500" />
          Placement & Career Development Cell
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tier-1 placement drives, algorithmic coding track, aptitude preparation, and ATS resume verification
        </p>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Placement Drives Board */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Campus Recruitment Drives</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {drives.map((d) => (
            <div key={d._id} className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-cyan-500" />
                    {d.company_name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {d.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{d.role}</h4>
                
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-black text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                    CTC: {d.ctc}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Min CGPA: <b className="text-slate-900 dark:text-white">{d.eligibility_cgpa}</b>
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluation Rounds:</span>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    {d.rounds?.map((r, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Drive Date: {d.drive_date}</span>
                <button
                  onClick={() => handleApplyDrive(d._id, d.company_name)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Apply Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prep Tracker, Aptitude & Resume Section */}
      {resources && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coding tracker */}
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-500" />
                DSA Coding Tracker
              </h3>
              <span className="text-xs font-bold text-emerald-500">
                {resources.coding_stats.streak_days} Day Streak 🔥
              </span>
            </div>

            <div className="text-center py-2">
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">
                {resources.coding_stats.problems_solved} <span className="text-xs text-slate-400 font-semibold">/ {resources.coding_stats.target} Target</span>
              </h4>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-emerald-500">Easy ({resources.coding_stats.easy})</span>
                <span className="text-amber-500">Medium ({resources.coding_stats.medium})</span>
                <span className="text-rose-500">Hard ({resources.coding_stats.hard})</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-navy-950 flex overflow-hidden">
                <div style={{ width: '42%' }} className="bg-emerald-500" />
                <div style={{ width: '46%' }} className="bg-amber-500" />
                <div style={{ width: '12%' }} className="bg-rose-500" />
              </div>
            </div>
          </div>

          {/* Aptitude preparation */}
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Aptitude & Logical Reasoning
            </h3>

            <div className="space-y-3 pt-1">
              {resources.aptitude_modules.map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{m.topic}</span>
                    <span className="font-bold text-cyan-500">{m.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-navy-950 overflow-hidden">
                    <div style={{ width: `${m.progress}%` }} className="h-full bg-cyan-500 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resume checklist */}
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              ATS Engineering Resume Checklist
            </h3>

            <div className="space-y-2 pt-1">
              {resources.resume_checklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${item.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                  <span className={item.completed ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400 line-through'}>
                    {item.item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
