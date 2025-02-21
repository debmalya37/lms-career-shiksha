// components/LiveClassVideoPlayer.tsx
"use client";

import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    YT: typeof YT | undefined;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface CustomPlayerVars extends YT.PlayerVars {
  fs?: number;
  iv_load_policy?: number;
  playsinline?: number;
}

export default function LiveClassVideoPlayer({ url }: { url: string }) {
  const videoId = getYouTubeId(url);
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  function getYouTubeId(url: string): string | null {
    const regExp = /(?:embed\/|v=|live\/|v\/|e\/|watch\?v=|&v=)([^#&?]*)/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  }

  useEffect(() => {
    if (!videoId) return;

    const initializeAPI = () => {
      if (!window.YT) {
        window.onYouTubeIframeAPIReady = () => setApiReady(true);
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(script);
      } else {
        setApiReady(true);
      }
    };

    initializeAPI();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return;

    const playerVars: CustomPlayerVars = {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      playsinline: 1
    };

    playerRef.current = new window.YT!.Player(containerRef.current, {
      videoId,
      height: '100%',
      width: '100%',
      playerVars,
      events: {
        onReady: () => {
          // Player is ready
        },
        onStateChange: (event) => {
          setIsPlaying(event.data === window.YT!.PlayerState.PLAYING);
        }
      }
    });
  }, [apiReady, videoId]);

  const handlePlayPause = () => {
    playerRef.current?.[isPlaying ? 'pauseVideo' : 'playVideo']();
  };

  const seek = (seconds: number) => {
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    playerRef.current?.seekTo(currentTime + seconds, true);
  };

  if (!videoId) return <div className="text-red-500">Invalid video URL</div>;

  return (
    <div className="relative w-full aspect-video bg-black group">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Custom Controls */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-center gap-4">
          <button onClick={() => seek(-10)} className="text-white hover:text-gray-300">
            ⏪ 10s
          </button>
          <button
            onClick={handlePlayPause}
            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 w-10 h-10 flex items-center justify-center"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={() => seek(10)} className="text-white hover:text-gray-300">
            10s ⏩
          </button>
        </div>
      </div>
    </div>
  );
}