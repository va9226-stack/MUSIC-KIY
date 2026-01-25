'use client';

import { useState } from 'react';
import { generateSongAction } from '@/app/actions';
import { GenreSelector } from './genre-selector';
import { Button } from './ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import type { Song } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const genres = ['jazz', 'pop', 'rock', 'electronic', 'classical', 'hip-hop'];

type MusicGeneratorProps = {
  onSongGenerated: (song: Song) => void;
};

export function MusicGenerator({ onSongGenerated }: MusicGeneratorProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!selectedGenre) {
      toast({
        title: "Select a genre",
        description: "Please pick a genre before generating music.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const newSongData = await generateSongAction(selectedGenre);
      const newSong: Song = {
        ...newSongData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      onSongGenerated(newSong);
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">Create New Music</CardTitle>
        <CardDescription>Let our AI compose a unique piece based on your chosen style.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-lg font-headline font-semibold text-center">1. Select a Genre</h3>
          <GenreSelector genres={genres} selectedGenre={selectedGenre} onSelectGenre={setSelectedGenre} />
        </div>
        <Button
          size="lg"
          className="w-full font-bold text-lg h-12"
          onClick={handleGenerate}
          disabled={isLoading || !selectedGenre}
          aria-live="polite"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Generate with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
