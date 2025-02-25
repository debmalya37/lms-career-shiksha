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
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  
  // State for progress bar
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  
  // Track whether user is dragging the progress bar
  const [isDragging, setIsDragging] = useState(false);

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
      playsinline: 1,
    };

    playerRef.current = new window.YT!.Player(containerRef.current, {
      videoId,
      height: '100%',
      width: '100%',
      playerVars,
      events: {
        onReady: (event) => {
          // Cast to any so we can access getDuration
          const player = event.target as any;
          setDuration(player.getDuration());
        },
        onStateChange: (event) => {
          setIsPlaying(event.data === window.YT!.PlayerState.PLAYING);
          if (event.data === window.YT!.PlayerState.PLAYING) {
            startProgressUpdate();
          } else {
            cancelAnimationFrame(animationRef.current!);
          }
        },
      },
    });
  }, [apiReady, videoId]);

  const startProgressUpdate = () => {
    const updateProgress = () => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
        animationRef.current = requestAnimationFrame(updateProgress);
      }
    };
    animationRef.current = requestAnimationFrame(updateProgress);
  };

  // Helper to update seek based on clientX
  const updateSeekFromClientX = (clientX: number) => {
    if (!progressBarRef.current || !playerRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (clientX - rect.left) / rect.width;
    const seekTime = pos * duration;
    playerRef.current.seekTo(seekTime, true);
    setCurrentTime(seekTime);
  };

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSeekFromClientX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateSeekFromClientX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, isDragging]);

  // Touch event handlers for mobile dragging
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSeekFromClientX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateSeekFromClientX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handlePlayPause = () => {
    playerRef.current?.[isPlaying ? 'pauseVideo' : 'playVideo']();
  };

  const seek = (seconds: number) => {
    const current = playerRef.current?.getCurrentTime() || 0;
    playerRef.current?.seekTo(current + seconds, true);
  };

  // Full screen toggle using the outer container
  const handleFullScreen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!outerContainerRef.current) return;
    if (!document.fullscreenElement) {
      outerContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable full-screen mode:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };


  if (!videoId) return <div className="text-red-500">Invalid video URL</div>;

  return (
    <div className="relative w-full aspect-video bg-black group">
      {/* YouTube Player Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Progress Bar */}
      {/* <div 
        ref={progressBarRef}
        className="absolute bottom-16 left-0 right-0 h-2 bg-gray-600 cursor-pointer transition-all duration-100 group-hover:opacity-100 opacity-0"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-100"
          style={{ width: `${(duration ? (currentTime / duration) * 100 : 0)}%` }}
        >
          <div className="absolute right-0 -top-1 h-4 w-4 bg-red-600 rounded-full transform translate-x-1/2" />
        </div>
      </div> */}

      {/* Custom Controls Overlay */}
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
          <button
            onClick={handleFullScreen}
            className="bg-gray-800 text-white p-2 md:p-3 rounded-full hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center w-10 h-10 md:w-12 md:h-12"
            title="Full Screen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 md:h-8 md:w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3"
              />
            </svg>
          </button>
          <div 
          ref={progressBarRef}
          className="absolute bottom-16 left-0 right-0 h-2 bg-gray-600 cursor-pointer transition-all duration-100 group-hover:opacity-100 opacity-0"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-100"
            style={{ width: `${(duration ? (currentTime / duration) * 100 : 0)}%` }}
          >
            <div className="absolute right-0 -top-1 h-4 w-4 bg-red-600 rounded-full transform translate-x-1/2" />
          </div>
      </div>
        </div>
      </div>
    </div>
  );
}
