import type { DisplayMusicWithAICurationOutput } from "@/ai/flows/display-music-with-ai-curation";

export interface Song {
  id: string;
  title: string;
  genre: string;
  audioData: string; // base64 encoded wav
  curatedInfo: DisplayMusicWithAICurationOutput;
  createdAt: string;
}
