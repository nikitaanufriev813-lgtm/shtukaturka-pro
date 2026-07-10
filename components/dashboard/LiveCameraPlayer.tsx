"use client";

import { useEffect, useRef, useState } from "react";

export function LiveCameraPlayer({ playbackId }: { playbackId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hlsUrl = `https://stream.mux.com/${playbackId}.m3u8`;

    // Safari умеет HLS нативно, для остальных браузеров нужен hls.js
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      setIsLive(true);
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => setIsLive(true));
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) setError("Трансляция сейчас недоступна");
          });
        } else {
          setError("Ваш браузер не поддерживает просмотр трансляции");
        }
      });
    }
  }, [playbackId]);

  return (
    <div className="card overflow-hidden p-0">
      <div className="relative aspect-video bg-black">
        <video ref={videoRef} controls autoPlay muted playsInline className="h-full w-full" />
        {isLive && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-danger/90 px-2.5 py-1 text-xs font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            LIVE
          </span>
        )}
      </div>
      {error && <p className="p-4 text-sm text-danger">{error}</p>}
    </div>
  );
}
