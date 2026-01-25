import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { MusicPlayer } from './music-player';
import { Badge } from './ui/badge';
import type { Song } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Clock, Tag, Music, BarChart, KeyRound } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function MoodIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </svg>
  );
}

type MusicCardProps = {
  song: Song;
};

export function MusicCard({ song }: MusicCardProps) {
  const { curatedInfo, audioData, createdAt, genre } = song;
  const placeholderImage = PlaceHolderImages.find(p => p.id === 'music-card-placeholder');

  return (
    <Card className="overflow-hidden transition-all hover:shadow-xl flex flex-col group">
      {curatedInfo.imageIncluded && placeholderImage && (
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={placeholderImage.imageUrl}
            alt={placeholderImage.description}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={placeholderImage.imageHint}
          />
        </div>
      )}
      <CardHeader>
        {curatedInfo.titleIncluded && <CardTitle className="font-headline capitalize">Untitled {genre} Track</CardTitle>}
        <CardDescription className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <Clock className="h-3 w-3" />
          <span>Generated {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col">
        <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize"><Music className="h-3 w-3 mr-1" />{genre}</Badge>
            {curatedInfo.displayedTags.map(tag => tag.toLowerCase() !== genre.toLowerCase() && (
                <Badge key={tag} variant="outline" className="capitalize">
                <Tag className="h-3 w-3 mr-1" /> {tag}
                </Badge>
            ))}
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {curatedInfo.highlightedFeatures.mood && (
                <div className="flex items-center gap-2">
                    <MoodIcon className="h-4 w-4 text-accent" />
                    <span>{curatedInfo.highlightedFeatures.mood}</span>
                </div>
            )}
            {curatedInfo.highlightedFeatures.tempo && (
                <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-accent" />
                    <span>{curatedInfo.highlightedFeatures.tempo} BPM</span>
                </div>
            )}
            {curatedInfo.highlightedFeatures.key && (
                <div className="flex items-center gap-2 col-span-2">
                    <KeyRound className="h-4 w-4 text-accent" />
                    <span>Key of {curatedInfo.highlightedFeatures.key}</span>
                </div>
            )}
        </div>

        <div className="mt-auto pt-4">
          <MusicPlayer audioData={audioData} />
        </div>
      </CardContent>
    </Card>
  );
}
