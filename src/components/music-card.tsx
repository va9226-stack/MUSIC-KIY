import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import { MusicPlayer } from './music-player';
import { Badge } from './ui/badge';
import type { Song } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Clock,
  Tag,
  Music,
  BarChart,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Button } from './ui/button';

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
  onSongDeleted: (songId: string) => void;
};

export function MusicCard({ song, onSongDeleted }: MusicCardProps) {
  const { id, curatedInfo, audioData, createdAt, genre, title } = song;
  const placeholderImage = PlaceHolderImages.find(
    (p) => p.id === 'music-card-placeholder'
  );

  return (
    <Card className="overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/20 flex flex-col group bg-card/50 backdrop-blur-sm border-border/50 hover:-translate-y-1">
      {curatedInfo.imageIncluded && placeholderImage && (
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={placeholderImage.imageUrl}
            alt={placeholderImage.description}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={placeholderImage.imageHint}
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div>
            {curatedInfo.titleIncluded && (
              <CardTitle className="font-headline capitalize text-2xl">
                {title}
              </CardTitle>
            )}
            <CardDescription className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <Clock className="h-3 w-3" />
              <span>
                Generated{' '}
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </span>
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete song</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this song from your library.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onSongDeleted(id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow flex flex-col">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize bg-primary/20 text-primary-foreground border-primary/50">
            <Music className="h-3 w-3 mr-1" />
            {genre}
          </Badge>
          {curatedInfo.displayedTags.map(
            (tag) =>
              tag.toLowerCase() !== genre.toLowerCase() && (
                <Badge key={tag} variant="outline" className="capitalize">
                  <Tag className="h-3 w-3 mr-1" /> {tag}
                </Badge>
              )
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-foreground/80">
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
