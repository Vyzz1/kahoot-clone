// src/hooks/useBackgroundMusic.ts
import { useEffect, useRef } from "react";

const useBackgroundMusic = (src: string, volume = 1.0, loop = true) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.volume = volume;
    audioRef.current.loop = loop;

    const handleUserInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
      window.removeEventListener("click", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.removeEventListener("click", handleUserInteraction);
    };
  }, [src, volume, loop]);

  return audioRef;
};

export default useBackgroundMusic;
