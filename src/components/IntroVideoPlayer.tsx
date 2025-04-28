// src/components/IntroVideoPlayer.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface IntroVideoPlayerProps {
  url: string;
}

function getYouTubeId(url: string): string | null {
  const regExp =
    /^.*(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([^#\&\?]{11}).*$/;
  const m = url.match(regExp);
  return m && m[1] ? m[1] : null;
}

export default function IntroVideoPlayer({ url }: IntroVideoPlayerProps) {
  const videoId = getYouTubeId(url);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [apiReady, setApiReady] = useState(false);
  const [playing, setPlaying] = useState(false);

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

  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      host: "https://www.youtube-nocookie.com",
      videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        controls: 0,
        modestbranding: 1,
        rel: 0,
        disablekb: 1,
        iv_load_policy: 3,
        fs: 0,
        playsinline: 1,
      },
      events: {
        onStateChange: (e: any) => {
          const isPlaying = e.data === window.YT.PlayerState.PLAYING;
          setPlaying(isPlaying);
        },
      },
    });

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
      }
    };
  }, [apiReady, videoId]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const player = playerRef.current;
    if (!player) return;
    if (playing && typeof player.pauseVideo === "function") {
      player.pauseVideo();
    } else if (!playing && typeof player.playVideo === "function") {
      player.playVideo();
    }
  };

  if (!videoId) return null;

  return (
    <div className="w-full max-w-md rounded-xl overflow-hidden shadow-lg">
      <div className="relative w-full pt-[56.25%] bg-black rounded-xl overflow-hidden">
        <div ref={containerRef} className="absolute inset-0" />
        <button
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className="
            absolute inset-0 flex items-center justify-center 
            bg-black bg-opacity-30 
            opacity-0 hover:opacity-100 transition-opacity duration-200
          "
        >
          {playing ? (
            <svg className="h-10 w-10 text-white" viewBox="0 0 24 24">
              <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="h-10 w-10 text-white" viewBox="0 0 24 24">
              <path fill="currentColor" d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
