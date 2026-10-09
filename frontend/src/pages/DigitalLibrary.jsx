import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertCircle,
  Tag,
  BookmarkPlus,
  Compass
} from 'lucide-react';

export const DigitalLibrary = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/library/books');
      if (res.data?.success) setBooks(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (bookId, title) => {
    try {
      const res = await api.post(`/library/books/${bookId}/reserve`);
      if (res.data?.success) {
        setActionMsg(res.data.message || `Book '${title}' reserved!`);
        fetchBooks();
        setTimeout(() => setActionMsg(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error reserving book');
    }
  };

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-cyan-500" />
          Engineering Digital Library & Textbook Catalog
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Search reference textbooks, check physical rack availability, and reserve copies online
        </p>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Search */}
      <div className="p-4 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center">
        <Search className="w-4 h-4 text-slate-400 mr-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, author, or category (e.g. Distributed Systems, Clean Code)..."
          className="w-full text-xs bg-transparent focus:outline-none text-slate-900 dark:text-white"
        />
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredBooks.map((b) => (
          <div key={b._id} className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 uppercase font-mono">
                {b.category}
              </span>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">{b.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">by {b.author}</p>

              <div className="mt-4 text-[11px] text-slate-500 space-y-1">
                <p>Location: <b className="text-slate-700 dark:text-slate-300">{b.rack}</b></p>
                <p>ISBN: <span className="font-mono">{b.isbn}</span></p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
              <span className={`text-xs font-bold ${b.copies_available > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {b.copies_available} / {b.total_copies} Avail
              </span>

              <button
                onClick={() => handleReserve(b._id, b.title)}
                disabled={b.copies_available <= 0}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1 transition-all disabled:opacity-50"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Reserve</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
