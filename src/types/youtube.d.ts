// Add this type declaration in your project (create a youtube.d.ts file)
declare namespace YT {
  class Player {
    constructor(element: string | HTMLElement, options: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getCurrentTime(): number;
    destroy(): void;
  }

  interface PlayerOptions {
    videoId?: string;
    playerVars?: PlayerVars;
    events?: PlayerEvents;
  }

  interface PlayerVars {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    modestbranding?: 1;
    rel?: 0 | 1;
    disablekb?: 0 | 1;
  }

  interface PlayerEvents {
    onReady?(event: { target: Player }): void;
    onStateChange?(event: { data: number }): void;
  }

  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

    export function ready(arg0: () => void) {
        throw new Error('Function not implemented.');
    }
}