"use client";

import { useEffect, useRef } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

interface Props {
  url: string;
}

export default function VideoPlayer({ url }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = new Plyr(videoRef.current, {
      controls: [
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "fullscreen",
      ],
      settings: ["speed"],
      speed: { selected: 1, options: [0.5, 1, 1.25, 1.5, 2] },
    });

    return () => {
      player.destroy();
    };
  }, []);

  return (
    <div className="aspect-video w-full h-full overflow-hidden rounded-xl">
      <video ref={videoRef} className="plyr-react" controls>
        <source src={url} type="video/mp4" />
      </video>
    </div>
  );
}
