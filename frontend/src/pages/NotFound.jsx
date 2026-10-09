import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4 border border-cyan-500/20">
        <Building2 className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white">404</h1>
      <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 mt-2">Campus Page Not Found</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
        The requested university portal module does not exist or has been relocated.
      </p>

      <button
        onClick={() => navigate('/dashboard')}
        className="mt-6 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};
