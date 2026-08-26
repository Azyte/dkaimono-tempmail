'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Crown, Bot, Calendar, RefreshCw, Search, ShieldCheck, Mail, UserCheck } from 'lucide-react';

interface RegisteredUser {
  id: string;
  username: string;
  email: string;
  isPro: boolean;
  proPlan?: 'monthly' | 'yearly' | 'lifetime';
  proExpiresAt?: string | null;
  telegramEnabled?: boolean;
  hasTelegramBot?: boolean;
  savedMailboxes?: string[];
  createdAt: string;
}

export function UsersTab() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">Daftar Akun Terdaftar</h4>
            <p className="text-xs text-slate-400">Total Pengguna: <span className="font-bold text-cyan-300">{users.length} Akun</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari username / email..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
            title="Muat Ulang Data Akun"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-950/60 p-8 text-center min-h-[220px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800">
            <Users className="h-6 w-6 text-slate-500" />
          </div>
          <h4 className="mt-3 text-sm font-semibold text-slate-200">
            {search ? 'Tidak ada akun yang cocok' : 'Belum Ada Akun Terdaftar'}
          </h4>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            {search
              ? 'Silakan coba cari dengan username atau email yang lain.'
              : 'Akun yang didaftarkan melalui tombol [Masuk / Daftar] akan otomatis muncul di sini.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5 transition-all hover:border-slate-700"
            >
              {/* User Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-xs font-bold text-indigo-300">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm font-bold text-white truncate">@{user.username}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>

                {user.isPro ? (
                  <span className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 shrink-0">
                    <Crown className="h-3 w-3 fill-amber-400" />
                    <span>PRO ({user.proPlan?.toUpperCase() || 'LIFETIME'})</span>
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 shrink-0">
                    Gratis
                  </span>
                )}
              </div>

              {/* Badges Info */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  <span>Daftar: {new Date(user.createdAt).toLocaleDateString('id-ID')}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Bot className="h-3 w-3 text-sky-400" />
                  <span className={user.hasTelegramBot ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                    {user.hasTelegramBot ? 'Bot Telegram Terhubung' : 'Belum Ada Bot'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
