"use client";

import React, {
  useState,
  useEffect,
  useRef,
  MouseEvent,
  TouchEvent,
} from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function LiveClassVideoPlayer({ url }: { url: string }) {
  function getYouTubeId(url: string): string | null {
    const regExp =
      /(?:embed\/|v=|live\/|v\/|e\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  }

  const videoId = getYouTubeId(url);
  const playerRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  // UI state
  const [controlsVisible, setControlsVisible] = useState(false);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  // Progress
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [isDragging, setIsDragging] = useState(false);

  // Helper to show controls and reset 2s hide timer
  function showControls() {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, 2000);
  }

  // 1. load YT API
  useEffect(() => {
    if (!videoId) return;
    if (!window.YT) {
      window.onYouTubeIframeAPIReady = () => setApiReady(true);
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    } else {
      setApiReady(true);
    }
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [videoId]);

  // 2. init player
  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return;
    if (playerRef.current) return;
    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      height: "100%",
      width: "100%",
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        playsinline: 1,
      },
      events: {
        onReady: (e: any) => {
          setDuration(e.target.getDuration());
          showControls();
        },
        onStateChange: (e: any) => {
          const st = e.data;
          setIsPlaying(st === window.YT.PlayerState.PLAYING);
          if (st === window.YT.PlayerState.PLAYING) startProgress();
          else cancelAnimationFrame(animationRef.current!);
          showControls();
        },
      },
    });
  }, [apiReady, videoId]);

  const startProgress = () => {
    const step = () => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
      animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);
  };

  // Seek logic
  const updateSeek = (clientX: number) => {
    if (!progressBarRef.current || !playerRef.current || !duration) return;
    const { left, width } = progressBarRef.current.getBoundingClientRect();
    let ratio = (clientX - left) / width;
    ratio = Math.max(0, Math.min(1, ratio));
    const t = ratio * duration;
    playerRef.current.seekTo(t, true);
    setCurrentTime(t);
  };

  // Mouse/touch handlers
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSeek(e.clientX);
    showControls();
  };
  const onMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateSeek(e.clientX);
      showControls();
    }
  };
  const onMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      showControls();
    }
  };
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSeek(e.touches[0].clientX);
    showControls();
  };
  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateSeek(e.touches[0].clientX);
      showControls();
    }
  };
  const onTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      showControls();
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", onMouseMove as any);
      document.addEventListener("mouseup", onMouseUp);
    } else {
      document.removeEventListener("mousemove", onMouseMove as any);
      document.removeEventListener("mouseup", onMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", onMouseMove as any);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  // Play/pause and skip
  const togglePlay = () => {
    if (!playerRef.current) return;
    isPlaying
      ? playerRef.current.pauseVideo()
      : playerRef.current.playVideo();
    showControls();
  };
  const skip = (offset: number) => {
    if (!playerRef.current) return;
    const now = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(now + offset, true);
    showControls();
  };
  const goLive = () => {
    if (!playerRef.current) return;
    const dur = playerRef.current.getDuration();
    playerRef.current.seekTo(dur, true);
    showControls();
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60),
      s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!videoId) {
    return <div className="text-red-500">Invalid video URL</div>;
  }

  return (
    <div
      ref={outerRef}
      className="relative w-full aspect-video bg-black"
      onMouseEnter={showControls}
      onMouseMove={showControls}
      onMouseLeave={() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setControlsVisible(false), 2000);
      }}
      onTouchStart={showControls}
    >
      {/* 1) YouTube iframe */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 2) Progress Bar */}
      <div
        ref={progressBarRef}
        className={`absolute bottom-14 left-0 right-0 h-2 bg-gray-600 cursor-pointer z-10 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="absolute top-0 left-0 h-full bg-red-600"
          style={{
            width: duration ? `${(currentTime / duration) * 100}%` : "0%",
          }}
        >
          <div className="absolute right-0 -top-1 h-4 w-4 bg-red-600 rounded-full" />
        </div>
      </div>

      {/* 3) Controls Overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-between p-4 z-20 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex justify-between text-white text-sm pointer-events-none">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex justify-center items-center gap-6">
          <button
            onClick={() => skip(-10)}
            className="pointer-events-auto text-white bg-black/50 hover:bg-black/70 px-3 py-1 rounded"
            title="Rewind 10s"
          >
            ⏪ 10s
          </button>
          <button
            onClick={togglePlay}
            className="pointer-events-auto bg-red-600 hover:bg-red-700 text-white p-3 rounded-full"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            onClick={() => skip(10)}
            className="pointer-events-auto text-white bg-black/50 hover:bg-black/70 px-3 py-1 rounded"
            title="Forward 10s"
          >
            10s ⏩
          </button>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={goLive}
            className="pointer-events-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            title="Go Live"
          >
            🔴 Go Live
          </button>
          <button
            onClick={() => {
              if (outerRef.current) {
                outerRef.current
                  .requestFullscreen()
                  .catch(console.error);
              }
            }}
            className="pointer-events-auto bg-gray-800 hover:bg-gray-700 text-white p-2 rounded"
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
