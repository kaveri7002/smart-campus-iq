import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  QrCode,
  ScanFace,
  FlaskConical,
  GitBranch,
  Briefcase,
  AlertCircle,
  Calendar,
  BookOpen,
  MessageSquareCode,
  Users,
  Building2,
  Compass,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const getNavLinks = () => {
    const common = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ];

    if (role === 'student') {
      return [
        ...common,
        { name: 'My Attendance', path: '/attendance-view', icon: CalendarCheck },
        { name: 'QR Scan Check-In', path: '/qr-attendance', icon: QrCode },
        { name: 'Engineering Labs', path: '/labs', icon: FlaskConical },
        { name: 'Project & Hackathon Hub', path: '/projects', icon: GitBranch },
        { name: 'Placement & Career', path: '/placements', icon: Briefcase },
        { name: 'Campus Complaints', path: '/complaints', icon: AlertCircle },
        { name: 'Events & Hackathons', path: '/events', icon: Calendar },
        { name: 'Digital Library', path: '/library', icon: BookOpen },
        { name: 'Campus Life & Map', path: '/campus-life', icon: Compass },
      ];
    }

    if (role === 'faculty') {
      return [
        ...common,
        { name: 'Smart Attendance', path: '/attendance', icon: CalendarCheck, highlight: true },
        { name: 'Live QR Session', path: '/qr-attendance', icon: QrCode },
        { name: 'Face Biometrics (AI)', path: '/face-attendance', icon: ScanFace },
        { name: 'SMS Notification Logs', path: '/sms-logs', icon: MessageSquareCode },
        { name: 'Lab Bookings & Approvals', path: '/labs', icon: FlaskConical },
        { name: 'Project Collaboration', path: '/projects', icon: GitBranch },
        { name: 'Campus Complaints', path: '/complaints', icon: AlertCircle },
        { name: 'College Events', path: '/events', icon: Calendar },
        { name: 'Digital Library', path: '/library', icon: BookOpen },
        { name: 'Campus Life & Map', path: '/campus-life', icon: Compass },
      ];
    }

    if (role === 'admin') {
      return [
        ...common,
        { name: 'Smart Attendance', path: '/attendance', icon: CalendarCheck },
        { name: 'SMS Logs & Retries', path: '/sms-logs', icon: MessageSquareCode, highlight: true },
        { name: 'User Management', path: '/admin-users', icon: Users },
        { name: 'Complaints Desk', path: '/complaints', icon: AlertCircle },
        { name: 'Lab Management', path: '/labs', icon: FlaskConical },
        { name: 'Project Hub', path: '/projects', icon: GitBranch },
        { name: 'College Events', path: '/events', icon: Calendar },
        { name: 'Digital Library', path: '/library', icon: BookOpen },
        { name: 'Campus Life & Map', path: '/campus-life', icon: Compass },
      ];
    }

    return common;
  };

  const links = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800
        flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-navy-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Smart Campus <span className="text-cyan-500 font-extrabold text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 dark:bg-cyan-500/20">IQ</span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Engineering College Portal</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Tag */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-navy-950/50 border-b border-slate-200/60 dark:border-navy-800/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Logged Role</span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
            role === 'admin' 
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
              : role === 'faculty'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
          }`}>
            {role}
          </span>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-semibold' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800/80 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{link.name}</span>
                {link.highlight && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-200 dark:border-navy-800 text-center">
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Smart Campus IQ • v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};
