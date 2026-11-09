export type SoundType =
  | 'move-self'
  | 'move-opponent'
  | 'capture'
  | 'move-check'
  | 'castle'
  | 'promote'
  | 'game-start'
  | 'game-end'
  | 'illegal';

class SoundManager {
  private audioCache: Map<SoundType, HTMLAudioElement[]> = new Map();
  private poolSize = 3;
  private isPreloaded = false;

  public preload(): void {
    if (this.isPreloaded || typeof window === 'undefined') return;

    const sounds: SoundType[] = [
      'move-self',
      'move-opponent',
      'capture',
      'move-check',
      'castle',
      'promote',
      'game-start',
      'game-end',
      'illegal',
    ];

    sounds.forEach(sound => {
      const pool: HTMLAudioElement[] = [];
      for (let i = 0; i < this.poolSize; i++) {
        const audio = new Audio(`/assets/sounds/${sound}.mp3`);
        audio.preload = 'auto';
        pool.push(audio);
      }
      this.audioCache.set(sound, pool);
    });

    this.isPreloaded = true;
  }

  public play(sound: SoundType): void {
    if (!this.isPreloaded) {
      this.preload();
    }

    const pool = this.audioCache.get(sound);
    if (!pool || pool.length === 0) {
      // Fallback
      const audio = new Audio(`/assets/sounds/${sound}.mp3`);
      audio.play().catch(() => {});
      return;
    }

    // Find an audio element that is currently paused or ended
    let audio = pool.find(a => a.paused || a.ended);
    if (!audio) {
      // If all are playing, take the first one and reset currentTime
      audio = pool[0];
      audio.pause();
      audio.currentTime = 0;
    }

    audio.currentTime = 0;
    audio.play().catch(() => {
      // Catch autoplay policy blocks gracefully
    });
  }
}

export const soundManager = new SoundManager();

