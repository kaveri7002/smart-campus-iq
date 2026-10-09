import React, { useState } from 'react';
import {
  Compass,
  PhoneCall,
  Search,
  MapPin,
  Building2,
  ShieldCheck,
  HeartPulse,
  Tag,
  Plus,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const CampusLife = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [lostFoundItems, setLostFoundItems] = useState([
    {
      id: 1,
      title: "Logitech MX Master 3S Mouse",
      category: "Electronics",
      location: "GPU Compute Lab 301 - Innovation Hub",
      date: "2026-10-08",
      contact: "Contact Lab In-charge Prof. Priya",
      status: "Found & Deposited"
    },
    {
      id: 2,
      title: "TI-84 Plus Graphic Calculator",
      category: "Stationery",
      location: "Seminar Hall 1 - Block A",
      date: "2026-10-07",
      contact: "1IT21CS003 (Rohan)",
      status: "Lost"
    },
    {
      id: 3,
      title: "Titan Stainless Steel Water Bottle",
      category: "Personal Item",
      location: "Central Library 2nd Floor Reading Hall",
      date: "2026-10-06",
      contact: "Security Desk Main Gate",
      status: "Found & Deposited"
    }
  ]);

  const campusBuildings = [
    { name: "Block A - Ramanujan Bhavan", desc: "Department of Computer Science & Information Science, Dean's Office, Main Auditorium", code: "BLK-A" },
    { name: "Block B - Vikram Sarabhai Bhavan", desc: "Department of ECE & EEE, Embedded Systems Labs, Robotics Arena", code: "BLK-B" },
    { name: "Block C - Innovation & Incubation Hub", desc: "AI & ML Department, NVIDIA GPU HPC Clusters, Startup Incubator", code: "BLK-C" },
    { name: "Block D - Sir MV Workshop Complex", desc: "Mechanical & Civil Engineering, CAD/CAM Center, Fluid Mechanics Lab", code: "BLK-D" },
    { name: "Central Digital Library & Research Commons", desc: "Over 50,000 volumes, 24x7 Silent Reading Zones, Digital Thesis Archive", code: "LIB-01" },
    { name: "Student Amenity Center & Food Court", desc: "Multi-cuisine Cafeteria, Stationary Emporium, Health Wellness Clinic", code: "SAC-01" }
  ];

  const emergencyContacts = [
    { title: "24x7 Campus Health Clinic & Ambulance", number: "+91-80-2846-1001", badge: "Immediate Medical Aid", icon: HeartPulse, color: "text-rose-500" },
    { title: "Campus Chief Security Officer (Main Gate)", number: "+91-80-2846-1002", badge: "24x7 Security Patrol", icon: ShieldCheck, color: "text-cyan-500" },
    { title: "Women Internal Complaints & Safety Cell", number: "+91-80-2846-1008", badge: "Confidential Support", icon: PhoneCall, color: "text-purple-500" },
    { title: "Dean of Student Welfare & Proctor", number: "+91-80-2846-1010", badge: "Academic & Hostel Grievance", icon: Building2, color: "text-blue-500" },
    { title: "Anti-Ragging Squad Helpline (Zero Tolerance)", number: "1800-180-5522", badge: "National Toll-Free", icon: ShieldCheck, color: "text-emerald-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Compass className="w-6 h-6 text-cyan-500" />
          Campus Life, Navigation Map & Emergency Services
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Interactive building navigation, lost & found notice board, and 24x7 emergency contacts
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 w-fit">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'map' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Campus Map & Directory
        </button>
        <button
          onClick={() => setActiveTab('lost-found')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'lost-found' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Lost & Found Desk
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'emergency' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Emergency Directory
        </button>
      </div>

      {/* TAB 1: CAMPUS MAP */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-500" />
              Interactive Campus Layout
            </h3>

            {/* Visual Vector Campus Map */}
            <div className="h-80 rounded-2xl bg-gradient-to-br from-navy-950 to-navy-900 border border-navy-800 relative p-6 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#06B6D4_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

              <div className="grid grid-cols-3 gap-3 relative z-10">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                  <span className="text-[10px] font-bold text-cyan-400">Block A</span>
                  <p className="text-xs font-bold text-white mt-0.5">CSE & ISE</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                  <span className="text-[10px] font-bold text-blue-400">Block B</span>
                  <p className="text-xs font-bold text-white mt-0.5">ECE & EEE</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
                  <span className="text-[10px] font-bold text-purple-400">Block C</span>
                  <p className="text-xs font-bold text-white mt-0.5">AI & ML HPC</p>
                </div>
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <span className="text-[10px] font-bold text-emerald-400">Central Library</span>
                  <p className="text-xs font-bold text-white mt-0.5">50k+ Books</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <span className="text-[10px] font-bold text-amber-400">Block D</span>
                  <p className="text-xs font-bold text-white mt-0.5">Mechanical & Civil</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-navy-900/80 border border-navy-700 text-center text-xs text-slate-300 relative z-10">
                📍 Institute of Technology & Advanced Engineering Campus (45-Acre Smart Wi-Fi Enabled Zone)
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Academic Blocks</h3>
            <div className="space-y-2.5">
              {campusBuildings.map((b, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-800/60">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{b.name}</h4>
                    <span className="font-mono text-[10px] font-bold text-cyan-500">{b.code}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOST & FOUND */}
      {activeTab === 'lost-found' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Campus Lost & Found Notice Board</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lostFoundItems.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    {item.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status.includes('Found') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {item.location}
                </p>
                <p className="text-[11px] text-slate-400">Contact: {item.contact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EMERGENCY CONTACTS */}
      {activeTab === 'emergency' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-500" />
            24x7 Critical Campus Helplines
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
                      <Icon className={`w-5 h-5 ${c.color}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{c.badge}</span>
                    </div>
                  </div>

                  <a
                    href={`tel:${c.number}`}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-mono font-bold text-xs shadow-md shadow-cyan-500/20"
                  >
                    {c.number}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
