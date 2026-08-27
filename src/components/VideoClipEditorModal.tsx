'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Scissors,
  Download,
  Copy,
  Check,
  Sparkles,
  Layers,
  Type,
  Volume2,
  ShieldCheck,
  RefreshCw,
  Video,
  Sliders,
  Maximize2,
  Film,
  Zap,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';

interface VideoClipEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVideoUrl?: string;
  initialTitle?: string;
  initialHooks?: string[];
  initialHashtags?: string;
  initialCta?: string;
  initialDisclaimer?: string;
}

type SplitScreenMode = 'blur' | 'subway' | 'gta' | 'asmr' | 'minecraft';
type TextStylePreset = 'hormozi' | 'tiktok' | 'neon' | 'cyber';

export function VideoClipEditorModal({
  isOpen,
  onClose,
  initialVideoUrl,
  initialTitle,
  initialHooks = [],
  initialHashtags = '',
  initialCta = '',
  initialDisclaimer = '',
}: VideoClipEditorModalProps) {
  // Video playback & canvas state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  // Editing parameters
  const [topHookText, setTopHookText] = useState(
    initialHooks[0] || initialTitle || 'JANGAN PERNAH LAKUKAN INI! 😱'
  );
  const [bottomCtaText, setBottomCtaText] = useState(
    initialCta || 'PART 1 • CEK BIO UNTUK INFO LENGKAP 👆'
  );
  const [textStyle, setTextStyle] = useState<TextStylePreset>('hormozi');
  const [splitMode, setSplitMode] = useState<SplitScreenMode>('blur');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);

  // Anti-Copyright filters
  const [enableMirror, setEnableMirror] = useState(true);
  const [enableSpeedBoost, setEnableSpeedBoost] = useState(true);
  const [enableColorGrade, setEnableColorGrade] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Mobile Active Feature Tab: 'hook' | 'split' | 'protect' | 'preview'
  const [mobileTab, setMobileTab] = useState<'hook' | 'split' | 'protect' | 'preview'>('hook');
  const [showMiniPreview, setShowMiniPreview] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 sm:p-4 overflow-hidden">
      <div className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92dvh] max-w-5xl rounded-none sm:rounded-3xl border-0 sm:border border-rose-500/40 bg-slate-950 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 sm:px-6 py-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 shadow-md shrink-0">
              <Scissors className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-bold text-white flex items-center gap-1.5 truncate">
                <span className="truncate">Viral Video Clipper Studio</span>
                <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-rose-300 shrink-0">
                  9:16 Shorts
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Auto 9:16 Crop, Split-Screen &amp; Anti-Copyright
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Hidden Source Video Element */}
        <video
          ref={videoRef}
          src={videoSrc}
          crossOrigin="anonymous"
          loop
          playsInline
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration || 30);
          }}
          className="hidden"
        />

        {/* ========================================================================= */}
        {/* MOBILE VIEW NAVIGATION TABS (Visible on screens < lg, STICKY TOP)         */}
        {/* ========================================================================= */}
        <div className="lg:hidden sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-2.5 py-1.5 shrink-0 shadow-lg">
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setMobileTab('hook')}
              className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
                mobileTab === 'hook'
                  ? 'bg-rose-600 text-white shadow-md ring-1 ring-rose-400/50'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Type className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">1. Hook</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('split')}
              className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
                mobileTab === 'split'
                  ? 'bg-cyan-600 text-white shadow-md ring-1 ring-cyan-400/50'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">2. Split</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('protect')}
              className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
                mobileTab === 'protect'
                  ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400/50'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">3. Proteksi</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
                mobileTab === 'preview'
                  ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-400/50'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">4. Preview</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCROLLABLE CONTENT BODY                                                   */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 lg:p-6 pb-36 sm:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
            {/* ==================== LEFT / PREVIEW SECTION ==================== */}
            <div
              className={`lg:col-span-5 flex flex-col items-center justify-center transition-all ${
                mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              {/* DESKTOP PREVIEW CARD OR MOBILE FULL PREVIEW (TAB 4) */}
              <div className="w-full flex flex-col items-center justify-center bg-slate-900/60 rounded-3xl p-3 sm:p-5 border border-slate-800/80 shadow-xl">
                <div
                  className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-black group max-h-[46vh] sm:max-h-[50vh] lg:max-h-[460px] aspect-[9/16] w-auto"
                  style={{ touchAction: 'pan-y' }}
                  onClick={togglePlay}
                >
                  <canvas
                    ref={canvasRef}
                    width={540}
                    height={960}
                    className="w-full h-full object-cover cursor-pointer"
                  />

                  {!isPlaying && (
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="absolute inset-0 m-auto flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-rose-600/85 text-white backdrop-blur-sm shadow-xl transition-transform hover:scale-110 active:scale-95"
                    >
                      <Play className="h-5 w-5 sm:h-7 sm:w-7 fill-white ml-0.5" />
                    </button>
                  )}

                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[8px] sm:text-[9px] font-bold text-emerald-400 backdrop-blur-sm border border-emerald-500/30">
                    <ShieldCheck className="h-3 w-3" />
                    <span>99.4% Aman</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="w-full max-w-[240px] sm:max-w-[270px] mt-2.5 flex items-center justify-between gap-2 px-1">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 py-1.5 px-3 text-xs font-bold text-white border border-slate-700 active:scale-95 transition-all"
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />}
                    <span>{isPlaying ? 'Pause' : 'Putar Video'}</span>
                  </button>

                  <span className="text-[11px] font-mono text-slate-400">
                    {Math.floor(currentTime)}s / {Math.floor(duration)}s
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current) videoRef.current.currentTime = 0;
                    }}
                    className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 p-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 active:scale-95 transition-all"
                    title="Reset"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ==================== RIGHT / CONTROLS SECTION ==================== */}
            <div
              className={`lg:col-span-7 space-y-3.5 ${
                mobileTab === 'preview' ? 'hidden lg:block' : 'block'
              }`}
            >
              {/* SLIM MOBILE AUDIO/PREVIEW BAR (TABS 1, 2, 3) */}
              <div className="lg:hidden flex items-center justify-between bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex items-center gap-1.5 font-bold text-rose-400 active:scale-95"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 fill-rose-400" />}
                  <span>{isPlaying ? 'Pause' : 'Test Play Video'}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({Math.floor(currentTime)}s/{Math.floor(duration)}s)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMobileTab('preview')}
                  className="text-[11px] text-cyan-300 font-semibold flex items-center gap-1 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-lg active:scale-95"
                >
                  <Eye className="h-3 w-3" />
                  <span>Lihat Video (9:16)</span>
                </button>
              </div>
              {/* SECTION 1: HOOK & TEKS (Visible always on Desktop, or when mobileTab === 'hook') */}
              <div
                className={`space-y-3.5 ${
                  mobileTab !== 'hook' ? 'hidden lg:block' : 'block'
                }`}
              >
                <div className="space-y-2.5 rounded-2xl border border-rose-500/30 bg-slate-900/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Type className="h-4 w-4 text-rose-400" />
                      <span>Judul Hook Atas (3-Detik Pertama):</span>
                    </label>
                    <span className="text-[10px] text-yellow-400 font-semibold">Tampil di Atas Video</span>
                  </div>
                  <input
                    type="text"
                    value={topHookText}
                    onChange={(e) => setTopHookText(e.target.value)}
                    placeholder="Contoh: JANGAN PERNAH LAKUKAN INI! 😱"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                  />

                  {/* Suggestion Chips */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-slate-400">Pilih Cepat Hook FYP:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        'JANGAN PERNAH LAKUKAN INI! 😱',
                        '99% ORANG BELUM TAHU INI! 🤯',
                        'RAHASIA TERBONGKAR! 🚨',
                        'TONTON SEBELUM DIHAPUS! 🔥',
                      ].map((hk, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setTopHookText(hk)}
                          className="text-left text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-700 active:scale-95 transition-all truncate"
                        >
                          {hk}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Color Presets */}
                <div className="space-y-2 rounded-2xl border border-slate-800/90 bg-slate-900/80 p-4 shadow-sm">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span>Pilih Gaya &amp; Warna Banner:</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'hormozi', name: '👑 Hormozi Bold', color: 'bg-yellow-400 text-black' },
                      { id: 'tiktok', name: '🔥 TikTok Red', color: 'bg-rose-600 text-white' },
                      { id: 'neon', name: '⚡ Neon Cyan', color: 'bg-cyan-500 text-white' },
                      { id: 'cyber', name: '🌱 Emerald Pop', color: 'bg-emerald-500 text-white' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setTextStyle(st.id as TextStylePreset)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          textStyle === st.id
                            ? 'border-rose-500 bg-rose-500/20 text-white shadow-md ring-1 ring-rose-500/50'
                            : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className={`text-[9px] px-1.5 py-0.5 rounded font-black inline-block mb-1.5 ${st.color}`}>
                          WARNA
                        </div>
                        <div className="text-xs font-bold text-white truncate">{st.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 2: SPLIT SCREEN (Visible always on Desktop, or when mobileTab === 'split') */}
              <div
                className={`space-y-3.5 ${
                  mobileTab !== 'split' ? 'hidden lg:block' : 'block'
                }`}
              >
                <div className="space-y-2.5 rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-cyan-400" />
                      <span>Format Background Split Screen:</span>
                    </label>
                    <span className="text-[10px] text-cyan-400 font-semibold">Tingkatkan Retensi</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pilih background video looping di bagian bawah untuk menahan audiens agar tidak skip.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {[
                      { id: 'blur', label: '🌫️ Blur Reflection (Clean & Pro)', desc: 'Kaca blur estetik tanpa gameplay' },
                      { id: 'subway', label: '🎮 Subway Surfers 60FPS', desc: 'Gameplay viral paling tinggi retensi' },
                      { id: 'gta', label: '🏎️ GTA V Mega Ramp 4K', desc: 'Aksi mobil ramp ekstrem 4K' },
                      { id: 'asmr', label: '🧼 ASMR Soap Cutting', desc: 'Potong sabun memuaskan rileks' },
                    ].map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => setSplitMode(sp.id as SplitScreenMode)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          splitMode === sp.id
                            ? 'border-cyan-400 bg-cyan-950/60 text-white shadow-md ring-1 ring-cyan-400/50'
                            : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{sp.label}</div>
                        <div className="text-[10px] text-cyan-300/80 mt-0.5">{sp.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3: PROTEKSI & CTA (Visible always on Desktop, or when mobileTab === 'protect') */}
              <div
                className={`space-y-3.5 ${
                  mobileTab !== 'protect' ? 'hidden lg:block' : 'block'
                }`}
              >
                {/* Anti Copyright Settings */}
                <div className="space-y-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>Proteksi Anti-Copyright Monetisasi</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Content ID Safe</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center justify-between rounded-xl bg-slate-900/90 p-3 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <div>
                        <div className="text-xs font-bold text-white">Mirror Frame Horizontal</div>
                        <div className="text-[10px] text-slate-400">Membalik orientasi frame video kiri-kanan</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableMirror}
                        onChange={(e) => setEnableMirror(e.target.checked)}
                        className="accent-emerald-500 rounded h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-xl bg-slate-900/90 p-3 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <div>
                        <div className="text-xs font-bold text-white">Color Grade &amp; Saturasi HD</div>
                        <div className="text-[10px] text-slate-400">Menaikkan kontras &amp; saturasi agar jernih</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableColorGrade}
                        onChange={(e) => setEnableColorGrade(e.target.checked)}
                        className="accent-emerald-500 rounded h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-xl bg-slate-900/90 p-3 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <div>
                        <div className="text-xs font-bold text-white">Subtitle Glowing Animasi</div>
                        <div className="text-[10px] text-slate-400">Subtitle pulsing warna kuning di tengah video</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={showCaptions}
                        onChange={(e) => setShowCaptions(e.target.checked)}
                        className="accent-emerald-500 rounded h-4 w-4"
                      />
                    </label>
                  </div>
                </div>

                {/* Bottom CTA Banner */}
                <div className="space-y-2 rounded-2xl border border-amber-500/30 bg-slate-900/80 p-4 shadow-sm">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span>Banner Bawah (CTA Affiliate / Link Bio):</span>
                  </label>
                  <input
                    type="text"
                    value={bottomCtaText}
                    onChange={(e) => setBottomCtaText(e.target.value)}
                    placeholder="PART 1 • CEK BIO UNTUK INFO LENGKAP 👆"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    Banner permanen di bagian dasar video dengan garis emas untuk mengarahkan penonton ke keranjang kuning / link bio profil.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STICKY BOTTOM ACTION FOOTER (Always Visible & Tap-Friendly)               */}
        {/* ========================================================================= */}
        <div className="border-t border-slate-800 bg-slate-950/98 p-3.5 sm:p-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] shrink-0 shadow-2xl backdrop-blur-lg">
          <button
            type="button"
            onClick={handleExportVideo}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-xl hover:from-rose-500 hover:to-amber-500 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Merender Video Siap Upload ({exportProgress}%)...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>📥 Render &amp; Unduh Video Hasil Edit (1080x1920 MP4)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
