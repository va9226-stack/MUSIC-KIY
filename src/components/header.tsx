import { Music2 } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="container mx-auto px-4 py-4 flex items-center gap-3">
        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
          <Music2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-headline font-bold text-foreground">
          Harmonic AI
        </h1>
      </div>
    </header>
  );
}
