'use client';
import type { Song } from '@/lib/types';
import { MusicCard } from './music-card';
import { FileQuestion } from 'lucide-react';

type GeneratedMusicListProps = {
  songs: Song[];
  onSongDeleted: (songId: string) => void;
};

export function GeneratedMusicList({ songs, onSongDeleted }: GeneratedMusicListProps) {
  const sortedSongs = [...songs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (sortedSongs.length === 0) {
    return (
      <div className="text-center py-16 px-6 border-2 border-dashed rounded-xl mt-8">
          <div className="mx-auto bg-muted text-muted-foreground rounded-full h-16 w-16 flex items-center justify-center">
            <FileQuestion className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-headline font-semibold">No Music Generated Yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the generator above to create your first AI-powered song.
          </p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {sortedSongs.map(song => (
        <MusicCard key={song.id} song={song} onSongDeleted={onSongDeleted} />
      ))}
    </div>
  );
}
