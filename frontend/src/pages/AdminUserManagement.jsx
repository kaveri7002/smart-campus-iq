import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Users,
  Plus,
  Settings,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  Save,
  Search
} from 'lucide-react';

export const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({
    college_name: 'Institute of Technology & Advanced Engineering (ITAE)',
    college_code: 'ITAE',
    attendance_threshold_percentage: 75,
    sms_mode: 'demo',
    allow_qr_attendance: true,
    allow_face_attendance: true
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // New User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Campus@123');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('CSE');
  const [phone, setPhone] = useState('+91');
  const [semester, setSemester] = useState(6);
  const [section, setSection] = useState('A');
  const [actionMsg, setActionMsg] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    fetchUsersAndSettings();
  }, []);

  const fetchUsersAndSettings = async () => {
    setLoading(true);
    try {
      const [usersRes, settingsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/settings')
      ]);

      if (usersRes.data?.success) setUsers(usersRes.data.data || []);
      if (settingsRes.data?.success && settingsRes.data.data) {
        setSettings(prev => ({ ...prev, ...settingsRes.data.data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      const res = await api.post('/admin/users', {
        name,
        email,
        password,
        role,
        department,
        phone,
        semester,
        section
      });

      if (res.data?.success) {
        setActionMsg(`User account for ${name} (${role}) created successfully!`);
        setShowCreateModal(false);
        setName('');
        setEmail('');
        fetchUsersAndSettings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/admin/settings', settings);
      if (res.data?.success) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 4000);
      }
    } catch (err) {
      alert("Error saving settings");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-cyan-500" />
          Institutional Administration & System Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage user credentials, attendance threshold policies, and SMS engine modes
        </p>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* System Settings Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-500" />
            Global Campus Configuration
          </h3>
          {settingsSaved && (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Settings Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">College Name</label>
            <input
              type="text"
              value={settings.college_name || ''}
              onChange={(e) => setSettings({ ...settings, college_name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Attendance Threshold (%)</label>
            <input
              type="number"
              value={settings.attendance_threshold_percentage || 75}
              onChange={(e) => setSettings({ ...settings, attendance_threshold_percentage: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">SMS Engine Mode</label>
            <select
              value={settings.sms_mode || 'demo'}
              onChange={(e) => setSettings({ ...settings, sms_mode: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-bold"
            >
              <option value="demo">Demo Mode (Simulated SMS - Safe)</option>
              <option value="live">Live Mode (Twilio Production API)</option>
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Global Policy</span>
            </button>
          </div>
        </form>
      </div>

      {/* User Management Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-500" />
              Institutional User Roster
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Students, Faculty members, and Academic Administrators</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add User Account</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {['All', 'Student', 'Faculty', 'Admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  roleFilter === r
                    ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-navy-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-navy-800">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Contact #</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-navy-950/30">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{u.department}</td>
                  <td className="py-3 px-4 text-slate-500">{u.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                      u.role === 'faculty' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Provision Institutional Account</h3>
            
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Prof. Rajesh Kumar"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="CSE">CSE</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="ECE">ECE</option>
                    <option value="ISE">ISE</option>
                    <option value="EEE">EEE</option>
                    <option value="ME">ME</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone (SMS Target)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
