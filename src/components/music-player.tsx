'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Play, Pause, Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';

type MusicPlayerProps = {
  audioData: string; // base64 encoded wav
};

export function MusicPlayer({ audioData }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => setIsLoading(false);
    const handleTimeUpdate = () => {
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      audio.currentTime = 0;
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // If audio is already loaded in cache
    if (audio.readyState >= 3) {
      handleCanPlay();
    }

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <audio ref={audioRef} src={`data:audio/wav;base64,${audioData}`} preload="auto" />
      <Button onClick={togglePlay} size="icon" className="rounded-full flex-shrink-0" disabled={isLoading} variant="secondary">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
        <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
      </Button>
      <Progress value={progress} className="flex-1 h-2" />
    </div>
  );
}
