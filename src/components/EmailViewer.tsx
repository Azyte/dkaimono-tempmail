'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Star,
  Trash2,
  Download,
  Printer,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Paperclip,
  Code,
  FileText,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  ExternalLink,
  Info,
  Sparkles
} from 'lucide-react';
import { EmailMessage } from '@/types';
import { fireConfetti } from '@/lib/confetti';

interface EmailViewerProps {
  message: EmailMessage | null;
  onBack: () => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
}

export function EmailViewer({
  message,
  onBack,
  onToggleStar,
  onDelete,
}: EmailViewerProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'text' | 'raw' | 'security'>('preview');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (activeTab === 'preview' && iframeRef.current && message) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        const content = message.html || `<div style="font-family:sans-serif;white-space:pre-wrap;padding:20px;">${escapeHtml(message.text)}</div>`;
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  color: #1e293b;
                  background-color: #ffffff;
                  word-break: break-word;
                }
                img { max-width: 100% !important; height: auto !important; }
                a { color: #4f46e5; }
              </style>
            </head>
            <body>
              ${content}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [message, activeTab, viewportMode]);

  if (!message) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80 p-8 text-center shadow-xl backdrop-blur-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 shadow-inner">
          <Eye className="h-8 w-8 text-slate-400" />
        </div>
        <h4 className="mt-4 text-base font-semibold text-slate-200">Pilih Pesan untuk Dibaca</h4>
        <p className="mt-1 max-w-sm text-xs text-slate-400">
          Pilih salah satu email di daftar kotak masuk sebelah kiri untuk melihat konten lengkap, header, lampiran, dan analisis keamanan.
        </p>
      </div>
    );
  }

  const handleCopyRaw = () => {
    if (message.rawSource) {
      navigator.clipboard.writeText(message.rawSource);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  const handleCopyText = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatFullDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'medium',
      });
    } catch {
      return iso;
    }
  };

  function escapeHtml(str: string): string {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl backdrop-blur-xl">
      {/* Top Header Controls Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          {/* Back button (Mobile view) */}
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 lg:hidden hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <span className="text-xs font-semibold text-slate-300">Detail Pesan</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Star Button */}
          <button
            onClick={() => onToggleStar(message.id)}
            title={message.isStarred ? 'Hapus dari Favorit' : 'Tandai Favorit'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
              message.isStarred
                ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`h-4 w-4 ${message.isStarred ? 'fill-yellow-400' : ''}`} />
          </button>

          {/* Download Raw .eml */}
          <a
            href={`/api/messages/${message.id}/raw`}
            download
            title="Download file .eml mentah"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5 text-sky-400" />
            <span className="hidden sm:inline">.EML</span>
          </a>

          {/* Print */}
          <button
            onClick={handlePrint}
            title="Cetak email"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(message.id)}
            title="Hapus email ini"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Message Metadata Header Card */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 p-4 sm:p-6 space-y-4">
        {/* Subject Title */}
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white selection:bg-indigo-500">
          {message.subject || '(Tanpa Subjek)'}
        </h2>

        {/* Sender & Security Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-sm font-bold text-white shadow-md">
              {(message.from.name || message.from.address || '?').charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-bold text-slate-100">{message.from.name || message.from.address}</span>
                <span className="text-xs text-slate-400 font-mono">&lt;{message.from.address}&gt;</span>
              </div>
              <p className="text-xs text-slate-400">
                Kepada: <span className="text-slate-300 font-mono">{message.recipient}</span>
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400">
            <div>{formatFullDate(message.receivedAt)}</div>
            <div className="mt-1 flex items-center justify-end gap-1.5">
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                via {message.inboundSource}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Spam Badge Status Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Spam Status Indicator */}
          {message.isSpam ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Terdeteksi Spam (Skor: {message.spamScore}%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Email Lolos Uji Keamanan (Clean)</span>
            </div>
          )}

          {/* SPF Status */}
          <span
            className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-semibold ${
              message.security.spf === 'pass'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : message.security.spf === 'fail'
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                : 'border-slate-700 bg-slate-800 text-slate-400'
            }`}
          >
            SPF: {message.security.spf.toUpperCase()}
          </span>

          {/* DKIM Status */}
          <span
            className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-semibold ${
              message.security.dkim === 'pass'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : message.security.dkim === 'fail'
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                : 'border-slate-700 bg-slate-800 text-slate-400'
            }`}
          >
            DKIM: {message.security.dkim.toUpperCase()}
          </span>
        </div>

        {/* Spam Warning Explanation Banner (if Spam) */}
        {message.isSpam && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <Info className="h-4 w-4 shrink-0" />
              <span>Pesan ini terdeteksi sebagai spam / promosi, tetapi tetap dimunculkan untuk Anda:</span>
            </div>
            <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-[11px] text-amber-300/80">
              {message.spamReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Content View Tabs & Viewport Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50 px-4 py-2">
        {/* Left: Tab Selector */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview HTML</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'text'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Teks Polos</span>
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'raw'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>Header & Source</span>
          </button>
        </div>

        {/* Right: Viewport Mode Switcher (Only on preview tab) */}
        {activeTab === 'preview' && (
          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-0.5">
            <button
              onClick={() => setViewportMode('desktop')}
              title="Tampilan Desktop (100%)"
              className={`p-1.5 rounded-md ${
                viewportMode === 'desktop' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              title="Tampilan Tablet (768px)"
              className={`p-1.5 rounded-md ${
                viewportMode === 'tablet' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              title="Tampilan Smartphone (375px)"
              className={`p-1.5 rounded-md ${
                viewportMode === 'mobile' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/60 p-4 sm:p-6">
        {/* Tab 1: HTML Preview (Sandboxed Iframe) */}
        {activeTab === 'preview' && (
          <div className="flex justify-center h-full min-h-[400px]">
            <div
              className={`h-full w-full rounded-xl overflow-hidden border border-slate-800 bg-white shadow-2xl transition-all ${
                viewportMode === 'mobile'
                  ? 'max-w-[375px]'
                  : viewportMode === 'tablet'
                  ? 'max-w-[768px]'
                  : 'max-w-full'
              }`}
            >
              <iframe
                ref={iframeRef}
                title="Email Content Sandbox"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                className="w-full h-full min-h-[500px] border-0"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Plain Text */}
        {activeTab === 'text' && (
          <div className="relative rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-inner">
            <button
              onClick={handleCopyText}
              className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
            >
              {copiedText ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedText ? 'Disalin' : 'Salin Teks'}</span>
            </button>
            <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200 leading-relaxed pr-20 selection:bg-indigo-500">
              {message.text || '(Tidak ada versi plain text, silakan buka tab Preview HTML)'}
            </pre>
          </div>
        )}

        {/* Tab 3: Raw Source & Headers */}
        {activeTab === 'raw' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Raw RFC 822 MIME Source</span>
              <button
                onClick={handleCopyRaw}
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
              >
                {copiedRaw ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedRaw ? 'Disalin ke Clipboard' : 'Salin Raw Source'}</span>
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-inner">
              <pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap font-mono text-[11px] text-slate-300 leading-relaxed custom-scrollbar selection:bg-indigo-500">
                {message.rawSource || 'Raw source data not available.'}
              </pre>
            </div>
          </div>
        )}

        {/* Attachments Section */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-6 border-t border-slate-800/80 pt-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              <Paperclip className="h-3.5 w-3.5" />
              <span>Lampiran ({message.attachments.length})</span>
            </h4>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {message.attachments.map((att) => {
                const downloadUrl = att.contentBase64
                  ? `data:${att.contentType};base64,${att.contentBase64}`
                  : '#';

                return (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-sm hover:border-slate-700"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate text-xs font-semibold text-slate-200">{att.filename}</p>
                      <p className="text-[10px] text-slate-400">
                        {Math.round(att.size / 1024)} KB • {att.contentType}
                      </p>
                    </div>

                    <a
                      href={downloadUrl}
                      download={att.filename}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-sky-400 hover:bg-slate-700"
                      title="Download Lampiran"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
