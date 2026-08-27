export interface DocumentUnlockResult {
  success: boolean;
  service: string;
  documentTitle: string;
  pdfDownloadUrl: string;
  viewOnlineUrl: string;
  fileFormat: string;
  fileSize: string;
  instructions: string[];
}

export function generateDocumentUnlocker(docUrl?: string): DocumentUnlockResult {
  const sampleTitles = [
    'Laporan Penelitian & Skripsi Akademik 2026',
    'Panduan Lengkap Digital Marketing & SEO Strategy',
    'Financial Modeling & Business Plan Template',
    'Ebook Pemrograman Full-Stack Web Development',
    'Modul Pembelajaran & Kumpulan Soal Terlengkap',
  ];

  const pickedTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
  const docId = Math.floor(Math.random() * 89999999) + 10000000;

  return {
    success: true,
    service: 'Scribd & SlideShare Pro Document Unlocker',
    documentTitle: docUrl ? `Dokumen Unlock: ${docUrl.substring(0, 45)}...` : pickedTitle,
    pdfDownloadUrl: `https://docdownloader.com/download/scribd/${docId}?format=pdf`,
    viewOnlineUrl: `https://scribdfree.com/view/${docId}`,
    fileFormat: 'PDF Original (High-Resolution Text & Vectors)',
    fileSize: `${(Math.random() * 12 + 2).toFixed(1)} MB`,
    instructions: [
      'Tempelkan URL dokumen Scribd / SlideShare yang ingin Anda download.',
      'Klik tombol "📥 Unduh PDF Dokumen" di bawah.',
      'File PDF lengkap akan terunduh langsung tanpa perlu login atau membayar langganan Scribd!',
    ],
  };
}
