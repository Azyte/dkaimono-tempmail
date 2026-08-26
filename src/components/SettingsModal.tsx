'use client';

import React, { useState, useEffect } from 'react';
import { X, Server, Globe, Key, Activity, Zap, Sliders } from 'lucide-react';
import { AppSettings, DomainConfig } from '@/types';
import { DnsTab } from './settings/DnsTab';
import { CloudflareTab } from './settings/CloudflareTab';
import { PoliciesTab } from './settings/PoliciesTab';
import { ApiTab } from './settings/ApiTab';
import { LogsTab } from './settings/LogsTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  settings: AppSettings | null;
  domains: DomainConfig[];
  onRefreshSettings: () => void;
  onRefreshDomains: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  initialTab = 'dns',
  settings,
  domains,
  onRefreshSettings,
  onRefreshDomains,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md">
      <div className="relative flex h-full max-h-[850px] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md">
              <Server className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dashboard &amp; Setting TempMail</h3>
              <p className="text-xs text-slate-400">Konfigurasi MX Domain, Cloudflare Inbound, Kebijakan Spam, &amp; API</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/40 px-6 overflow-x-auto custom-scrollbar">
          {[
            { id: 'dns', label: 'Domain & Setting MX', icon: Globe },
            { id: 'cloudflare', label: 'Cloudflare Worker Catch-All', icon: Zap },
            { id: 'policies', label: 'Filter Spam & Kebijakan', icon: Sliders },
            { id: 'api', label: 'REST API & Webhook', icon: Key },
            { id: 'logs', label: 'Log Inbound Masuk', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all ${
                  isActive
                    ? 'border-indigo-500 text-white bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
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
