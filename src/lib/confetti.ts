import confetti from 'canvas-confetti';

export function fireConfetti() {
  if (typeof window === 'undefined') return;

  confetti({
    particleCount: 45,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#6366f1', '#38bdf8', '#a855f7', '#ec4899', '#10b981'],
    ticks: 200,
    gravity: 1.2,
    scalar: 0.9,
    disableForReducedMotion: true,
  });
}
