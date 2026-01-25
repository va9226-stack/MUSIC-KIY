'use client';

import { useState } from 'react';
import { generateSongAction } from '@/app/actions';
import { GenreSelector } from './genre-selector';
import { Button } from './ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import type { Song } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { User } from 'firebase/auth';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const genres = ['jazz', 'pop', 'rock', 'electronic', 'classical', 'hip-hop', 'country', 'reggae', 'blues', 'folk'];

type MusicGeneratorProps = {
  onSongGenerated: (song: Omit<Song, 'id' | 'createdAt'>) => void;
  user: User | null;
};

export function MusicGenerator({ onSongGenerated, user }: MusicGeneratorProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState('');
  const [voice, setVoice] = useState('male');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to generate and save music.",
        variant: "destructive",
      });
      return;
    }
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
      const newSongData = await generateSongAction(selectedGenre, lyrics, voice);
      onSongGenerated(newSongData);
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
      <CardContent className="space-y-8">
        <div className="space-y-3 text-center">
          <h3 className="text-lg font-headline font-semibold">1. Write Your Lyrics (Optional)</h3>
          <Textarea 
            placeholder="In the city of chrome and code..."
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-3 text-center">
          <h3 className="text-lg font-headline font-semibold">2. Select a Genre</h3>
          <GenreSelector genres={genres} selectedGenre={selectedGenre} onSelectGenre={setSelectedGenre} />
        </div>

        <div className="space-y-3 text-center">
          <h3 className="text-lg font-headline font-semibold">3. Choose a Voice</h3>
            <RadioGroup
              defaultValue="male"
              onValueChange={setVoice}
              value={voice}
              className="flex justify-center gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="text-base cursor-pointer">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="text-base cursor-pointer">Female</Label>
              </div>
            </RadioGroup>
        </div>

        <Button
          size="lg"
          className="w-full font-bold text-lg h-12"
          onClick={handleGenerate}
          disabled={isLoading || !selectedGenre || !user}
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
