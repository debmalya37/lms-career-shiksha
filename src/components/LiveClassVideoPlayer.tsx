"use client";

import React, { useState, useEffect, useRef, MouseEvent, TouchEvent } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function LiveClassVideoPlayer({ url }: { url: string }) {
  // Helper: extract the 11‐character YouTube ID from a live‐URL (supports “live/” and “embed/” formats).
  function getYouTubeId(url: string): string | null {
    const regExp =
      /(?:embed\/|v=|live\/|v\/|e\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  }

  const videoId = getYouTubeId(url);
  const playerRef = useRef<any| null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const outerContainerRef = useRef<HTMLDivElement>(null);

  // UI state flags:
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  // Progress bar state:
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [isDragging, setIsDragging] = useState(false);

  // 1) Load YouTube IFrame API only once:
  useEffect(() => {
    if (!videoId) return;

    if (!window.YT) {
      window.onYouTubeIframeAPIReady = () => {
        setApiReady(true);
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    } else {
      setApiReady(true);
    }

    return () => {
      // On unmount, destroy the player to avoid orphaned iframes.
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  // 2) Once API is ready and we have a videoId, create the player exactly once:
  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return;

    // If we've already built the player, do not rebuild it.
    if (playerRef.current) return;

    const playerVars: YT.PlayerVars = {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      playsinline: 1,
    };

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      height: "100%",
      width: "100%",
      playerVars,
      events: {
        onReady: (event: any) => {
          // Once the player is ready, grab its duration (for a live/DVR stream, this is the “elapsed broadcast time”)
          const p = event.target as any;
          const dur = p.getDuration();
          setDuration(dur);
        },
        onStateChange: (event: any) => {
          const state = event.data;
          // YT.PlayerState.PLAYING === 1
          // YT.PlayerState.PAUSED  === 2
          setIsPlaying(state === window.YT.PlayerState.PLAYING);
          if (state === window.YT.PlayerState.PLAYING) {
            startProgressUpdate();
          } else {
            // Stop updating the progress bar whenever the video is not “PLAYING”
            cancelAnimationFrame(animationRef.current!);
          }
        },
      },
    });
  }, [apiReady, videoId]);

  // 3) Continuously update the “currentTime” while the video plays:
  const startProgressUpdate = () => {
    const step = () => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
      animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);
  };

  // 4) Seek handling (both mouse and touch):
  const updateSeekFromClientX = (clientX: number) => {
    if (!progressBarRef.current || !playerRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    let pos = (clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    const seekTime = pos * duration;
    playerRef.current.seekTo(seekTime, true);
    setCurrentTime(seekTime);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSeekFromClientX(e.clientX);
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (isDragging) {
      updateSeekFromClientX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };
  

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSeekFromClientX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateSeekFromClientX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
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
  // 5) Play / Pause toggle. **We do NOT “seek” here**—just pause or play the existing head.
  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
      // Note: Since we never re‐created the player or forced a seek,
      // the internal head remains at whatever timestamp it was paused at.
    }
  };

  // 6) Skip forward/back by 10 seconds
  const skip = (offset: number) => {
    if (!playerRef.current) return;
    const current = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(current + offset, true);
  };

  // 7) “Go Live” button: snap to the very end (live edge)
  //    For a YouTube live/DVR stream, seeking to “duration” jumps to live.
  const handleGoLive = () => {
    if (!playerRef.current) return;
    // If duration is 0 (sometimes live streams report 0 until buffer), 
    // wait a moment and try again:
    const dur = playerRef.current.getDuration();
    if (dur <= 0) {
      setTimeout(() => {
        const d2 = playerRef.current!.getDuration();
        playerRef.current!.seekTo(d2, true);
      }, 500);
    } else {
      playerRef.current.seekTo(dur, true);
    }
  };

  // 8) Toggle full screen
  const handleFullScreen = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!outerContainerRef.current) return;
    if (!document.fullscreenElement) {
      outerContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Error enabling full screen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // 9) Utility: format seconds as “MM:SS”
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!videoId) {
    return <div className="text-red-500">Invalid video URL</div>;
  }

  return (
    <div
      ref={outerContainerRef}
      className="relative w-full aspect-video bg-black group"
      onClick={() => {
        /* Tapping anywhere toggles the control overlay */
      }}
    >
      {/* 1) Actual YouTube iframe gets injected here */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 2) Progress Bar: only visible on hover (the “group” parent gives us that) */}
      <div
        ref={progressBarRef}
        className="absolute bottom-16 left-0 right-0 h-2 bg-gray-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* The filled portion, based on (currentTime / duration) percent */}
        <div
          className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-100"
          style={{
            width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
          }}
        >
          <div className="absolute right-0 -top-1 h-4 w-4 bg-red-600 rounded-full transform translate-x-1/2" />
        </div>
      </div>

      {/* 3) Control Overlay (Play/Pause, Skip, Go Live, Fullscreen, Timestamp) */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
        {/* Top area: currentTime / duration */}
        <div className="flex justify-between text-white text-sm pointer-events-auto">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Center controls */}
        <div className="flex justify-center items-center gap-6 pointer-events-auto">
          <button
            onClick={() => skip(-10)}
            className="text-white bg-black/50 hover:bg-black/70 px-3 py-1 rounded"
            title="Rewind 10s"
          >
            ⏪ 10s
          </button>

          <button
            onClick={handlePlayPause}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            onClick={() => skip(10)}
            className="text-white bg-black/50 hover:bg-black/70 px-3 py-1 rounded"
            title="Forward 10s"
          >
            10s ⏩
          </button>
        </div>

        {/* Bottom area: “Go Live” and “Fullscreen” */}
        <div className="flex justify-between items-center pointer-events-auto">
          <button
            onClick={handleGoLive}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            title="Go Live"
          >
            🔴 Go Live
          </button>

          <button
            onClick={handleFullScreen}
            className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded"
            title="Full Screen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
        </div>
      </div>
    </div>
  );
}
