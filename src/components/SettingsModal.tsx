'use client';

import React, { useState, useEffect } from 'react';
import { X, Server, Globe, Key, Activity, Zap, Sliders, Crown } from 'lucide-react';
import { AppSettings, DomainConfig, User } from '@/types';
import { DnsTab } from './settings/DnsTab';
import { CloudflareTab } from './settings/CloudflareTab';
import { PoliciesTab } from './settings/PoliciesTab';
import { ApiTab } from './settings/ApiTab';
import { LogsTab } from './settings/LogsTab';
import { ProTab } from './settings/ProTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  settings: AppSettings | null;
  domains: DomainConfig[];
  currentUser: User | null;
  onRefreshSettings: () => void;
  onRefreshDomains: () => void;
  onRefreshUser: () => void;
  onOpenAuthModal: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  initialTab = 'dns',
  settings,
  domains,
  currentUser,
  onRefreshSettings,
  onRefreshDomains,
  onRefreshUser,
  onOpenAuthModal,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 md:p-6 backdrop-blur-md">
      <div className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/70 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md shrink-0">
              <Server className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Dashboard &amp; Setting TempMail</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Konfigurasi Domain, Bot Telegram PRO, Spam &amp; API</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/40 px-3 sm:px-6 overflow-x-auto custom-scrollbar">
          {[
            { id: 'pro', label: '👑 Konfigurasi PRO & Bot', icon: Crown, highlight: true },
            { id: 'dns', label: 'Domain & MX', icon: Globe },
            { id: 'cloudflare', label: 'Cloudflare Worker', icon: Zap },
            { id: 'policies', label: 'Filter Spam', icon: Sliders },
            { id: 'api', label: 'API & Webhook', icon: Key },
            { id: 'logs', label: 'Log Inbound', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 sm:gap-2 border-b-2 px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold transition-all ${
                  isActive
                    ? 'border-indigo-500 text-white bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                } ${tab.highlight && !isActive ? 'text-amber-400 font-bold' : ''}`}
              >
                <Icon
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                    isActive ? (tab.highlight ? 'text-amber-400' : 'text-indigo-400') : tab.highlight ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-6">
          {activeTab === 'pro' && (
            <ProTab
              currentUser={currentUser}
              onRefreshUser={onRefreshUser}
              onOpenAuthModal={onOpenAuthModal}
            />
          )}

          {activeTab === 'dns' && (
            <DnsTab
              domains={domains}
              onRefreshDomains={onRefreshDomains}
              onRefreshSettings={onRefreshSettings}
            />
          )}

          {activeTab === 'cloudflare' && (
            <CloudflareTab webhookSecret={settings?.webhookSecret || ''} />
          )}

          {activeTab === 'policies' && (
            <PoliciesTab
              settings={settings}
              onRefreshSettings={onRefreshSettings}
            />
          )}

          {activeTab === 'api' && (
            <ApiTab
              settings={settings}
              onRefreshSettings={onRefreshSettings}
            />
          )}

          {activeTab === 'logs' && <LogsTab />}
        </div>
      </div>
    </div>
  );
}
