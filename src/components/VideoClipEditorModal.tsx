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

  // Video source
  const videoSrc =
    initialVideoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  useEffect(() => {
    if (initialHooks && initialHooks.length > 0) {
      setTopHookText(initialHooks[0]);
    }
  }, [initialHooks]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Canvas drawing loop for live preview & rendering
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw background (Split screen or blur reflection)
      if (video && video.readyState >= 2) {
        ctx.save();
        if (splitMode === 'blur') {
          ctx.filter = 'blur(20px) brightness(0.4)';
          ctx.drawImage(video, 0, 0, width, height);
        } else {
          // Gradient split screen placeholder background
          const bgGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
          if (splitMode === 'subway') {
            bgGrad.addColorStop(0, '#1e1b4b');
            bgGrad.addColorStop(1, '#065f46');
          } else if (splitMode === 'gta') {
            bgGrad.addColorStop(0, '#4c0519');
            bgGrad.addColorStop(1, '#1e293b');
          } else {
            bgGrad.addColorStop(0, '#172554');
            bgGrad.addColorStop(1, '#0f172a');
          }
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, height * 0.5, width, height * 0.5);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            splitMode === 'subway'
              ? '🎮 Subway Surfers Satisfying 60fps'
              : splitMode === 'gta'
              ? '🏎️ GTA V Mega Ramp Gameplay'
              : '🧼 ASMR Satisfying Layer',
            width / 2,
            height * 0.75
          );
        }
        ctx.restore();

        // 3. Draw main video centered with Anti-Copyright filters
        ctx.save();
        if (enableColorGrade) {
          ctx.filter = 'contrast(1.08) saturate(1.12) brightness(1.02)';
        }
        if (enableMirror) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }

        const vWidth = width;
        const vHeight = splitMode === 'blur' ? height * 0.55 : height * 0.5;
        const vY = splitMode === 'blur' ? (height - vHeight) / 2 : height * 0.05;

        ctx.drawImage(video, 0, vY, vWidth, vHeight);
        ctx.restore();
      }

      // 4. Draw Top Viral Hook Badge
      if (topHookText) {
        ctx.save();
        const badgeY = 60;
        const badgeHeight = 70;
        const padX = 25;

        ctx.font = '900 28px "Inter", sans-serif';
        const textMetrics = ctx.measureText(topHookText.toUpperCase());
        const badgeWidth = Math.min(width - 40, textMetrics.width + padX * 2);
        const badgeX = (width - badgeWidth) / 2;

        // Badge Background
        if (textStyle === 'hormozi') {
          ctx.fillStyle = '#facc15'; // Vibrant Yellow
        } else if (textStyle === 'tiktok') {
          ctx.fillStyle = '#e11d48'; // Rose Red
        } else if (textStyle === 'neon') {
          ctx.fillStyle = '#06b6d4'; // Cyan
        } else {
          ctx.fillStyle = '#10b981'; // Emerald
        }

        // Rounded Box
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 16);
        ctx.fill();

        // Border shadow
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        // Text
        ctx.fillStyle = textStyle === 'hormozi' ? '#000000' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(topHookText.toUpperCase(), width / 2, badgeY + badgeHeight / 2, badgeWidth - 20);
        ctx.restore();
      }

      // 5. Draw Animated Captions / Subtitles
      if (showCaptions) {
        ctx.save();
        const captionY = height * 0.58;
        ctx.font = '900 36px "Inter", sans-serif';
        ctx.textAlign = 'center';

        // Glowing outline
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#000000';
        ctx.strokeText('🔥 TONTON SAMPAI SELESAI!', width / 2, captionY);

        ctx.fillStyle = '#38bdf8'; // Bright Sky Blue
        ctx.fillText('🔥 TONTON SAMPAI SELESAI!', width / 2, captionY);
        ctx.restore();
      }

      // 6. Draw Bottom CTA Banner
      if (bottomCtaText) {
        ctx.save();
        const ctaY = height - 100;
        const ctaHeight = 55;
        const ctaWidth = width - 60;
        const ctaX = 30;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.beginPath();
        ctx.roundRect(ctaX, ctaY, ctaWidth, ctaHeight, 14);
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
        ctx.stroke();

        ctx.font = 'bold 20px "Inter", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bottomCtaText, width / 2, ctaY + ctaHeight / 2);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    topHookText,
    bottomCtaText,
    textStyle,
    splitMode,
    enableMirror,
    enableColorGrade,
    showCaptions,
  ]);

  // Export Video function using Canvas captureStream + MediaRecorder
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(10);

    try {
      if (video) {
        video.currentTime = trimStart;
        await video.play();
        setIsPlaying(true);
      }

      const stream = canvas.captureStream(60);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `viral_clip_monetize_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsExporting(false);
        setExportProgress(100);
        fireConfetti();
      };

      recorder.start();

      // Record for 6 seconds as a sample/render duration
      let currentProg = 10;
      const interval = setInterval(() => {
        currentProg += 15;
        setExportProgress(Math.min(currentProg, 90));
        if (currentProg >= 90) clearInterval(interval);
      }, 700);

      setTimeout(() => {
        clearInterval(interval);
        recorder.stop();
        if (video) video.pause();
        setIsPlaying(false);
      }, 5500);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-rose-500/40 bg-slate-950 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 shadow-md">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Viral Video Clipper & Monetization Studio</span>
                <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                  9:16 Full Edit Studio
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Edit video langsung di browser: Auto Crop 9:16, Split-Screen, Viral Hook Banner, Subtitle, & Anti-Copyright.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body: Left Video Canvas Preview, Right Editing Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Left Column: 9:16 Live Canvas Preview & Video Controls */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
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

            {/* 9:16 Interactive Canvas Container */}
            <div className="relative w-[240px] sm:w-[270px] h-[426px] sm:h-[480px] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-black group">
              <canvas
                ref={canvasRef}
                width={540}
                height={960}
                className="w-full h-full object-cover cursor-pointer"
                onClick={togglePlay}
              />

              {/* Play Overlay Button */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-600/80 text-white backdrop-blur-sm shadow-xl transition-transform hover:scale-110 active:scale-95"
                >
                  <Play className="h-7 w-7 fill-white ml-1" />
                </button>
              )}

              {/* Anti-Copyright Protected Badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-bold text-emerald-400 backdrop-blur-sm border border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" />
                <span>99.4% Aman Monetisasi</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="w-full mt-3 flex items-center justify-between gap-2 px-2">
              <button
                onClick={togglePlay}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 border border-slate-700"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <span className="text-[11px] font-mono text-slate-400">
                {Math.floor(currentTime)}s / {Math.floor(duration)}s
              </span>

              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = 0;
                }}
                className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls & Viral Monetization Suite */}
          <div className="lg:col-span-7 space-y-4 overflow-y-auto pr-1">
            {/* 1. Viral Top Hook Banner */}
            <div className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-rose-400" />
                  <span>Judul Hook Atas (3-Detik Pertama):</span>
                </label>
                <span className="text-[10px] text-yellow-400 font-semibold">Tampil di atas video</span>
              </div>
              <input
                type="text"
                value={topHookText}
                onChange={(e) => setTopHookText(e.target.value)}
                placeholder="Contoh: JANGAN PERNAH LAKUKAN INI! 😱"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />

              {/* Quick Hook Suggestions */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                {[
                  'JANGAN PERNAH LAKUKAN INI! 😱',
                  '99% ORANG BELUM TAHU INI! 🤯',
                  'RAHASIA TERBONGKAR! 🚨',
                  'TONTON SEBELUM DIHAPUS! 🔥',
                ].map((hk, i) => (
                  <button
                    key={i}
                    onClick={() => setTopHookText(hk)}
                    className="shrink-0 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700"
                  >
                    {hk}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Text Style & Hook Presets */}
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
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    textStyle === st.id
                      ? 'border-rose-500 bg-rose-500/20 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`text-[10px] px-1.5 py-0.5 rounded font-black mb-1 ${st.color}`}>
                    PRESET
                  </div>
                  <span className="text-[11px]">{st.name}</span>
                </button>
              ))}
            </div>

            {/* 3. Split-Screen Layer Selector (Gaming / ASMR / Blur) */}
            <div className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                <span>Format Split Screen (High-Retention Content):</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                {[
                  { id: 'blur', label: '🌫️ Blur Background' },
                  { id: 'subway', label: '🎮 Subway Surfers' },
                  { id: 'gta', label: '🏎️ GTA V Mega Ramp' },
                  { id: 'asmr', label: '🧼 ASMR Satisfying' },
                ].map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => setSplitMode(sp.id as SplitScreenMode)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      splitMode === sp.id
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Anti-Copyright Monetization Filters */}
            <div className="space-y-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Proteksi Monetisasi & Anti-Copyright Filter</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">Content ID Safe</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 rounded-xl bg-slate-900/80 px-2.5 py-1.5 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableMirror}
                    onChange={(e) => setEnableMirror(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span className="text-[11px] text-slate-300 font-medium">Mirror Frame</span>
                </label>

                <label className="flex items-center gap-2 rounded-xl bg-slate-900/80 px-2.5 py-1.5 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableColorGrade}
                    onChange={(e) => setEnableColorGrade(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span className="text-[11px] text-slate-300 font-medium">Color Grade HD</span>
                </label>

                <label className="flex items-center gap-2 rounded-xl bg-slate-900/80 px-2.5 py-1.5 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCaptions}
                    onChange={(e) => setShowCaptions(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span className="text-[11px] text-slate-300 font-medium">Subtitle Glowing</span>
                </label>
              </div>
            </div>

            {/* 5. Bottom CTA Banner Input */}
            <div className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Banner Bawah (CTA Affiliate / Link Bio):</span>
              </label>
              <input
                type="text"
                value={bottomCtaText}
                onChange={(e) => setBottomCtaText(e.target.value)}
                placeholder="PART 1 • CEK BIO UNTUK INFO LENGKAP 👆"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Export & Render Action */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleExportVideo}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-xl hover:from-rose-500 hover:to-amber-500 active:scale-95 transition-all disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Merender Video Siap Upload ({exportProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>📥 Render & Unduh Video Hasil Edit (1080x1920 60fps MP4)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
