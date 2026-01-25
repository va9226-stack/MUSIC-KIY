'use server';

import { generateMusicFromGenre } from '@/ai/flows/generate-music-from-genre';
import { displayMusicWithAICuration } from '@/ai/flows/display-music-with-ai-curation';
import { kiyMotionEngine } from '@/ai/flows/kiy-motion-engine';
import type { Song } from '@/lib/types';

export async function generateSongAction(
  title: string,
  genre: string,
  lyrics: string,
  voice: string
): Promise<Omit<Song, 'id' | 'createdAt'>> {
  try {
    // Step 1: Generate the audio from lyrics and voice
    const { musicDataBase64 } = await generateMusicFromGenre({ title, genre, lyrics, voice });

    // Step 2: Run the KIY Motion Engine to determine the resolved style
    const { resolvedStyle } = await kiyMotionEngine({ genre, title, lyrics });

    // The AI flow for curation expects an image data URI.
    // We provide a transparent 1x1 pixel PNG as a placeholder.
    // The AI will decide if an image is even worth showing.
    const imageAsDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    const songTitle = title || `Untitled ${genre} Track`;
    
    // Combine original genre with the resolved style for a richer context
    const allTags = Array.from(new Set([genre, resolvedStyle]));

    // Step 3: Use AI to curate the display, now with the context from the motion engine.
    const curatedInfo = await displayMusicWithAICuration({
      songTitle: songTitle,
      genreTags: allTags, // Pass combined tags
      audioFeatures: {
        tempo: Math.floor(Math.random() * 60) + 90, // 90-150 BPM
        mood: ['Uplifting', 'Melancholic', 'Energetic', 'Calm'][Math.floor(Math.random() * 4)],
        key: ['C', 'G', 'D', 'A', 'E'][Math.floor(Math.random() * 5)] + ' ' + ['Major', 'Minor'][Math.floor(Math.random() * 2)],
        resolvedStyle: resolvedStyle, // Pass the resolved style as a feature
      },
      imageDataUri: imageAsDataUri,
    });

    return {
      title: songTitle,
      genre,
      audioData: musicDataBase64,
      curatedInfo,
    };
  } catch (error) {
    console.error('Error generating song:', error);
    throw new Error('Failed to generate song. Please try again.');
  }
}
