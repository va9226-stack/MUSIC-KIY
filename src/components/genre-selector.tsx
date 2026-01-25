'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type GenreSelectorProps = {
  genres: string[];
  selectedGenre: string | null;
  onSelectGenre: (genre: string) => void;
};

export function GenreSelector({ genres, selectedGenre, onSelectGenre }: GenreSelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {genres.map((genre) => (
        <Button
          key={genre}
          variant={selectedGenre === genre ? 'default' : 'outline'}
          className={cn(
            "capitalize rounded-full transition-all duration-300 transform text-base px-5 py-3 h-auto",
            selectedGenre === genre 
              ? "bg-primary text-primary-foreground scale-105 shadow-lg shadow-primary/30"
              : "border-border/50 bg-card/50 hover:bg-primary/20 hover:border-primary/50 hover:text-primary-foreground hover:scale-105"
          )}
          onClick={() => onSelectGenre(genre)}
        >
          {genre}
        </Button>
      ))}
    </div>
  );
}
