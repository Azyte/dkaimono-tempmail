'use client';

import React, { useState, useEffect } from 'react';
import { X, Palette, Check, Sparkles, Moon, Sun, Eye, Info } from 'lucide-react';
import { THEME_OPTIONS, AppTheme, applyTheme, getInitialTheme } from '@/lib/theme';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('tokyonight');

  useEffect(() => {
    setCurrentTheme(getInitialTheme());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectTheme = (theme: AppTheme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl flex flex-col">
        {/* Glow Ambient */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-bold shadow-md shadow-indigo-500/20">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ganti Tema Tampilan</h3>
              <p className="text-xs text-slate-400">Pilih tema yang paling nyaman dan empuk di mata.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body: Theme Cards */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = currentTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-slate-850 shadow-lg ring-2 ring-indigo-500/40'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60 active:scale-[0.98]'
                  }`}
                  style={{
                    backgroundColor: isSelected ? theme.cardHex : undefined,
                  }}
                >
                  {/* Top Bar: Icon + Checkmark */}
                  <div className="flex items-center justify-between w-full mb-2.5">
                    <span className="text-2xl">{theme.icon}</span>
                    {isSelected ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-bold shadow-sm">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-slate-700"></span>
                    )}
                  </div>

                  {/* Theme Info */}
                  <h4 className="text-sm font-bold text-white mb-0.5">{theme.name}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {theme.description}
                  </p>

                  {/* Color Swatches Palette Bar */}
                  <div className="flex items-center gap-1.5 w-full pt-2 border-t border-slate-800/80">
                    <div
                      className="h-4 w-4 rounded-full shadow-inner border border-white/10"
                      style={{ backgroundColor: theme.bgHex }}
                      title="Background"
                    ></div>
                    <div
                      className="h-4 w-4 rounded-full shadow-inner border border-white/10"
                      style={{ backgroundColor: theme.cardHex }}
                      title="Surface"
                    ></div>
                    <div
                      className="h-4 w-4 rounded-full shadow-inner border border-white/10"
                      style={{ backgroundColor: theme.accentHex }}
                      title="Aksen Utama"
                    ></div>
                    <div
                      className="h-4 w-4 rounded-full shadow-inner border border-white/10"
                      style={{ backgroundColor: theme.accentSecondaryHex }}
                      title="Aksen Sekunder"
                    ></div>

                    <span className="ml-auto text-[9px] font-semibold text-slate-400">
                      {theme.badge.split(' ')[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Eye-Comfort Notice */}
          <div className="flex items-start gap-2.5 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 text-xs text-indigo-300">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] text-slate-300">
              💡 <b>Tips Kenyamanan Mata:</b> Tema <b>Nord Frost</b> &amp; <b>Catppuccin</b> sangat direkomendasikan untuk penggunaan malam hari karena menggunakan rasio kontras lembut yang meminimalisir kelelahan mata.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800/80 p-4 bg-slate-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-cyan-500 active:scale-95 transition-all"
          >
            <span>Terapkan &amp; Tutup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
