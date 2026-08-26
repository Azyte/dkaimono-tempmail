'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('PWA Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('PWA Service Worker registration failed:', err);
          });
      });
    }

    // 2. Check if already running in standalone PWA mode
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');

      if (isStandalone) {
        setIsInstalled(true);
        return;
      }

      // Detect iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIos(isIosDevice);

      // Check dismissal timestamp
      const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (lastDismissed) {
        const diffHours = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 3600);
        if (diffHours < 24) return; // Don't show again within 24 hours if dismissed
      }

      // 3. Listen for Android / Chrome install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Show prompt on iOS Safari if not dismissed
      if (isIosDevice && !lastDismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <>
      {/* Floating Cyber PWA Install Banner */}
      <aside
        aria-label="PWA Installation Prompt"
        className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/50 bg-slate-950/95 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl">
          {/* Neon Glow Accent */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md">
                <Smartphone className="h-6 w-6 text-white" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    Install Aplikasi TempMail
                  </h4>
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-bold text-indigo-300">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight line-clamp-1 mt-0.5">
                  Akses lebih cepat langsung dari layar utama HP Anda!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-indigo-600 active:scale-95 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Install</span>
              </button>

              <button
                onClick={handleDismiss}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Cara Install di iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 font-bold">
                  1
                </div>
                <div>
                  Tekan tombol <b>Share (Bagikan)</b> <Share className="inline h-3.5 w-3.5 text-sky-400" /> di bagian bawah layar Safari.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 font-bold">
                  2
                </div>
                <div>
                  Gulir ke bawah dan pilih <b>&quot;Add to Home Screen&quot; (Tambahkan ke Layar Utama)</b> <PlusSquare className="inline h-3.5 w-3.5 text-cyan-400" />.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 font-bold">
                  3
                </div>
                <div>
                  Klik <b>Add (Tambah)</b> di pojok kanan atas. Icon aplikasi TempMail akan langsung muncul di HP Anda!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-2.5 text-xs font-bold text-white shadow-md"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
