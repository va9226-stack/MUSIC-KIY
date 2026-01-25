'use server';

import { generateMusicFromGenre } from '@/ai/flows/generate-music-from-genre';
import { displayMusicWithAICuration } from '@/ai/flows/display-music-with-ai-curation';
import type { Song } from '@/lib/types';

export async function generateSongAction(genre: string): Promise<Omit<Song, 'id' | 'createdAt'>> {
  try {
    const { musicDataBase64 } = await generateMusicFromGenre({ genre });

    // The AI flow for curation expects an image data URI.
    // We provide a transparent 1x1 pixel PNG as a placeholder.
    // The AI will decide if an image is even worth showing.
    const imageAsDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    // Provide some dummy audio features for the AI to curate.
    const curatedInfo = await displayMusicWithAICuration({
      songTitle: `Untitled ${genre} Track`,
      genreTags: [genre],
      audioFeatures: {
        tempo: Math.floor(Math.random() * 60) + 90, // 90-150 BPM
        mood: ['Uplifting', 'Melancholic', 'Energetic', 'Calm'][Math.floor(Math.random() * 4)],
        key: ['C', 'G', 'D', 'A', 'E'][Math.floor(Math.random() * 5)] + ' ' + ['Major', 'Minor'][Math.floor(Math.random() * 2)],
      },
      imageDataUri: imageAsDataUri,
    });

    return {
      genre,
      audioData: musicDataBase64,
      curatedInfo,
    };
  } catch (error) {
    console.error('Error generating song:', error);
    throw new Error('Failed to generate song. Please try again.');
  }
}
