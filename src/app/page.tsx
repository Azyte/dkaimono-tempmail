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
import { MailboxHistoryModal } from '@/components/MailboxHistoryModal';
import { AppSettings, DomainConfig, EmailMessage, Mailbox } from '@/types';
import { playNotificationSound } from '@/lib/sound';
import { Mail, Inbox, ShieldAlert, Star, Shuffle, Settings, FlaskConical, History } from 'lucide-react';

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

  // Modals state
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('dns');
  const [testEmailModalOpen, setTestEmailModalOpen] = useState(false);
  const [customAliasModalOpen, setCustomAliasModalOpen] = useState(false);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Keep previous messages count to detect incoming mail and play chime
  const prevCountRef = useRef<number>(0);

  // 1. Fetch settings & domains
  const fetchSettingsAndDomains = useCallback(async () => {
    try {
      const [settRes, domRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/domains'),
      ]);

      const settData = await settRes.json();
      const domData = await domRes.json();

      if (settData.success && settData.settings) {
        setSettings(settData.settings);
        setSoundEnabled(settData.settings.soundEnabled);
      }

      if (domData.success && domData.domains) {
        setDomains(domData.domains);
        const primary = domData.domains.find((d: DomainConfig) => d.isPrimary) || domData.domains[0];
        if (primary && !activeDomain) {
          setActiveDomain(primary.name);
        }
      }
    } catch (err) {
      console.error('Error fetching settings/domains:', err);
    }
  }, [activeDomain]);

  // 2. Fetch messages for active mailbox
  const fetchMessages = useCallback(async (mailboxAddress: string, folder = currentFolder) => {
    if (!mailboxAddress) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(
        `/api/mailboxes/${encodeURIComponent(mailboxAddress)}/messages?folder=${folder}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);

        // If new messages arrived, trigger sound notification
        if (data.messages.length > prevCountRef.current && prevCountRef.current !== 0) {
          if (soundEnabled) {
            playNotificationSound();
          }
        }
        prevCountRef.current = data.messages.length;

        // Auto select first message on desktop if none selected
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
          if (!selectedMessageId && data.messages.length > 0) {
            setSelectedMessageId(data.messages[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentFolder, selectedMessageId, soundEnabled]);

  // 3. Initialize or switch mailbox
  const initMailbox = useCallback(async (targetAddress?: string) => {
    try {
      let url = '/api/mailboxes';
      let options: RequestInit = { method: 'GET' };

      if (targetAddress) {
        url = `/api/mailboxes/${encodeURIComponent(targetAddress)}`;
      } else {
        // Create or get random mailbox
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ generateRandom: true, domain: activeDomain || 'loginptn.xyz' }),
        };
      }

      const res = await fetch(url, options);
      const data = await res.json();

      if (data.success && data.mailbox) {
        setMailbox(data.mailbox);
        setSelectedMessageId(null);
        prevCountRef.current = 0;
        fetchMessages(data.mailbox.address);
      }
    } catch (e) {
      console.error('Error init mailbox:', e);
    }
  }, [activeDomain, fetchMessages]);

  // Initial load
  useEffect(() => {
    fetchSettingsAndDomains();
  }, [fetchSettingsAndDomains]);

  useEffect(() => {
    if (domains.length > 0 && !mailbox) {
      // Check URL query param ?mailbox=
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const paramBox = params.get('mailbox');
        if (paramBox) {
          initMailbox(paramBox);
          return;
        }
      }
      initMailbox();
    }
  }, [domains, mailbox, initMailbox]);

  // Handle auto-refresh countdown
  useEffect(() => {
    const intervalSecs = settings?.autoRefreshSeconds || 10;
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          if (mailbox?.address) {
            fetchMessages(mailbox.address);
          }
          return intervalSecs;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings?.autoRefreshSeconds, mailbox?.address, fetchMessages]);

  // Handle switching folder
  const handleSelectFolder = (folder: FolderType) => {
    setCurrentFolder(folder);
    if (folder === 'logs') {
      setSettingsInitialTab('logs');
      setSettingsModalOpen(true);
      return;
    }
    if (mailbox?.address) {
      fetchMessages(mailbox.address, folder);
    }
  };

  // Generate random new mailbox
  const handleGenerateRandom = async () => {
    try {
      const res = await fetch('/api/mailboxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateRandom: true, domain: activeDomain || 'loginptn.xyz' }),
      });
      const data = await res.json();
      if (data.success && data.mailbox) {
        setMailbox(data.mailbox);
        setSelectedMessageId(null);
        prevCountRef.current = 0;
        fetchMessages(data.mailbox.address);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Switch domain
  const handleSelectDomain = (domName: string) => {
    setActiveDomain(domName);
    if (mailbox) {
      const newAddress = `${mailbox.name}@${domName}`;
      initMailbox(newAddress);
    }
  };

  // Toggle Star
  const handleToggleStar = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'star' }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isStarred: data.isStarred } : m))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete message
  const handleDeleteMessage = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessageId === id) {
        setSelectedMessageId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Clear all messages in mailbox
  const handleClearMailbox = async () => {
    if (!mailbox) return;
    if (!confirm('Hapus SEMUA pesan di kotak masuk ini?')) return;
    try {
      await fetch(`/api/mailboxes/${encodeURIComponent(mailbox.address)}/messages`, {
        method: 'DELETE',
      });
      setMessages([]);
      setSelectedMessageId(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Open settings with specific tab
  const handleOpenSettings = (tab = 'dns') => {
    setSettingsInitialTab(tab);
    setSettingsModalOpen(true);
  };

  // Toggle sound
  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const selectedMessage = messages.find((m) => m.id === selectedMessageId) || null;

  const counts = {
    all: messages.length,
    inbox: messages.filter((m) => !m.isSpam).length,
    spam: messages.filter((m) => m.isSpam).length,
    starred: messages.filter((m) => m.isStarred).length,
    logs: 0,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#060913] text-slate-100 pb-20 sm:pb-8">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        onOpenSettings={handleOpenSettings}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        activeDomain={activeDomain}
        totalEmails={messages.length}
      />

      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3.5 sm:gap-5 p-3 sm:p-6 lg:p-8">
        {/* Hero Mailbox Bar */}
        <MailboxHeader
          mailbox={mailbox}
          domains={domains}
          activeDomain={activeDomain}
          onSelectDomain={handleSelectDomain}
          onGenerateRandom={handleGenerateRandom}
          onOpenCustomAlias={() => setCustomAliasModalOpen(true)}
          onOpenHistory={() => setHistoryModalOpen(true)}
          onOpenQrCode={() => setQrCodeModalOpen(true)}
          onOpenTestEmail={() => setTestEmailModalOpen(true)}
          onRefresh={() => mailbox && fetchMessages(mailbox.address)}
          onClearMailbox={handleClearMailbox}
          onOpenSettings={handleOpenSettings}
          isRefreshing={isRefreshing}
          refreshCountdown={refreshCountdown}
          totalMessages={messages.length}
        />

        {/* Mobile Folder Pills Segmented Bar (Mobile Only) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:hidden custom-scrollbar">
          {[
            { id: 'all' as FolderType, label: 'Semua', count: counts.all, icon: Mail },
            { id: 'inbox' as FolderType, label: 'Inbox', count: counts.inbox, icon: Inbox },
            { id: 'spam' as FolderType, label: 'Spam', count: counts.spam, icon: ShieldAlert },
            { id: 'starred' as FolderType, label: 'Favorit', count: counts.starred, icon: Star },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentFolder === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectFolder(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                    : 'border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
                {item.count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 min-h-[550px]">
          {/* Left Sidebar (Desktop/Tablet Only) */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3 h-full">
            <FolderSidebar
              currentFolder={currentFolder}
              onSelectFolder={handleSelectFolder}
              counts={counts}
            />
          </div>

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
        </div>
      </main>

      {/* Floating Bottom Quick Action Bar for Mobile Thumb Usage */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-slate-950/90 p-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around gap-1">
          <button
            onClick={handleGenerateRandom}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl p-1.5 text-[10px] font-medium text-slate-300 active:scale-95 transition-all hover:bg-slate-900"
          >
            <Shuffle className="h-4 w-4 text-amber-400" />
            <span>Acak</span>
          </button>

          <button
            onClick={() => setCustomAliasModalOpen(true)}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl p-1.5 text-[10px] font-medium text-slate-300 active:scale-95 transition-all hover:bg-slate-900"
          >
            <Mail className="h-4 w-4 text-sky-400" />
            <span>Custom</span>
          </button>

          <button
            onClick={() => setHistoryModalOpen(true)}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl p-1.5 text-[10px] font-medium text-slate-300 active:scale-95 transition-all hover:bg-slate-900"
          >
            <History className="h-4 w-4 text-indigo-400" />
            <span>Riwayat</span>
          </button>

          <button
            onClick={() => setTestEmailModalOpen(true)}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl p-1.5 text-[10px] font-medium text-slate-300 active:scale-95 transition-all hover:bg-slate-900"
          >
            <FlaskConical className="h-4 w-4 text-emerald-400" />
            <span>Test Mail</span>
          </button>

          <button
            onClick={() => handleOpenSettings()}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl p-1.5 text-[10px] font-medium text-slate-300 active:scale-95 transition-all hover:bg-slate-900"
          >
            <Settings className="h-4 w-4 text-cyan-400" />
            <span>Setting</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <MailboxHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        currentAddress={mailbox?.address || ''}
        activeDomain={activeDomain}
        domains={domains}
        onSelectMailbox={(address) => initMailbox(address)}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        initialTab={settingsInitialTab}
        settings={settings}
        domains={domains}
        onRefreshSettings={fetchSettingsAndDomains}
        onRefreshDomains={fetchSettingsAndDomains}
      />

      <TestEmailModal
        isOpen={testEmailModalOpen}
        onClose={() => setTestEmailModalOpen(false)}
        recipientEmail={mailbox?.address || `test@${activeDomain || 'loginptn.xyz'}`}
        onSuccess={() => mailbox && fetchMessages(mailbox.address)}
      />

      <CustomAliasModal
        isOpen={customAliasModalOpen}
        onClose={() => setCustomAliasModalOpen(false)}
        domains={domains}
        activeDomain={activeDomain}
        onSelectMailbox={(address) => initMailbox(address)}
      />

      <QrCodeModal
        isOpen={qrCodeModalOpen}
        onClose={() => setQrCodeModalOpen(false)}
        emailAddress={mailbox?.address || ''}
      />
    </div>
  );
}
