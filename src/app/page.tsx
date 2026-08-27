'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { MailboxHeader } from '@/components/MailboxHeader';
import { FolderSidebar, FolderType } from '@/components/FolderSidebar';
import { EmailList } from '@/components/EmailList';
import { EmailViewer } from '@/components/EmailViewer';
import { SettingsModal } from '@/components/SettingsModal';
import { TestEmailModal } from '@/components/TestEmailModal';
import { CustomAliasModal } from '@/components/CustomAliasModal';
import { QrCodeModal } from '@/components/QrCodeModal';
import { AuthModal } from '@/components/AuthModal';
import { AmPremiumModal } from '@/components/AmPremiumModal';
import { AmAccountsTab } from '@/components/AmAccountsTab';
import { ThemeModal } from '@/components/ThemeModal';
import { VideoClipEditorModal } from '@/components/VideoClipEditorModal';
import { QrisPaymentModal } from '@/components/QrisPaymentModal';
import { ReferralModal } from '@/components/ReferralModal';
import { ServerHealthCard } from '@/components/ServerHealthCard';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { applyTheme, getInitialTheme } from '@/lib/theme';
import { AppSettings, DomainConfig, EmailMessage, Mailbox, User } from '@/types';
import { playNotificationSound } from '@/lib/sound';
import {
  triggerEmailNotification,
  requestNotificationPermission,
} from '@/lib/notifications';
import {
  Mail,
  Inbox,
  ShieldAlert,
  Star,
  Shuffle,
  Settings,
  FlaskConical,
  Crown,
  Zap,
  Palette,
  Scissors,
  Gift,
  QrCode,
  Sparkles,
  Layers,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';

export default function Home() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [domains, setDomains] = useState<DomainConfig[]>([]);
  const [activeDomain, setActiveDomain] = useState<string>('');
  const [mailbox, setMailbox] = useState<Mailbox | null>(null);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FolderType>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(10);
  const [amAccountsCount, setAmAccountsCount] = useState<number>(0);

  // User Auth & Subscription State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tempmail_saved_user');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Modals state
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('dns');
  const [testEmailModalOpen, setTestEmailModalOpen] = useState(false);
  const [customAliasModalOpen, setCustomAliasModalOpen] = useState(false);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [amPremiumModalOpen, setAmPremiumModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [qrisModalOpen, setQrisModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [videoStudioOpen, setVideoStudioOpen] = useState(false);

  // Keep previous messages count to detect incoming mail and play chime
  const prevCountRef = useRef<number>(0);

  // Fetch count of AM Premium accounts
  const fetchAmAccountsCount = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('tempmail_session_token');
    const deviceId =
      localStorage.getItem('tempmail_device_id') ||
      'dev_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('tempmail_device_id', deviceId);

    const headers: Record<string, string> = { 'x-device-id': deviceId };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-session-token'] = token;
    }

    try {
      const res = await fetch('/api/am-premium', { headers });
      const data = await res.json();
      if (data.success && Array.isArray(data.accounts)) {
        setAmAccountsCount(data.accounts.length);
      }
    } catch (e) {}
  }, []);

  // Fetch current user session with token from localStorage
  const fetchCurrentUser = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('tempmail_session_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          headers['x-session-token'] = token;
        }
      }

      const res = await fetch('/api/auth/me', { headers });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        if (typeof window !== 'undefined') {
          if (data.token) localStorage.setItem('tempmail_session_token', data.token);
          localStorage.setItem('tempmail_saved_user', JSON.stringify(data.user));
        }
      } else {
        if (typeof window !== 'undefined' && !localStorage.getItem('tempmail_session_token')) {
          setCurrentUser(null);
          localStorage.removeItem('tempmail_saved_user');
        }
      }
    } catch (e) {
      console.error('Error fetching user:', e);
    }
  }, []);

  // 1. Fetch settings & domains
  const fetchSettingsAndDomains = useCallback(async () => {
    try {
      const [settRes, domRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/domains'),
      ]);

      const settData = await settRes.json();
      const domData = await domRes.json();

      if (settData.success) {
        setSettings(settData.settings);
      }

      if (domData.success && domData.domains && domData.domains.length > 0) {
        setDomains(domData.domains);
        const primary = domData.domains.find((d: DomainConfig) => d.isPrimary) || domData.domains[0];
        setActiveDomain(primary.domain);
      } else {
        setActiveDomain('loginptn.xyz');
      }
    } catch (err) {
      console.error('Error loading settings/domains:', err);
      setActiveDomain('loginptn.xyz');
    }
  }, []);

  // 2. Fetch messages for active mailbox
  const fetchMessages = useCallback(
    async (address: string, silent = false) => {
      if (!silent) setIsRefreshing(true);
      try {
        const res = await fetch(`/api/mailboxes/${encodeURIComponent(address)}/messages`);
        const data = await res.json();

        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);

          // If new mail arrived
          if (data.messages.length > prevCountRef.current && prevCountRef.current > 0) {
            if (soundEnabled) {
              playNotificationSound();
            }
            const latestMsg = data.messages[0];
            if (latestMsg) {
              triggerEmailNotification(latestMsg.from, latestMsg.subject, latestMsg.snippet);
            }
          }
          prevCountRef.current = data.messages.length;
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    },
    [soundEnabled]
  );

  // Initialize Mailbox
  const initMailbox = useCallback(
    async (targetAddress?: string) => {
      const currentDom = activeDomain || 'loginptn.xyz';
      let addressToUse = targetAddress;

      if (!addressToUse) {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('tempmail_address') : null;
        if (saved && saved.includes('@')) {
          addressToUse = saved;
        } else {
          const randName = 'user' + Math.random().toString(36).substring(2, 8);
          addressToUse = `${randName}@${currentDom}`;
        }
      }

      const [local, dom] = addressToUse.split('@');
      const finalDom = dom || currentDom;
      const finalAddress = `${local}@${finalDom}`;

      const mb: Mailbox = {
        id: finalAddress,
        address: finalAddress,
        name: local,
        domain: finalDom,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isStarred: false,
        totalMessages: 0,
      };

      setMailbox(mb);
      if (typeof window !== 'undefined') {
        localStorage.setItem('tempmail_address', finalAddress);
      }

      await fetchMessages(finalAddress);
    },
    [activeDomain, fetchMessages]
  );

  // Initial Load
  useEffect(() => {
    applyTheme(getInitialTheme());
    fetchSettingsAndDomains();
    fetchCurrentUser();
    fetchAmAccountsCount();
    requestNotificationPermission();

    // Check query params for shared alias or referral code
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mailParam = params.get('mail');
      const refParam = params.get('ref');

      if (mailParam) {
        const clean = mailParam.replace(/[^a-z0-9._-]/gi, '').toLowerCase();
        if (clean) {
          initMailbox(`${clean}@${activeDomain || 'loginptn.xyz'}`);
        }
      } else {
        initMailbox();
      }

      if (refParam) {
        setReferralModalOpen(true);
      }
    }
  }, [fetchSettingsAndDomains, fetchCurrentUser, fetchAmAccountsCount, initMailbox, activeDomain]);

  // Polling Interval every 10 seconds
  useEffect(() => {
    if (!mailbox?.address) return;

    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchMessages(mailbox.address, true);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mailbox?.address, fetchMessages]);

  // Handlers
  const handleSelectDomain = (newDomain: string) => {
    setActiveDomain(newDomain);
    if (mailbox) {
      const [local] = mailbox.address.split('@');
      initMailbox(`${local}@${newDomain}`);
    }
  };

  const handleGenerateRandom = () => {
    const randName = 'user' + Math.random().toString(36).substring(2, 8);
    initMailbox(`${randName}@${activeDomain || 'loginptn.xyz'}`);
    fireConfetti();
  };

  const handleClearMailbox = () => {
    setMessages([]);
    setSelectedMessageId(null);
    prevCountRef.current = 0;
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const handleSelectFolder = (folder: FolderType) => {
    setCurrentFolder(folder);
    setSelectedMessageId(null);
  };

  const handleToggleStar = async (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isStarred: !m.isStarred } : m))
    );
  };

  const handleDeleteMessage = (msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    if (selectedMessageId === msgId) {
      setSelectedMessageId(null);
    }
  };

  const handleOpenSettings = (tab = 'dns') => {
    setSettingsInitialTab(tab);
    setSettingsModalOpen(true);
  };

  // Folder Counts
  const counts = {
    all: messages.length,
    inbox: messages.filter((m) => !m.isSpam).length,
    spam: messages.filter((m) => m.isSpam).length,
    starred: messages.filter((m) => m.isStarred).length,
    amAccounts: amAccountsCount,
  };

  const selectedMessage = messages.find((m) => m.id === selectedMessageId) || null;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        currentUser={currentUser}
        onOpenSettings={handleOpenSettings}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenAmPremiumModal={() => setAmPremiumModalOpen(true)}
        onOpenThemeModal={() => setThemeModalOpen(true)}
        onOpenQrisModal={() => setQrisModalOpen(true)}
        onOpenReferralModal={() => setReferralModalOpen(true)}
        onOpenVideoStudio={() => setVideoStudioOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        activeDomain={activeDomain}
        totalEmails={messages.length}
      />

      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-3 sm:p-5 lg:p-6 pb-24 md:pb-8">
        {/* Bento Row 1: Hero Mailbox & Quick Tools Launcher */}
        {currentFolder !== 'am_accounts' && (
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${selectedMessageId ? 'hidden md:grid' : 'grid'}`}>
            {/* Left Bento: Mailbox Header Controller */}
            <div className="lg:col-span-8">
              <MailboxHeader
                mailbox={mailbox}
                domains={domains}
                activeDomain={activeDomain}
                onSelectDomain={handleSelectDomain}
                onSelectMailbox={(address) => initMailbox(address)}
                onGenerateRandom={handleGenerateRandom}
                onOpenCustomAlias={() => setCustomAliasModalOpen(true)}
                onOpenQrCode={() => setQrCodeModalOpen(true)}
                onOpenTestEmail={() => setTestEmailModalOpen(true)}
                onRefresh={() => mailbox && fetchMessages(mailbox.address)}
                onClearMailbox={handleClearMailbox}
                onOpenSettings={handleOpenSettings}
                onOpenAmPremiumModal={() => setAmPremiumModalOpen(true)}
                isRefreshing={isRefreshing}
                refreshCountdown={refreshCountdown}
                totalMessages={messages.length}
              />
            </div>

            {/* Right Bento: Studio Quick Actions & Server Health */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {/* Studio & Generator Bento Tiles */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Tile 1: Video Clipper Studio */}
                <button
                  type="button"
                  onClick={() => setVideoStudioOpen(true)}
                  className="bento-card-interactive flex flex-col items-start p-3.5 rounded-2xl text-left relative overflow-hidden group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 mb-2 group-hover:scale-110 transition-transform">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <span>✂️ Video Studio</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
                  </span>
                  <span className="text-[10px] text-slate-400">9:16 Shorts & Reels</span>
                </button>

                {/* Tile 2: Auto PRO Generator */}
                <button
                  type="button"
                  onClick={() => setAmPremiumModalOpen(true)}
                  className="bento-card-interactive flex flex-col items-start p-3.5 rounded-2xl text-left relative overflow-hidden group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                    <Zap className="h-5 w-5 fill-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <span>⚡ Generator PRO</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
                  </span>
                  <span className="text-[10px] text-slate-400">Alight Motion V1-V4</span>
                </button>

                {/* Tile 3: QRIS Upgrade */}
                <button
                  type="button"
                  onClick={() => setQrisModalOpen(true)}
                  className="bento-card-interactive flex flex-col items-start p-3.5 rounded-2xl text-left relative overflow-hidden group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mb-2 group-hover:scale-110 transition-transform">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <span>💳 QRIS Instant</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
                  </span>
                  <span className="text-[10px] text-slate-400">Upgrade Otomatis</span>
                </button>

                {/* Tile 4: Referral Rewards */}
                <button
                  type="button"
                  onClick={() => setReferralModalOpen(true)}
                  className="bento-card-interactive flex flex-col items-start p-3.5 rounded-2xl text-left relative overflow-hidden group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 mb-2 group-hover:scale-110 transition-transform">
                    <Gift className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <span>🎁 Referral Poin</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
                  </span>
                  <span className="text-[10px] text-slate-400">Hadiah & Komisi</span>
                </button>
              </div>

              {/* Server Ping Health Widget */}
              <div className="bento-card rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-live-pulse" />
                  <div>
                    <span className="text-[11px] font-bold text-white block">Cluster Server Online</span>
                    <span className="text-[9px] text-slate-400">Ping 18ms • Siap TempMail & Generator</span>
                  </div>
                </div>
                <button
                  onClick={() => setAmPremiumModalOpen(true)}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-300 border border-slate-700"
                >
                  Cek Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Folder Filter Bar */}
        {!selectedMessageId && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:hidden custom-scrollbar">
            {[
              { id: 'all' as FolderType, label: 'Semua', count: counts.all, icon: Mail },
              { id: 'inbox' as FolderType, label: 'Inbox', count: counts.inbox, icon: Inbox },
              { id: 'spam' as FolderType, label: 'Spam', count: counts.spam, icon: ShieldAlert },
              { id: 'starred' as FolderType, label: 'Favorit', count: counts.starred, icon: Star },
              { id: 'am_accounts' as FolderType, label: '⚡ Auto Pro Hub', count: counts.amAccounts, icon: Zap },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentFolder === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectFolder(item.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
                    isActive
                      ? item.id === 'am_accounts'
                        ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md'
                        : 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30'
                      : 'border border-slate-800 bg-slate-900/90 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {item.count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Responsive Grid Layout */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5 min-h-[450px]">
          {/* Left Sidebar (Desktop/Tablet Only) */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3 h-full">
            <FolderSidebar
              currentFolder={currentFolder}
              onSelectFolder={handleSelectFolder}
              counts={counts}
              isPro={currentUser?.isPro}
            />
          </div>

          {/* Main Area: Render AM Accounts Tab OR Normal Email Views */}
          {currentFolder === 'am_accounts' ? (
            <div className="col-span-1 md:col-span-8 lg:col-span-9 h-full">
              <AmAccountsTab
                currentUser={currentUser}
                onOpenAmPremiumModal={() => setAmPremiumModalOpen(true)}
                onOpenMailbox={(alias) => {
                  initMailbox(`${alias}@${activeDomain || 'loginptn.xyz'}`);
                  setCurrentFolder('inbox');
                }}
                onOpenAuthModal={() => setAuthModalOpen(true)}
              />
            </div>
          ) : (
            <>
              {/* Email List Column */}
              <div
                className={`h-full ${
                  selectedMessageId
                    ? 'hidden md:block md:col-span-8 lg:col-span-4'
                    : 'col-span-1 md:col-span-8 lg:col-span-4'
                }`}
              >
                <EmailList
                  messages={messages}
                  selectedMessageId={selectedMessageId}
                  onSelectMessage={(id) => setSelectedMessageId(id)}
                  onToggleStar={handleToggleStar}
                  onDeleteMessage={handleDeleteMessage}
                  onOpenTestEmail={() => setTestEmailModalOpen(true)}
                  currentFolder={currentFolder}
                  isLoading={isRefreshing}
                />
              </div>

              {/* Right Email Detail Viewer Column */}
              <div
                className={`h-full ${
                  !selectedMessageId
                    ? 'hidden lg:block lg:col-span-5'
                    : 'col-span-1 md:col-span-12 lg:col-span-5'
                }`}
              >
                <EmailViewer
                  message={selectedMessage}
                  onBack={() => setSelectedMessageId(null)}
                  onToggleStar={(id) => handleToggleStar(id)}
                  onDelete={(id) => handleDeleteMessage(id)}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Floating Bottom Quick Action Dock for Mobile View */}
      <MobileBottomNav
        currentFolder={currentFolder}
        onSelectFolder={handleSelectFolder}
        onOpenAmPremiumModal={() => setAmPremiumModalOpen(true)}
        onOpenVideoStudio={() => setVideoStudioOpen(true)}
        onOpenQrisModal={() => setQrisModalOpen(true)}
        onOpenThemeModal={() => setThemeModalOpen(true)}
        onOpenReferralModal={() => setReferralModalOpen(true)}
        unreadCount={counts.inbox}
      />

      {/* Modals & Dialogs */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        initialTab={settingsInitialTab}
        settings={settings}
        domains={domains}
        currentUser={currentUser}
        onRefreshSettings={fetchSettingsAndDomains}
        onRefreshDomains={fetchSettingsAndDomains}
        onRefreshUser={fetchCurrentUser}
        onOpenAuthModal={() => {
          setSettingsModalOpen(false);
          setAuthModalOpen(true);
        }}
      />

      <TestEmailModal
        isOpen={testEmailModalOpen}
        onClose={() => setTestEmailModalOpen(false)}
        recipientAddress={mailbox?.address || ''}
        onSuccess={() => mailbox && fetchMessages(mailbox.address)}
      />

      <CustomAliasModal
        isOpen={customAliasModalOpen}
        onClose={() => setCustomAliasModalOpen(false)}
        domains={domains}
        activeDomain={activeDomain}
        onCreateAlias={(address) => initMailbox(address)}
        isPro={currentUser?.isPro}
        onOpenUpgrade={() => setQrisModalOpen(true)}
      />

      <QrCodeModal
        isOpen={qrCodeModalOpen}
        onClose={() => setQrCodeModalOpen(false)}
        address={mailbox?.address || ''}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={fetchCurrentUser}
        onSuccess={fetchCurrentUser}
        onLogout={async () => {
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
            if (typeof window !== 'undefined') {
              localStorage.removeItem('tempmail_session_token');
              localStorage.removeItem('tempmail_saved_user');
            }
            setCurrentUser(null);
          } catch (e) {}
          setAuthModalOpen(false);
        }}
        onOpenProTab={() => {
          setAuthModalOpen(false);
          handleOpenSettings('pro');
        }}
      />

      <AmPremiumModal
        isOpen={amPremiumModalOpen}
        onClose={() => {
          setAmPremiumModalOpen(false);
          fetchAmAccountsCount();
        }}
        domains={domains}
        activeDomain={activeDomain}
        currentUser={currentUser}
        onOpenMailbox={(alias) => {
          initMailbox(`${alias}@${activeDomain || 'loginptn.xyz'}`);
          setCurrentFolder('inbox');
          setAmPremiumModalOpen(false);
        }}
        onOpenAuthModal={() => {
          setAmPremiumModalOpen(false);
          setAuthModalOpen(true);
        }}
      />

      <ThemeModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />

      <QrisPaymentModal
        isOpen={qrisModalOpen}
        onClose={() => setQrisModalOpen(false)}
        currentUser={currentUser}
        onUpgradeSuccess={(upgraded) => {
          setCurrentUser(upgraded);
          fetchCurrentUser();
        }}
      />

      <ReferralModal
        isOpen={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        currentUser={currentUser}
        onOpenQrisModal={() => {
          setReferralModalOpen(false);
          setQrisModalOpen(true);
        }}
      />

      <VideoClipEditorModal
        isOpen={videoStudioOpen}
        onClose={() => setVideoStudioOpen(false)}
        initialVideoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        initialTitle="TIPS RAHASIA VIRAL 99% ORANG BELUM TAHU! 😱"
        initialHooks={[
          'JANGAN PERNAH LAKUKAN INI! 😱',
          '99% ORANG BELUM TAHU TRIK INI! 🤯',
          'RAHASIA ALGORITMA TERBONGKAR! 🚨',
        ]}
      />
    </div>
  );
}
