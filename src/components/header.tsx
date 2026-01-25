import { Music2 } from 'lucide-react';
import { AuthButton } from './auth-button';

export function Header() {
  return (
    <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-lg z-20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-lg shadow-primary/30">
            <Music2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold text-foreground">
              KIY
            </h1>
            <p className="text-xs text-muted-foreground tracking-wider">The Goddess of Rhythm and Motion</p>
          </div>
        </div>
        <AuthButton />
      </div>
    </header>
  );
}
