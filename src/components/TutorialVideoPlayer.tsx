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
  const hideTimer = useRef<number>();

  const [controlsVisible, setControlsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRateMenu, setShowRateMenu] = useState(false);

  // 1️⃣ Load YouTube IFrame API
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
  }, [videoId]);

  // 2️⃣ Auto‐hide helper
  const showAndScheduleHide = () => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 2000);
  };

  // 3️⃣ Hide immediately on fullscreen toggle
  useEffect(() => {
    const onFSChange = () => {
      setControlsVisible(false);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
    document.addEventListener("fullscreenchange", onFSChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFSChange);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  // 4️⃣ Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!playerRef.current) return;
      switch (e.code) {
        case "Space":
          e.preventDefault();
          isPlaying
            ? playerRef.current.pauseVideo()
            : playerRef.current.playVideo();
          break;
        case "ArrowRight":
          playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10, true);
          break;
        case "ArrowLeft":
          playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10, true);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPlaying]);

  // 5️⃣ Init player when API ready
  const playerRef = useRef<any>(null);
  useEffect(() => {
    if (!apiReady || !videoId || !playerContainerRef.current) return;
    if (playerRef.current) return;

    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      videoId,
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
        onReady: (evt: any) => {
          const d = evt.target.getDuration();
          setDuration(d);
          evt.target.setPlaybackRate(playbackRate);
        },
        onStateChange: (evt: any) => {
          const st = evt.data;
          const playing = st === window.YT.PlayerState.PLAYING;
          setIsPlaying(playing);
          if (playing) startProgressLoop();
          else cancelAnimationFrame(animationRef.current!);
        },
      },
    });
  }, [apiReady, videoId, playbackRate]);

  // 6️⃣ Progress loop
  const startProgressLoop = () => {
    const step = () => {
      if (!isDragging && playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
      animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);
  };

  // 7️⃣ Seek helpers
  const updateSeek = (x: number) => {
    if (!progressBarRef.current || !playerRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pct = Math.min(Math.max(0, (x - rect.left) / rect.width), 1);
    const t = pct * duration;
    playerRef.current.seekTo(t, true);
    setCurrentTime(t);
  };
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    updateSeek(e.clientX);
  };
  const onMouseMove = (e: MouseEvent) => isDragging && updateSeek(e.clientX);
  const onMouseUp = () => setIsDragging(false);
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    updateSeek(e.touches[0].clientX);
  };
  const onTouchMove = (e: TouchEvent) =>
    isDragging && updateSeek(e.touches[0].clientX);
  const onTouchEnd = () => setIsDragging(false);

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

  // 8️⃣ Format time
  const fmt = (s: number) => {
    const m = Math.floor(s / 60),
      sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // 9️⃣ Controls actions
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };
  const skip = (off: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + off, true);
  };
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!outerRef.current) return;
    if (!document.fullscreenElement) outerRef.current.requestFullscreen?.();
    else document.exitFullscreen();
  };
  const changeRate = (r: number) => {
    playerRef.current?.setPlaybackRate(r);
    setPlaybackRate(r);
    setShowRateMenu(false);
  };

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800 text-red-400 rounded-lg">
        Invalid video URL
      </div>
    );
  }

  return (
    <div
      ref={outerRef}
      className="relative w-full aspect-video bg-black overflow-hidden rounded-lg shadow-lg"
      onMouseEnter={showAndScheduleHide}
      onMouseMove={showAndScheduleHide}
      onMouseLeave={showAndScheduleHide}
      onTouchStart={showAndScheduleHide}
    >
      {/* video iframe */}
      <div ref={playerContainerRef} className="w-full h-full" />

      {/* timestamp */}
      <div
        className="absolute bottom-20 left-4 text-white text-sm font-medium select-none"
        style={{ opacity: controlsVisible ? 1 : 0, transition: "opacity 0.2s" }}
      >
        {fmt(currentTime)} / {fmt(duration)}
      </div>

      {/* controls overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end items-center bg-gradient-to-t from-black/60 to-transparent"
        style={{ opacity: controlsVisible ? 1 : 0, transition: "opacity 0.2s" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-6 mb-4">
          <button onClick={(e) => skip(-10, e)} className="text-white">
            ⏪ 10s
          </button>
          <button
            onClick={togglePlay}
            className="bg-red-600 p-3 rounded-full text-white"
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <button onClick={(e) => skip(10, e)} className="text-white">
            10s ⏩
          </button>
          <button
            onClick={toggleFullscreen}
            className="ml-4 bg-white/20 p-2 rounded-md"
          >
            ⛶
          </button>
        </div>

        {/* progress bar */}
        <div
          ref={progressBarRef}
          className="relative w-full h-1.5 bg-gray-700 rounded-full mb-2 cursor-pointer"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* playback rate menu */}
        <div className="absolute bottom-16 right-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowRateMenu((v) => !v);
            }}
            className="px-2 py-1 bg-white/20 rounded-md text-white"
          >
            {playbackRate}×
          </button>
          {showRateMenu && (
            <div className="mt-1 bg-black/80 rounded shadow-lg overflow-hidden">
              {[1, 1.25, 1.5, 2].map((r) => (
                <button
                  key={r}
                  onClick={() => changeRate(r)}
                  className={`block w-full px-3 py-1 text-left text-sm ${
                    playbackRate === r ? "bg-red-600 text-white" : "text-gray-200"
                  }`}
                >
                  {r}×
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
