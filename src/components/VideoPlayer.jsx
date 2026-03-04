"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // ✅ Prevent double init (React StrictMode dev)
    if (!playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        preload: "auto",
        responsive: true,
        fluid: true,
        poster: poster || undefined,
        sources: src ? [{ src, type: "video/mp4" }] : [],
      });
    } else {
      // ✅ Update source without re-init
      const player = playerRef.current;
      if (poster) player.poster(poster);
      if (src) player.src({ src, type: "video/mp4" });
    }

    return () => {
      // ✅ Proper cleanup
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
}
