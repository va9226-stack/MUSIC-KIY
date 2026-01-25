'use client';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { GeneratedMusicList } from '@/components/generated-music-list';
import { Header } from '@/components/header';
import { MusicGenerator } from '@/components/music-generator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Song } from '@/lib/types';

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
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const songsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/songs`);
  }, [user, firestore]);

  const { data: songs, isLoading: areSongsLoading } =
    useCollection<Song>(songsQuery);

  const handleSongGenerated = async (
    songData: Omit<Song, 'id' | 'createdAt'>
  ) => {
    if (!user || !firestore) {
      toast({
        title: 'Please login to save songs',
        description: 'You need to be logged in to save your generated music.',
        variant: 'destructive',
      });
      return;
    }

    const songWithTimestamp = {
      ...songData,
      createdAt: serverTimestamp(),
    };

    addDoc(
      collection(firestore, `users/${user.uid}/songs`),
      songWithTimestamp
    ).catch((error) => {
      console.error('Error saving song: ', error);
      toast({
        title: 'Failed to save song',
        description: 'There was an error saving your music to your library.',
        variant: 'destructive',
      });
    });
  };

  const isLoading = isUserLoading || areSongsLoading;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-12">
        <MusicGenerator onSongGenerated={handleSongGenerated} user={user} />

        <div className="space-y-6">
          <h2 className="text-3xl font-headline font-bold text-center md:text-left">
            Your Generated Library
          </h2>
          {isLoading ? (
            <LibrarySkeleton />
          ) : (
            <GeneratedMusicList songs={songs || []} />
          )}
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-muted-foreground border-t bg-card">
        <p>Powered by Harmonic AI &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
