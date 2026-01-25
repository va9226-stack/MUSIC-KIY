'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { MusicGenerator } from '@/components/music-generator';
import { GeneratedMusicList } from '@/components/generated-music-list';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Song } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function LibrarySkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-video w-full" />
          <div className="space-y-2 px-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-2 px-2">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}


export default function Home() {
  const [songs, setSongs] = useLocalStorage<Song[]>('harmonic-ai-songs', []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSongGenerated = (song: Song) => {
    setSongs(prevSongs => [song, ...prevSongs]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-12">
        <MusicGenerator onSongGenerated={handleSongGenerated} />
        
        <div className="space-y-6">
          <h2 className="text-3xl font-headline font-bold text-center md:text-left">Your Generated Library</h2>
          {isClient ? <GeneratedMusicList songs={songs} /> : <LibrarySkeleton />}
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-muted-foreground border-t bg-card">
        <p>Powered by Harmonic AI &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
