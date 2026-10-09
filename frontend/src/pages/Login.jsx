import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    
    // Auto trigger login with selected credentials
    setLoading(true);
    login(demoEmail, demoPassword).then((res) => {
      setLoading(false);
      if (res.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(res.message);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50 dark:bg-navy-950 selection:bg-cyan-500 selection:text-white">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 mb-4">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
            Smart Campus <span className="text-cyan-500 font-extrabold text-sm px-2 py-0.5 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20">IQ</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Smart Engineering College Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Login</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter your institutional credentials to continue</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <span className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer">Forgot?</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Campus IQ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts Selector */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-navy-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                1-Click Quick Demo Login
              </span>
              <span className="text-[10px] text-slate-400">Hackathon Preloaded</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('student1@campus.edu', 'Campus@123')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-emerald-500/40 bg-slate-50 dark:bg-navy-950 hover:bg-emerald-500/5 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <GraduationCap className="w-4 h-4 text-emerald-500" />
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">STU</span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">Aditya</p>
                <p className="text-[10px] text-slate-400 truncate">CSE 6th Sem</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('faculty.cse@campus.edu', 'Campus@123')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-blue-500/40 bg-slate-50 dark:bg-navy-950 hover:bg-blue-500/5 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">FAC</span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">Dr. Rajesh</p>
                <p className="text-[10px] text-slate-400 truncate">CSE Faculty</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@campus.edu', 'Campus@123')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-purple-500/40 bg-slate-50 dark:bg-navy-950 hover:bg-purple-500/5 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-4 h-4 text-purple-500" />
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">ADM</span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">Dean Admin</p>
                <p className="text-[10px] text-slate-400 truncate">Superadmin</p>
              </button>
            </div>
          </div>
        </div>

        {/* Info footnote */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-6">
          Automated Twilio SMS Engine • Biometric & QR Attendance • MongoDB Atlas
        </p>
      </div>
    </div>
  );
};
