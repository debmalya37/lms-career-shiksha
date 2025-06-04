"use client";
import React, { useState, useEffect, useRef, MouseEvent, TouchEvent } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface TutorialVideoPlayerProps {
  url: string;
}

function getYouTubeId(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function TutorialVideoPlayer({ url }: TutorialVideoPlayerProps) {
  const videoId = getYouTubeId(url);
  const outerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false); // or `true` if you want them shown by default
  const [isDragging, setIsDragging] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // 1. Load YouTube Iframe API
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
  }, [videoId]);

  // 3. Update progress continuously while playing
  const startProgressLoop = () => {
    const step = () => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        if (!isDragging) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }
      animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);
  };

  // 2. Initialize the player once API is ready
  const playerRef = useRef<any>(null);
  useEffect(() => {
    if (!apiReady || !videoId || !playerContainerRef.current) return;
    if (playerRef.current) return; // do not recreate if already exists

    const playerVars = {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      playsinline: 1,
    };

    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      videoId,
      height: "100%",
      width: "100%",
      playerVars: playerVars,
      events: {
        onReady: (event: any) => {
          const dur = event.target.getDuration();
          setDuration(dur);
          event.target.setPlaybackRate(playbackRate);
        },
        onStateChange: (event: any) => {
          const state = event.data;
          setIsPlaying(state === window.YT.PlayerState.PLAYING);
          if (state === window.YT.PlayerState.PLAYING) {
            startProgressLoop();
          } else {
            cancelAnimationFrame(animationRef.current!);
          }
        },
      },
    });
  }, [apiReady, videoId, playbackRate]);

  // 4. Seek logic (mouse & touch)
  const updateSeekFromX = (clientX: number) => {
    if (!progressBarRef.current || !playerRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1);
    const seekTime = pos * duration;
    playerRef.current.seekTo(seekTime, true);
    setCurrentTime(seekTime);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    updateSeekFromX(e.clientX);
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (isDragging) {
      updateSeekFromX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    updateSeekFromX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateSeekFromX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // 5. Format time (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 6. Play/Pause toggle
  const handlePlayPause = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // 7. Skip forward/back by 10 seconds
  const skip = (offset: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    const newTime = playerRef.current.getCurrentTime() + offset;
    playerRef.current.seekTo(newTime, true);
  };

  // 8. Fullscreen toggle
  const handleFullScreen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!outerRef.current) return;
    if (
      !document.fullscreenElement &&
      !(document as any).webkitFullscreenElement &&
      !(document as any).mozFullScreenElement &&
      !(document as any).msFullscreenElement
    ) {
      if (outerRef.current.requestFullscreen) {
        outerRef.current.requestFullscreen().catch((err) =>
          console.error("Fullscreen request error:", err)
        );
      } else if ((outerRef.current as any).webkitRequestFullscreen) {
        (outerRef.current as any).webkitRequestFullscreen();
      } else if ((outerRef.current as any).mozRequestFullScreen) {
        (outerRef.current as any).mozRequestFullScreen();
      } else if ((outerRef.current as any).msRequestFullscreen) {
        (outerRef.current as any).msRequestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
  };

  // 9. Change playback rate
  const changePlaybackRate = (rate: number) => {
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate);
      setPlaybackRate(rate);
    }
  };

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800 text-red-400">
        Invalid video URL
      </div>
    );
  }

  return (
    <div
      ref={outerRef}
      className="group relative w-full aspect-video bg-black overflow-hidden rounded-lg shadow-lg"
      onClick={() => setShowControls((prev) => !prev)}
    >
      {/* 1) YouTube Iframe Placeholder */}
      <div ref={playerContainerRef} className="w-full h-full" />

      {/* 2) Timestamps */}
      <div
        className={`absolute bottom-20 left-4 text-white text-sm md:text-base font-medium transition-opacity duration-200 ${
          showControls ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      {/* 3) Control Overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end items-center transition-opacity duration-200 ${
          showControls ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100 bg-gradient-to-t from-black/60 to-transparent`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Playback Rate Selector */}
        <div className="flex gap-2 mb-2">
          {[1, 1.25, 1.5, 2].map((rate) => (
            <button
              key={rate}
              onClick={() => changePlaybackRate(rate)}
              className={`text-white px-3 py-1 rounded-md text-xs md:text-sm ${
                playbackRate === rate
                  ? "bg-red-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {rate}×
            </button>
          ))}
        </div>

        {/* Play / Skip / Fullscreen Buttons */}
        <div className="flex items-center gap-6 mb-4">
          <button
            onClick={(e) => skip(-10, e)}
            title="Rewind 10s"
            className="text-white hover:text-gray-300 text-base md:text-lg"
          >
            ⏪ 10s
          </button>

          <button
            onClick={handlePlayPause}
            title={isPlaying ? "Pause" : "Play"}
            className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 md:h-8 md:w-8"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 md:h-8 md:w-8"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <button
            onClick={(e) => skip(10, e)}
            title="Forward 10s"
            className="text-white hover:text-gray-300 text-base md:text-lg"
          >
            10s ⏩
          </button>

          <button
            onClick={handleFullScreen}
            title="Fullscreen"
            className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 md:h-6 md:w-6"
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

        {/* 4) Progress Bar */}
        <div
          ref={progressBarRef}
          className="relative w-full h-1.5 bg-gray-600 cursor-pointer rounded-sm transition-opacity duration-200 mb-2"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="absolute top-0 left-0 h-full bg-red-600 rounded-sm"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div
              className="absolute right-0 -top-1.5 h-3 w-3 bg-red-600 rounded-full transform translate-x-1/2"
            />
          </div>
        </div>

       
      </div>
    </div>
  );
}
