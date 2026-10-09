import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Search,
  LogOut,
  User,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const Navbar = ({ onOpenSidebar, onOpenFAQ }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: "Attendance SMS Engine Active",
      desc: "SMS mode is set to Demo Mode (Safe simulation enabled).",
      time: "Just now",
      icon: CheckCircle2,
      color: "text-cyan-500"
    },
    {
      id: 2,
      title: "Hackathon 2026 Registration Open",
      desc: "Smart India Hackathon campus round registrations open.",
      time: "2 hours ago",
      icon: Sparkles,
      color: "text-emerald-500"
    },
    {
      id: 3,
      title: "Attendance Alert (CSE 6th Sem)",
      desc: "Rohan Deshmukh has fallen below 75% attendance threshold.",
      time: "1 day ago",
      icon: AlertTriangle,
      color: "text-amber-500"
    }
  ];

  return (
    <header className="h-16 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile menu toggle + Search bar */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search USN, subjects, labs, projects..."
            className="pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 rounded-xl w-64 md:w-80 focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Actions, Theme, FAQ, Notifications, Profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Campus FAQ Assistant Button */}
        <button
          onClick={onOpenFAQ}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold transition-all border border-cyan-500/20"
          title="Smart Campus FAQ Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span className="hidden md:inline">Campus FAQ AI</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">Campus Notifications</span>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-navy-800/60">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors flex items-start space-x-3">
                      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${n.color}`} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-800 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left pr-1">
              <p className="text-xs font-bold leading-tight text-slate-900 dark:text-white truncate max-w-[120px]">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {user?.usn || user?.role || 'Member'}
              </p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-navy-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                {user?.usn && (
                  <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-semibold mt-1">USN: {user.usn}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
