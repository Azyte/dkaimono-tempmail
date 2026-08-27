'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Gift,
  Copy,
  Check,
  Users,
  Coins,
  Sparkles,
  ArrowRight,
  Send,
  Trophy,
} from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';
import { User } from '@/types';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenQrisModal: () => void;
}

export function ReferralModal({
  isOpen,
  onClose,
  currentUser,
  onOpenQrisModal,
}: ReferralModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [points, setPoints] = useState(20); // Demo default starting points
  const [invitedCount, setInvitedCount] = useState(2);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  const refCode = currentUser?.alias || 'dkaimono_vip';
  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${refCode}`
    : `https://dkaimono-tempmail-production-51e8.up.railway.app/?ref=${refCode}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWa = () => {
    const text = encodeURIComponent(
      `🔥 Coba TempMail Real-Time & Generator PRO gratis di sini! Dapatkan akun Alight Motion, VPN WARP+ 12PB, dan Video Clipper siap monetisasi:\n👉 ${referralUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleRedeemReward = (cost: number, rewardName: string) => {
    if (points < cost) return;
    setIsRedeeming(true);
    setTimeout(() => {
      setPoints((prev) => prev - cost);
      setRedeemSuccess(`🎉 Selamat! Hadiah ${rewardName} berhasil diklaim.`);
      setIsRedeeming(false);
      fireConfetti();
      setTimeout(() => setRedeemSuccess(null), 4000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-amber-500/40 bg-slate-950 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Glow Header */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-5 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold shadow-lg shadow-amber-500/20">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Program Afiliasi & Referral Poin</span>
                <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  🎁 Cuan & Gratis PRO
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Ajak teman bergabung & dapatkan 10 Poin setiap teman yang aktif!
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Total Poin Kamu
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Coins className="h-5 w-5 fill-amber-400" />
                <span>{points} Poin</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Teman Bergabung
              </span>
              <div className="text-xl sm:text-2xl font-black text-cyan-400 flex items-center justify-center gap-1 mt-0.5">
                <Users className="h-5 w-5" />
                <span>{invitedCount} Teman</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Nilai Reward
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                <span>Rp {(points * 1000).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Referral Link Card */}
          <div className="space-y-2 rounded-2xl border border-amber-500/30 bg-amber-950/10 p-4">
            <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
              <span>🔗 Link Referral Pribadi Kamu:</span>
              <span className="text-[10px] text-amber-400 font-semibold">+10 Poin / Referral</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3.5 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all active:scale-95"
              >
                {copiedLink ? <Check className="h-4 w-4 stroke-[3]" /> : <Copy className="h-4 w-4" />}
                <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            {/* Quick Share to WhatsApp */}
            <button
              onClick={handleShareWa}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 px-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Bagikan Link ke WhatsApp Langsung</span>
            </button>
          </div>

          {/* Rewards Catalog */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 block">
              🎁 Tukar Poin dengan Hadiah PRO:
            </label>

            {redeemSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300 animate-in fade-in">
                {redeemSuccess}
              </div>
            )}

            <div className="space-y-2">
              {[
                { name: 'Akses Starter PRO (7 Hari)', cost: 10, badge: '⚡ 10 Poin' },
                { name: 'Akses Creator VIP (30 Hari)', cost: 25, badge: '🔥 25 Poin' },
                { name: 'Saldo GoPay / Dana Rp 50.000', cost: 50, badge: '💰 50 Poin' },
              ].map((reward, rIdx) => {
                const canAfford = points >= reward.cost;
                return (
                  <div
                    key={rIdx}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 hover:border-slate-700"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{reward.name}</h4>
                      <span className="text-[10px] text-slate-400">Butuh {reward.cost} Poin</span>
                    </div>

                    <button
                      onClick={() => handleRedeemReward(reward.cost, reward.name)}
                      disabled={!canAfford || isRedeeming}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md hover:from-amber-400 hover:to-rose-400'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Klaim Hadiah' : 'Poin Kurang'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
