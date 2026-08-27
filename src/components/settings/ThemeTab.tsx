'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Check, Info } from 'lucide-react';
import { THEME_OPTIONS, AppTheme, applyTheme, getInitialTheme } from '@/lib/theme';

export function ThemeTab() {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('midnight');

  useEffect(() => {
    setCurrentTheme(getInitialTheme());
  }, []);

  const handleSelectTheme = (theme: AppTheme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-indigo-400" />
          <h4 className="text-sm font-bold text-white">Personalisasi Tema &amp; Kenyamanan Layar</h4>
        </div>
        <p className="text-xs text-slate-400">
          Pilih dari 4 tema pilihan yang dirancang secara khusus untuk mengurangi kelelahan mata (*zero eyestrain*).
        </p>
      </div>

      {/* Grid Theme Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {theme.description}
              </p>

              {/* Color Swatches Palette Bar */}
              <div className="flex items-center gap-1.5 w-full pt-2.5 border-t border-slate-800/80">
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

                <span className="ml-auto text-[10px] font-semibold text-slate-300">
                  {theme.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recommendations Box */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-4 text-xs text-indigo-300">
        <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px] text-slate-300">
          💡 <b>Kenyamanan Visual:</b> Pilihan tema tersimpan secara otomatis di browser Anda. Tema <b>Nord Frost</b> dan <b>Forest Matcha</b> memiliki intensitas kontras terendah untuk pencegahan mata cepat lelah saat sesi kerja panjang.
        </p>
      </div>
    </div>
  );
}
