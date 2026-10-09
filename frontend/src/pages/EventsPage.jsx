import React, { useState, useEffect } from 'react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Ticket,
  Plus
} from 'lucide-react';

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      if (res.data?.success) setEvents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEvent = async (eventId, title) => {
    try {
      const res = await api.post(`/events/${eventId}/register`);
      if (res.data?.success) {
        setActionMsg(`Seat confirmed for '${title}'! Ticket details emailed.`);
        confetti({ particleCount: 70, spread: 60 });
        fetchEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering for event');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Calendar className="w-6 h-6 text-cyan-500" />
          Technical Symposiums, Hackathons & Workshops
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Discover hackathons, AI workshops, and university symposiums with 1-click registration
        </p>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((ev) => {
          const isFull = ev.registered_count >= ev.max_seats;
          const availableSeats = Math.max(0, ev.max_seats - ev.registered_count);

          return (
            <div key={ev._id} className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 uppercase font-mono">
                    {ev.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isFull ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {isFull ? 'Sold Out' : `${availableSeats} Seats Left`}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{ev.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {ev.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{ev.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{ev.venue}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Organizer: <b className="text-slate-800 dark:text-slate-200">{ev.organizer}</b>
                </span>

                <button
                  onClick={() => handleRegisterEvent(ev._id, ev.title)}
                  disabled={isFull}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{isFull ? 'Seats Full' : 'Reserve Seat'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
