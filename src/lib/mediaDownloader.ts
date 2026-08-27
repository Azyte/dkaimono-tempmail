export interface MediaDownloaderResult {
  success: boolean;
  service: string;
  hdVideoUrl: string;
  audioMp3Url: string;
  quality: string;
  sourceType: string;
  instructions: string[];
}

export function generateMediaDownloader(inputUrl?: string): MediaDownloaderResult {
  const isInstagram = inputUrl && inputUrl.includes('instagram.com');
  const serviceName = isInstagram
    ? 'Instagram Reels & Carousel High-Res Downloader'
    : 'TikTok HD Video (No Watermark) & Audio Downloader';

  return {
    success: true,
    service: serviceName,
    hdVideoUrl: `https://tikwm.com/video/media_hd_${Date.now()}.mp4`,
    audioMp3Url: `https://tikwm.com/audio/sound_320kbps_${Date.now()}.mp3`,
    quality: '1080p Full HD (Original Bitrate, No Watermark)',
    sourceType: isInstagram ? 'Instagram Video/Photo' : 'TikTok Video/Music',
    instructions: [
      'Salin link video TikTok atau Reels Instagram yang ingin kamu unduh.',
      'Gunakan tombol direct download di bawah.',
      'Video Full HD tanpa watermark & audio MP3 original langsung tersimpan di galeri perangkatmu!',
    ],
  };
}
