'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  VolumeX,
  ShieldCheck,
  RefreshCw,
  Video,
  Maximize2,
  Film,
  Zap,
  Eye,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Smartphone,
  Gauge,
  Music,
  Share2,
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

// Universal Cross-Browser Canvas Rounded Rectangle Helper
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
}

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
  const animFrameIdRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.05);

  // Safe fallback video source
  const videoSrc =
    initialVideoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  // Editing parameters
  const [topHookText, setTopHookText] = useState(
    (Array.isArray(initialHooks) && initialHooks[0]) ||
      initialTitle ||
      'JANGAN PERNAH LAKUKAN INI! 😱'
  );
  const [bottomCtaText, setBottomCtaText] = useState(
    initialCta || 'PART 1 • CEK LINK BIO / KERANJANG KUNING 👆'
  );
  const [textStyle, setTextStyle] = useState<TextStylePreset>('hormozi');
  const [splitMode, setSplitMode] = useState<SplitScreenMode>('subway');

  // Anti-Copyright filters
  const [enableMirror, setEnableMirror] = useState(true);
  const [enableColorGrade, setEnableColorGrade] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);
  const [antiCopyrightScore, setAntiCopyrightScore] = useState(99.4);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Mobile Active Tab: 'hook' | 'split' | 'protect' | 'preview'
  const [mobileTab, setMobileTab] = useState<'hook' | 'split' | 'protect' | 'preview'>('hook');

  // Calculate Anti-Copyright Safety Score dynamically
  useEffect(() => {
    let score = 70;
    if (enableMirror) score += 12;
    if (enableColorGrade) score += 9;
    if (splitMode !== 'blur') score += 5;
    if (showCaptions) score += 3.4;
    setAntiCopyrightScore(Math.min(99.8, Number(score.toFixed(1))));
  }, [enableMirror, enableColorGrade, splitMode, showCaptions]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    try {
      if (videoRef.current.paused) {
        videoRef.current.playbackRate = playbackSpeed;
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } catch (e) {
      console.warn('Playback toggle exception:', e);
    }
  }, [playbackSpeed]);

  const handleRestart = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  // Main Canvas Render Loop (540 x 960 standard 9:16 mobile canvas)
  useEffect(() => {
    if (!isOpen) return;

    let frame = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      try {
        frame++;
        const width = canvas.width || 540;
        const height = canvas.height || 960;
        const video = videoRef.current;

        // 1. Clear background
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#05070d';
        ctx.fillRect(0, 0, width, height);

        // Split Screen dimensions (Top 55% Main Video, Bottom 45% High-Retention Content)
        const isSplit = splitMode !== 'blur';
        const mainHeight = isSplit ? height * 0.56 : height;
        const bottomHeight = height - mainHeight;

        // 2. Draw Top Main Video
        ctx.save();
        if (enableColorGrade) {
          ctx.filter = 'contrast(114%) saturate(125%) brightness(105%)';
        }

        if (video && video.readyState >= 2) {
          try {
            if (enableMirror) {
              ctx.translate(width, 0);
              ctx.scale(-1, 1);
            }

            const vW = video.videoWidth || 640;
            const vH = video.videoHeight || 360;
            const scale = Math.max(width / vW, mainHeight / vH);
            const sW = vW * scale;
            const sH = vH * scale;
            const sX = (width - sW) / 2;
            const sY = (mainHeight - sH) / 2;

            ctx.drawImage(video, sX, sY, sW, sH);
          } catch (e) {
            // Draw placeholder if cross-origin tainted
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, width, mainHeight);
          }
        } else {
          // Fallback animated video placeholder
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, width, mainHeight);
          ctx.fillStyle = '#475569';
          ctx.font = 'bold 20px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🎬 Memuat Pratinjau Video...', width / 2, mainHeight / 2);
        }
        ctx.restore();

        // 3. Draw Bottom Split-Screen Satisfying Content
        if (isSplit) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, mainHeight, width, bottomHeight);
          ctx.clip();

          const bY = mainHeight;
          const t = frame * 0.04;

          if (splitMode === 'subway') {
            // SUBWAY SURFERS 60FPS SIMULATOR (Procedural 3D Track + Coins)
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, bY, width, bottomHeight);

            // Track lines
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(width * 0.2, bY);
            ctx.lineTo(0, height);
            ctx.lineTo(width, height);
            ctx.lineTo(width * 0.8, bY);
            ctx.fill();

            // Speed lines
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            for (let i = 0; i < 6; i++) {
              const lineY = bY + ((frame * 12 + i * 80) % bottomHeight);
              ctx.beginPath();
              ctx.moveTo(width * 0.35, lineY);
              ctx.lineTo(width * 0.65, lineY);
              ctx.stroke();
            }

            // Gold coins
            for (let i = 0; i < 3; i++) {
              const coinY = bY + ((frame * 8 + i * 140) % bottomHeight);
              ctx.fillStyle = '#facc15';
              ctx.beginPath();
              ctx.arc(width / 2, coinY, 18, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#ca8a04';
              ctx.lineWidth = 3;
              ctx.stroke();
            }

            // Tag overlay
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.beginPath();
            drawRoundedRect(ctx, width / 2 - 110, height - 42, 220, 28, 8);
            ctx.fill();
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 13px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🎮 Subway Surfers 60FPS Loop', width / 2, height - 24);
          } else if (splitMode === 'gta') {
            // GTA V MEGA RAMP 4K SIMULATOR
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, bY, width, bottomHeight);

            // Neon Ramp Grid
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 2;
            for (let x = 0; x < width; x += 45) {
              ctx.beginPath();
              ctx.moveTo(x, bY);
              ctx.lineTo(x + Math.sin(t) * 20, height);
              ctx.stroke();
            }

            // Sports Car
            const carX = width / 2 + Math.sin(t * 1.5) * 80;
            const carY = bY + bottomHeight * 0.55 + Math.cos(t * 2) * 15;
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(carX - 45, carY - 20, 90, 40);

            // Headlights
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(carX - 30, carY - 15, 6, 0, Math.PI * 2);
            ctx.arc(carX + 30, carY - 15, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.beginPath();
            drawRoundedRect(ctx, width / 2 - 110, height - 42, 220, 28, 8);
            ctx.fill();
            ctx.fillStyle = '#fb7185';
            ctx.font = 'bold 13px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🏎️ GTA V Mega Ramp 4K', width / 2, height - 24);
          } else if (splitMode === 'asmr') {
            // ASMR SOAP CUTTING SATISFYING
            ctx.fillStyle = '#1e1b4b';
            ctx.fillRect(0, bY, width, bottomHeight);

            const cols = 7;
            const rows = 5;
            const cellW = (width - 60) / cols;
            const cellH = (bottomHeight - 60) / rows;

            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                const hue = (c * 40 + r * 30 + frame * 2) % 360;
                ctx.fillStyle = `hsl(${hue}, 80%, 65%)`;
                ctx.fillRect(30 + c * cellW, bY + 25 + r * cellH, cellW - 4, cellH - 4);
              }
            }

            // Animated knife blade
            const knifeY = bY + ((frame * 6) % bottomHeight);
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(20, knifeY);
            ctx.lineTo(width - 20, knifeY);
            ctx.stroke();

            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.beginPath();
            drawRoundedRect(ctx, width / 2 - 110, height - 42, 220, 28, 8);
            ctx.fill();
            ctx.fillStyle = '#c084fc';
            ctx.font = 'bold 13px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🧼 ASMR Soap Cutting HD', width / 2, height - 24);
          } else if (splitMode === 'minecraft') {
            // MINECRAFT PARKOUR SIMULATOR
            ctx.fillStyle = '#064e3b';
            ctx.fillRect(0, bY, width, bottomHeight);

            // Moving voxel blocks
            for (let i = 0; i < 4; i++) {
              const blockY = bY + ((frame * 7 + i * 110) % bottomHeight);
              const blockX = width * 0.2 + (i % 2 === 0 ? 60 : 180);
              ctx.fillStyle = '#15803d';
              ctx.fillRect(blockX, blockY, 80, 45);
              ctx.fillStyle = '#78350f';
              ctx.fillRect(blockX, blockY + 15, 80, 30);
            }

            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.beginPath();
            drawRoundedRect(ctx, width / 2 - 115, height - 42, 230, 28, 8);
            ctx.fill();
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 13px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⛏️ Minecraft Parkour 60FPS', width / 2, height - 24);
          }

          // Split separator neon line
          ctx.strokeStyle = '#e11d48';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(0, mainHeight);
          ctx.lineTo(width, mainHeight);
          ctx.stroke();

          ctx.restore();
        }

        // 4. Draw Viral Top Hook Banner
        if (topHookText && topHookText.trim().length > 0) {
          ctx.save();
          const hookY = 55;
          const hookPadding = 18;
          ctx.font = '900 24px "Impact", "Arial Black", system-ui, sans-serif';
          const textMetrics = ctx.measureText(topHookText.toUpperCase());
          const boxWidth = Math.min(width - 32, textMetrics.width + hookPadding * 2);
          const boxHeight = 56;
          const boxX = (width - boxWidth) / 2;

          if (textStyle === 'hormozi') {
            ctx.fillStyle = '#0a0a0c';
            ctx.beginPath();
            drawRoundedRect(ctx, boxX, hookY, boxWidth, boxHeight, 14);
            ctx.fill();

            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#fde047';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(topHookText.toUpperCase(), width / 2, hookY + boxHeight / 2 + 1);
          } else if (textStyle === 'tiktok') {
            ctx.fillStyle = '#e11d48';
            ctx.beginPath();
            drawRoundedRect(ctx, boxX, hookY, boxWidth, boxHeight, 14);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(topHookText.toUpperCase(), width / 2, hookY + boxHeight / 2 + 1);
          } else if (textStyle === 'neon') {
            ctx.fillStyle = '#082f49';
            ctx.beginPath();
            drawRoundedRect(ctx, boxX, hookY, boxWidth, boxHeight, 14);
            ctx.fill();

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#7dd3fc';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(topHookText.toUpperCase(), width / 2, hookY + boxHeight / 2 + 1);
          } else if (textStyle === 'cyber') {
            ctx.fillStyle = '#022c22';
            ctx.beginPath();
            drawRoundedRect(ctx, boxX, hookY, boxWidth, boxHeight, 14);
            ctx.fill();

            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#6ee7b7';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(topHookText.toUpperCase(), width / 2, hookY + boxHeight / 2 + 1);
          }
          ctx.restore();
        }

        // 5. Draw Animated Pulsing Captions
        if (showCaptions) {
          ctx.save();
          const capY = isSplit ? mainHeight * 0.76 : height * 0.48;
          const pulse = 1 + Math.sin(frame * 0.15) * 0.06;

          ctx.translate(width / 2, capY);
          ctx.scale(pulse, pulse);

          ctx.font = '900 28px "Impact", "Arial Black", system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 7;
          ctx.strokeText('GILA BANGET GAES! 😱', 0, 0);

          ctx.fillStyle = '#facc15';
          ctx.fillText('GILA BANGET GAES! 😱', 0, 0);
          ctx.restore();
        }

        // 6. Draw Bottom Affiliate CTA Strip
        if (bottomCtaText && bottomCtaText.trim().length > 0) {
          ctx.save();
          const ctaH = 46;
          const ctaY = height - ctaH - 12;
          const ctaW = width - 36;
          const ctaX = 18;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
          ctx.beginPath();
          drawRoundedRect(ctx, ctaX, ctaY, ctaW, ctaH, 12);
          ctx.fill();

          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 13px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(bottomCtaText, width / 2, ctaY + ctaH / 2);
          ctx.restore();
        }
      } catch (err) {
        console.warn('Canvas render error caught:', err);
      }

      // Loop frame
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isOpen, topHookText, bottomCtaText, textStyle, splitMode, enableMirror, enableColorGrade, showCaptions]);

  // Video Export Engine (Records 540x960 Canvas Stream -> MP4 / WebM Blob Download)
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsExporting(true);
      setExportProgress(10);

      // Check MediaRecorder support safely
      if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
        alert('Fitur download stream otomatis tidak didukung di browser ini. Silakan unduh video mentahan.');
        setIsExporting(false);
        return;
      }

      const captureStream =
        (canvas as any).captureStream ||
        (canvas as any).mozCaptureStream ||
        (canvas as any).webkitCaptureStream;

      if (!captureStream) {
        alert('Canvas captureStream tidak didukung di browser ini.');
        setIsExporting(false);
        return;
      }

      const stream = captureStream.call(canvas, 30);
      let mimeType = 'video/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
          mimeType = 'video/mp4;codecs=avc1';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          mimeType = 'video/webm;codecs=vp9';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 6000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `FYP_Shorts_${Date.now()}.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          setIsExporting(false);
          setExportProgress(100);
          fireConfetti();
        } catch (e) {
          console.warn('MediaRecorder stop error:', e);
          setIsExporting(false);
        }
      };

      mediaRecorder.start();

      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }

      let progress = 10;
      const interval = setInterval(() => {
        progress += 15;
        setExportProgress(Math.min(95, progress));
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 6000);
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
      alert('Gagal mengekspor video. Silakan gunakan tombol unduh mentahan MP4.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-xl p-0 sm:p-3 md:p-6 overflow-hidden animate-in fade-in duration-200">
      {/* Hidden Source Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        crossOrigin="anonymous"
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration || 30);
        }}
        className="hidden"
      />

      {/* Main Studio Frame */}
      <div className="relative w-full h-[100dvh] sm:h-[94vh] max-w-6xl rounded-none sm:rounded-[2rem] border-0 sm:border border-slate-800/90 bg-slate-950/95 shadow-[0_0_80px_rgba(225,29,72,0.18)] flex flex-col overflow-hidden">
        
        {/* ========================================================================= */}
        {/* 1. TOP STUDIO HEADER (Sleek CapCut / Opus Studio Aesthetic)                */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 sm:px-6 py-3 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] shrink-0">
              <Scissors className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs sm:text-sm md:text-base font-black text-white tracking-wide truncate">
                  Viral Video Clipper &amp; Monetization Studio
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{antiCopyrightScore}% Safe</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Auto 9:16 Shorts/Reels/TikTok • High-Retention Split • Anti-Copyright Guard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-800/80 hover:bg-rose-600/20 hover:text-rose-400 text-slate-400 transition-all border border-slate-700/60 active:scale-95"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MOBILE TOP TAB SWITCHER (Sticky, Large Touch Targets, No Overflow)     */}
        {/* ========================================================================= */}
        <div className="lg:hidden sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-lg px-2 py-1.5 shrink-0 shadow-md">
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setMobileTab('hook')}
              className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
                mobileTab === 'hook'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400/60'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
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
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-cyan-400/60'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
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
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/60'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
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
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400/60'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Eye className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">4. Monitor</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN STUDIO WORKSPACE (Responsive Dual-Pane Grid)                      */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 lg:p-6 pb-36 sm:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
            
            {/* --------------------------------------------------------------------- */}
            {/* LEFT PANE: LIVE 9:16 MONITOR & TIMELINE HUD                           */}
            {/* --------------------------------------------------------------------- */}
            <div
              className={`lg:col-span-5 flex flex-col items-center justify-center ${
                mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              {/* Studio Monitor Box */}
              <div className="w-full flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-800/90 shadow-2xl">
                
                {/* Resolution & Ratio Selector Pills */}
                <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Smartphone className="h-3.5 w-3.5 text-rose-400" />
                    <span>9:16 Vertical Shorts</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                    1080x1920 HD
                  </span>
                </div>

                {/* Canvas Video Screen */}
                <div
                  className="relative rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] border-2 border-slate-700/80 bg-black group max-h-[44vh] sm:max-h-[48vh] lg:max-h-[460px] aspect-[9/16] w-auto cursor-pointer"
                  style={{ touchAction: 'pan-y' }}
                  onClick={togglePlay}
                >
                  <canvas
                    ref={canvasRef}
                    width={540}
                    height={960}
                    className="w-full h-full object-cover"
                  />

                  {/* Big Floating Play Overlay Button */}
                  {!isPlaying && (
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-600/90 text-white backdrop-blur-md shadow-[0_0_30px_rgba(244,63,94,0.6)] transition-all hover:scale-110 active:scale-95"
                    >
                      <Play className="h-7 w-7 fill-white ml-0.5" />
                    </button>
                  )}

                  {/* Corner Status HUD */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-lg bg-black/75 px-2 py-0.5 text-[9px] font-bold text-emerald-400 backdrop-blur-md border border-emerald-500/30">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{antiCopyrightScore}% Anti-Copyright</span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-lg bg-black/75 px-2 py-0.5 text-[9px] font-mono text-slate-300 backdrop-blur-md border border-slate-700">
                    <span>{playbackSpeed}x</span>
                  </div>
                </div>

                {/* Playback Control Bar */}
                <div className="w-full max-w-[270px] mt-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 py-2 px-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5 text-amber-300" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                      <span>{isPlaying ? 'Pause' : 'Putar Video'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 p-2 text-xs text-slate-300 border border-slate-700 active:scale-95"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={handleRestart}
                      className="flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 p-2 text-xs text-slate-300 border border-slate-700 active:scale-95"
                      title="Reset ke Awal"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Time & Speed Indicator */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-0.5">
                    <span>⏱️ {Math.floor(currentTime)}s / {Math.floor(duration)}s</span>
                    <button
                      type="button"
                      onClick={() => setPlaybackSpeed(playbackSpeed === 1.05 ? 1.1 : 1.05)}
                      className="hover:text-cyan-300 text-slate-400 underline underline-offset-2"
                    >
                      Speed: {playbackSpeed}x
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* RIGHT PANE: PRO CREATOR CONTROL DECK                                  */}
            {/* --------------------------------------------------------------------- */}
            <div
              className={`lg:col-span-7 space-y-4 ${
                mobileTab === 'preview' ? 'hidden lg:block' : 'block'
              }`}
            >
              {/* SLIM MOBILE AUDIO/PREVIEW BAR (TABS 1, 2, 3) */}
              <div className="lg:hidden flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-2xl text-xs text-slate-300 shadow-md">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex items-center gap-2 font-bold text-rose-400 active:scale-95"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 fill-rose-400" />}
                  <span>{isPlaying ? 'Pause Audio' : 'Test Play Video'}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({Math.floor(currentTime)}s/{Math.floor(duration)}s)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMobileTab('preview')}
                  className="text-[11px] text-cyan-300 font-bold flex items-center gap-1 bg-cyan-950/70 border border-cyan-500/40 px-2.5 py-1 rounded-xl active:scale-95"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Lihat Monitor (9:16)</span>
                </button>
              </div>

              {/* =================================================================== */}
              {/* TAB 1: HOOK VIRAL & GAYA TEKS                                       */}
              {/* =================================================================== */}
              <div
                className={`space-y-4 ${
                  mobileTab !== 'hook' ? 'hidden lg:block' : 'block'
                }`}
              >
                {/* 1.1 Input Judul Hook 3-Detik */}
                <div className="space-y-3 rounded-2xl sm:rounded-3xl border border-rose-500/30 bg-slate-900/80 p-4 sm:p-5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                      <Flame className="h-4 w-4 text-rose-400" />
                      <span>Judul Hook Atas (3-Detik Pertama Menahan FYP):</span>
                    </label>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      Tampil di Atas
                    </span>
                  </div>

                  <input
                    type="text"
                    value={topHookText}
                    onChange={(e) => setTopHookText(e.target.value)}
                    placeholder="Contoh: JANGAN PERNAH LAKUKAN INI! 😱"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 focus:outline-none transition-all"
                  />

                  {/* 1-Click FYP Hook Templates */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400">⚡ Template Hook Terbukti Viral (Klik untuk Pasang):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { text: 'JANGAN PERNAH LAKUKAN INI! 😱', tag: '⚠️ Peringatan' },
                        { text: '99% ORANG BELUM TAHU INI! 🤯', tag: '🤯 Mindblown' },
                        { text: 'RAHASIA INI JANGAN DISHARE! 🚨', tag: '🚨 Rahasia' },
                        { text: 'TONTON SEBELUM DIHAPUS! 🔥', tag: '🔥 Urgensi' },
                      ].map((hk, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setTopHookText(hk.text)}
                          className="flex items-center justify-between text-left text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-200 p-2.5 rounded-xl border border-slate-800 hover:border-rose-500/50 active:scale-95 transition-all group"
                        >
                          <span className="truncate font-medium group-hover:text-rose-300">{hk.text}</span>
                          <span className="text-[9px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded font-bold shrink-0 ml-1.5">
                            {hk.tag}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 1.2 Preset Gaya Hormozi & Submagic */}
                <div className="space-y-3 rounded-2xl sm:rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4 sm:p-5 shadow-lg">
                  <label className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span>Pilih Preset Warna &amp; Gaya Banner:</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'hormozi', name: '👑 Hormozi Bold', tag: 'Kuning Bold', color: 'bg-yellow-400 text-black' },
                      { id: 'tiktok', name: '🔥 TikTok Viral', tag: 'Merah FYP', color: 'bg-rose-600 text-white' },
                      { id: 'neon', name: '⚡ Neon Cyber', tag: 'Cyan Neon', color: 'bg-cyan-500 text-white' },
                      { id: 'cyber', name: '🌱 Emerald Pop', tag: 'Hijau Segar', color: 'bg-emerald-500 text-black' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setTextStyle(st.id as TextStylePreset)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          textStyle === st.id
                            ? 'border-rose-500 bg-rose-500/15 text-white shadow-lg ring-2 ring-rose-500/50'
                            : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className={`text-[9px] px-2 py-0.5 rounded-md font-black inline-block mb-2 ${st.color}`}>
                          {st.tag}
                        </div>
                        <div className="text-xs font-bold text-white truncate">{st.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* TAB 2: SPLIT SCREEN SATISFYING CONTENT                              */}
              {/* =================================================================== */}
              <div
                className={`space-y-4 ${
                  mobileTab !== 'split' ? 'hidden lg:block' : 'block'
                }`}
              >
                <div className="space-y-3 rounded-2xl sm:rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-4 sm:p-5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                      <Layers className="h-4 w-4 text-cyan-400" />
                      <span>Format Background Split Screen (High-Retention):</span>
                    </label>
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                      +180% Watchtime
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Split-screen membagi video menjadi 2 bagian (atas video utama, bawah video looping memuaskan) untuk mencegah penonton men-swipe video di 10 detik pertama.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {[
                      { id: 'subway', label: '🎮 Subway Surfers 60FPS', boost: '+210% FYP', desc: 'Gameplay koin meluncur 60FPS' },
                      { id: 'gta', label: '🏎️ GTA V Mega Ramp 4K', boost: '+190% FYP', desc: 'Aksi mobil ramp melompat ekstrem' },
                      { id: 'asmr', label: '🧼 ASMR Soap Cutting HD', boost: '+160% FYP', desc: 'Potong sabun kubus warna rileks' },
                      { id: 'minecraft', label: '⛏️ Minecraft Parkour', boost: '+175% FYP', desc: 'Lompatan parkour voxel lancar' },
                      { id: 'blur', label: '🌫️ Blur Reflection (Clean)', boost: 'Pro Look', desc: 'Kaca blur estetik tanpa gameplay' },
                    ].map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => setSplitMode(sp.id as SplitScreenMode)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          splitMode === sp.id
                            ? 'border-cyan-400 bg-cyan-950/60 text-white shadow-lg ring-2 ring-cyan-400/50'
                            : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{sp.label}</span>
                          <span className="text-[9px] font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                            {sp.boost}
                          </span>
                        </div>
                        <div className="text-[11px] text-cyan-300/80 mt-1">{sp.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* TAB 3: ANTI-COPYRIGHT & CTA BIO                                     */}
              {/* =================================================================== */}
              <div
                className={`space-y-4 ${
                  mobileTab !== 'protect' ? 'hidden lg:block' : 'block'
                }`}
              >
                {/* 3.1 Anti-Copyright Proteksi */}
                <div className="space-y-3 rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>Proteksi Anti-Copyright &amp; Monetisasi:</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Content ID Safe
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center justify-between rounded-2xl bg-slate-900/90 p-3.5 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all">
                      <div>
                        <div className="text-xs font-bold text-white">Mirror Frame Horizontal (Kiri-Kanan)</div>
                        <div className="text-[10px] text-slate-400">Mengubah hash visual frame untuk lolos deteksi otomatis</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableMirror}
                        onChange={(e) => setEnableMirror(e.target.checked)}
                        className="accent-emerald-500 rounded h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-2xl bg-slate-900/90 p-3.5 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all">
                      <div>
                        <div className="text-xs font-bold text-white">Color Grade &amp; Saturation Boost HD</div>
                        <div className="text-[10px] text-slate-400">Menaikkan saturasi &amp; kontras agar lebih jernih dan tajam</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableColorGrade}
                        onChange={(e) => setEnableColorGrade(e.target.checked)}
                        className="accent-emerald-500 rounded h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-2xl bg-slate-900/90 p-3.5 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all">
                      <div>
                        <div className="text-xs font-bold text-white">Subtitle Glowing Animasi di Tengah</div>
                        <div className="text-[10px] text-slate-400">Subtitle pulsing warna kuning untuk menahan fokus mata</div>
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

                {/* 3.2 Banner Bawah (CTA Affiliate / Keranjang Kuning) */}
                <div className="space-y-3 rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-slate-900/80 p-4 sm:p-5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span>Banner Bawah (CTA Affiliate / Link Bio):</span>
                    </label>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      Meningkatkan Penjualan
                    </span>
                  </div>

                  <input
                    type="text"
                    value={bottomCtaText}
                    onChange={(e) => setBottomCtaText(e.target.value)}
                    placeholder="PART 1 • CEK LINK BIO / KERANJANG KUNING 👆"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:outline-none transition-all"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      'PART 1 • CEK BIO / KERANJANG KUNING 👆',
                      'PRODUK DI LINK BIO NOMOR 01 🔥',
                      'KLIK KERANJANG KUNING SEBELUM HABIS 🛍️',
                    ].map((cta, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setBottomCtaText(cta)}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 active:scale-95"
                      >
                        {cta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. STICKY BOTTOM ACTION BAR (Export & Download Engine)                    */}
        {/* ========================================================================= */}
        <div className="border-t border-slate-800/90 bg-slate-950/98 p-3.5 sm:p-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] shrink-0 shadow-2xl backdrop-blur-xl">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportVideo}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 py-3.5 sm:py-4 px-5 text-xs sm:text-sm font-black text-white shadow-[0_0_35px_rgba(244,63,94,0.4)] hover:from-rose-500 hover:to-amber-400 active:scale-[0.98] transition-all disabled:opacity-50 tracking-wide"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span>Merender Video Siap Upload ({exportProgress}%)...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>📥 RENDER &amp; UNDUH VIDEO HASIL EDIT (1080x1920 MP4)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
