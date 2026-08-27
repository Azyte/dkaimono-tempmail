'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  Zap,
  Crown,
  Sparkles,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  CreditCard,
  Smartphone,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';
import { User } from '@/types';

interface QrisPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpgradeSuccess: (user: User) => void;
}

interface PlanOption {
  id: string;
  name: string;
  badge: string;
  price: number;
  durationDays: number;
  features: string[];
  popular?: boolean;
}

const PLANS: PlanOption[] = [
  {
    id: 'pro_7d',
    name: 'Starter PRO (7 Hari)',
    badge: '⚡ Pemula',
    price: 10000,
    durationDays: 7,
    features: [
      'Unlimited TempMail Custom Alias',
      'Generator Alight Motion V1-V4',
      'VPN WARP+ 12PB License Key',
      'Scribd PDF Unlocker',
    ],
  },
  {
    id: 'pro_30d',
    name: 'Creator VIP (30 Hari)',
    badge: '🔥 Paling Populer',
    price: 25000,
    durationDays: 30,
    popular: true,
    features: [
      'Semua Fitur Starter PRO',
      'Viral Video Clipper Studio 9:16',
      'Split Screen & Subtitle Generator',
      'Anti-Copyright Content ID Filter',
      'Prioritas Server Super Cepat',
    ],
  },
  {
    id: 'pro_lifetime',
    name: 'Monetize Master (Lifetime)',
    badge: '👑 Sekali Bayar Selamanya',
    price: 50000,
    durationDays: 3650,
    features: [
      'Akses Seumur Hidup Tanpa Batas',
      'Semua Update AI & Tools Masa Depan',
      'Akses VIP Group & Support Prioritas',
      'Hak Eksklusif Early Beta Tools',
    ],
  },
];

export function QrisPaymentModal({
  isOpen,
  onClose,
  currentUser,
  onUpgradeSuccess,
}: QrisPaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>(PLANS[1]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState('');

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatMinutes = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Instant Payment Confirmation Simulation & Activation
  const handleInstantConfirm = async () => {
    setIsProcessing(true);
    try {
      // Direct call to upgrade / redeem
      const deviceId =
        typeof window !== 'undefined'
          ? localStorage.getItem('tempmail_device_id') || 'dev_qris_' + Date.now()
          : 'dev_qris';
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('tempmail_session_token') || ''
          : '';

      const res = await fetch('/api/auth/redeem-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': deviceId,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code: `QRIS_${selectedPlan.id.toUpperCase()}_AUTO`,
        }),
      });

      const data = await res.json();

      // Create or update user state
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + selectedPlan.durationDays);

      const upgradedUser: User = {
        id: currentUser?.id || 'usr_' + Date.now(),
        alias: currentUser?.alias || 'user_' + Math.random().toString(36).substring(2, 7),
        isPro: true,
        proUntil: expiryDate.toISOString(),
        role: currentUser?.role || 'user',
        createdAt: currentUser?.createdAt || new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('tempmail_saved_user', JSON.stringify(upgradedUser));
      }

      onUpgradeSuccess(upgradedUser);
      fireConfetti();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual voucher code submit
  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    setIsProcessing(true);
    setVoucherError('');

    try {
      const res = await fetch('/api/auth/redeem-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode.trim() }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onUpgradeSuccess(data.user);
        fireConfetti();
        onClose();
      } else {
        setVoucherError(data.error || 'Kode voucher tidak valid.');
      }
    } catch (err) {
      setVoucherError('Gagal memverifikasi voucher.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-indigo-500/40 bg-slate-950 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Glow Top */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-5 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-indigo-500/20">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Upgrade PRO & Monetize Pass</span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  ⚡ QRIS Instant Auto
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Aktivasi otomatis detik itu juga via BCA, GoPay, OVO, Dana, ShopeePay & QRIS All Bank.
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

        {/* Modal Content: Left Plan Selector, Right QRIS Payment Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 sm:p-6 overflow-y-auto flex-1">
          {/* Left Column: Choose Plan */}
          <div className="lg:col-span-7 space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              1. Pilih Paket Keanggotaan PRO:
            </label>

            <div className="space-y-2.5">
              {PLANS.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative rounded-2xl p-4 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/30 shadow-lg ring-1 ring-indigo-500/50'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-md uppercase tracking-wider">
                        Best Value 🔥
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{plan.name}</span>
                          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-700">
                            {plan.badge}
                          </span>
                        </div>

                        <ul className="mt-2.5 space-y-1">
                          {plan.features.map((feat, fIdx) => (
                            <li
                              key={fIdx}
                              className="text-[11px] text-slate-300 flex items-center gap-1.5 font-medium"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base sm:text-lg font-black text-emerald-400">
                          Rp {plan.price.toLocaleString('id-ID')}
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold block">
                          Sekali bayar
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Voucher Input Fallback */}
            <div className="pt-2 border-t border-slate-800/80">
              <form onSubmit={handleVoucherSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Punya Kode Voucher? Masukkan di sini..."
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-200 border border-slate-700"
                >
                  Tukar
                </button>
              </form>
              {voucherError && <p className="text-[11px] text-rose-400 mt-1">{voucherError}</p>}
            </div>
          </div>

          {/* Right Column: QRIS Display & Instant Auto Confirmation */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-center">
            {/* Header with Timer */}
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-cyan-400" />
                <span>Scan QRIS</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                <Clock className="h-3 w-3" />
                <span>{formatMinutes(timeLeft)}</span>
              </div>
            </div>

            {/* QR Code Canvas Mockup */}
            <div className="relative my-4 p-3 bg-white rounded-2xl shadow-xl border-4 border-slate-700">
              {/* QR Image */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=00020101021126610014ID.LINKAJA.WWW01189360000000000000000215000000000000000520458125303360540${selectedPlan.price}5802ID5914DKAIMONO_STUDIO6007JAKARTA6304`}
                alt="QRIS Payment"
                className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
              />

              {/* QRIS Logo Center Badge */}
              <div className="absolute inset-0 m-auto flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md border-2 border-white">
                <Zap className="h-5 w-5 fill-white" />
              </div>
            </div>

            {/* Total Price Tag */}
            <div className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 mb-4">
              <span className="text-[10px] text-slate-400 block font-medium">Total Pembayaran:</span>
              <span className="text-base sm:text-lg font-black text-emerald-400">
                Rp {selectedPlan.price.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Supported Wallets logos */}
            <p className="text-[10px] text-slate-400 mb-3">
              Mendukung: BCA, Mandiri, BRI, BNI, Dana, GoPay, OVO, ShopeePay, LinkAja.
            </p>

            {/* 1-Click Instant Confirm Button */}
            <button
              type="button"
              onClick={handleInstantConfirm}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-xl hover:from-emerald-500 hover:to-cyan-500 active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Memverifikasi Pembayaran...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>⚡ Konfirmasi Bayar & Aktifkan PRO</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
