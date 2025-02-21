"use client";

import { useState, useEffect, useRef } from 'react';

// Extended type declarations for YouTube API
declare global {
  interface Window {
    YT: typeof YT | undefined;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Extended PlayerVars interface to include missing properties
interface CustomPlayerVars extends YT.PlayerVars {
  fs?: number;
  iv_load_policy?: number;
  playsinline?: number;
}

interface VideoPlayerProps {
  url: string;
}

export default function TutorialVideoPlayer({ url }: VideoPlayerProps) {
  const videoId = getYouTubeId(url);
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  // YouTube ID extraction function
  function getYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  // Initialize YouTube API
  useEffect(() => {
    if (!videoId) return;

    const initializeAPI = () => {
      if (!window.YT) {
        window.onYouTubeIframeAPIReady = () => {
          setApiReady(true);
          if (window.YT) {
            window.YT.ready(() => setApiReady(true));
          }
        };

        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(script);
      } else {
        setApiReady(true);
        window.YT.ready(() => setApiReady(true));
      }
    };

    initializeAPI();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  // Initialize player when API is ready
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
      videoId: videoId,
      height: '100%',
      width: '100%',
      playerVars: playerVars,
      events: {
        onReady: (event) => {
          const player = event.target;
          // player.setSize method removed as it does not exist on type 'Player'
        },
        onStateChange: (event) => {
          setIsPlaying(event.data === window.YT!.PlayerState.PLAYING);
        }
      }
    });
  }, [apiReady, videoId]);

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const seek = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() + seconds, true);
    }
  };

  if (!videoId) return <div className="text-red-500">Invalid video URL</div>;

  return (
    <div className="relative w-full aspect-video bg-black group">
      {/* YouTube Player Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Custom Controls Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-center gap-4">
          <button
            onClick={() => seek(-10)}
            className="text-white hover:text-gray-300 text-sm md:text-base"
            title="Rewind 10 seconds"
          >
            ⏪ 10s
          </button>

          <button
            onClick={handlePlayPause}
            className="bg-red-600 text-white p-2 md:p-3 rounded-full hover:bg-red-700 transition-colors duration-200 flex items-center justify-center w-10 h-10 md:w-12 md:h-12"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={() => seek(10)}
            className="text-white hover:text-gray-300 text-sm md:text-base"
            title="Forward 10 seconds"
          >
            10s ⏩
          </button>
        </div>
      </div>
    </div>
  );
}