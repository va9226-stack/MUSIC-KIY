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
import { Separator } from './ui/separator';

const genres = ['jazz', 'pop', 'rock', 'electronic', 'classical', 'hip-hop', 'country', 'reggae', 'blues', 'folk', 'ambient', 'techno'];

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
    <div className="relative max-w-3xl mx-auto">
      <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-20 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <Card className="relative bg-card/80 backdrop-blur-md border-border/30 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 pb-2">
            Forge a New Creation
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">Let KIY compose a unique piece based on your chosen style.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 pt-4">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-3 text-left">
              <Label htmlFor="lyrics" className="text-lg font-headline font-semibold">1. Write Lyrics (Optional)</Label>
              <Textarea
                id="lyrics"
                placeholder="In the city of chrome and code..."
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="min-h-[120px] text-base bg-background/50"
              />
            </div>
            <div className="space-y-6">
                <div className="space-y-3 text-left">
                  <h3 className="text-lg font-headline font-semibold">2. Choose a Voice</h3>
                    <RadioGroup
                      defaultValue="male"
                      onValueChange={setVoice}
                      value={voice}
                      className="flex gap-6 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" className="h-5 w-5" />
                        <Label htmlFor="male" className="text-base cursor-pointer">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" className="h-5 w-5" />
                        <Label htmlFor="female" className="text-base cursor-pointer">Female</Label>
                      </div>
                    </RadioGroup>
                </div>
            </div>
          </div>

          <Separator className="bg-border/20"/>

          <div className="space-y-4 text-center">
            <h3 className="text-lg font-headline font-semibold">3. Select a Genre</h3>
            <GenreSelector genres={genres} selectedGenre={selectedGenre} onSelectGenre={setSelectedGenre} />
          </div>

          <Button
            size="lg"
            className="w-full font-bold text-xl h-14 rounded-xl transition-all duration-300 bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/40 transform hover:-translate-y-1"
            onClick={handleGenerate}
            disabled={isLoading || !selectedGenre || !user}
            aria-live="polite"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Forging in the Crucible...
              </>
            ) : (
              <>
                <Wand2 className="mr-3 h-6 w-6" />
                Generate with KIY
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
