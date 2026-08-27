'use client';

import React, { useState, useEffect } from 'react';
import { X, Palette, Check, Sparkles } from 'lucide-react';
import { THEME_OPTIONS, AppTheme, applyTheme, getInitialTheme } from '@/lib/theme';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('midnight');

  useEffect(() => {
    setCurrentTheme(getInitialTheme());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectTheme = (theme: AppTheme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
        {/* Glow Ambient */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 text-white font-bold shadow-md shadow-indigo-500/20">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ganti Tema Tampilan</h3>
              <p className="text-xs text-slate-400">Pilih tema yang paling nyaman, estetik, dan empuk di mata.</p>
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
                      ? 'border-cyan-500 bg-slate-900 shadow-xl ring-2 ring-cyan-500/40'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900 active:scale-[0.98]'
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
                  <span className="text-[10px] text-cyan-400 font-semibold mb-1 block">{theme.badge}</span>
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
                      title="Surface Card"
                    ></div>
                    <div
                      className="h-4 w-4 rounded-full shadow-inner border border-white/10"
                      style={{ backgroundColor: theme.accentHex }}
                      title="Accent Primary"
                    ></div>
                    <div
                      className="h-4 w-4 rounded-full shadow-inner border border-white/10"
                      style={{ backgroundColor: theme.accentSecondaryHex }}
                      title="Accent Secondary"
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
