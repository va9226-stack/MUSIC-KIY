'use server';

/**
 * @fileOverview A music generation AI agent that generates songs based on user-selected genre tags.
 *
 * - generateMusicFromGenre - A function that handles the music generation process.
 * - GenerateMusicFromGenreInput - The input type for the generateMusicFromGenre function.
 * - GenerateMusicFromGenreOutput - The return type for the generateMusicFromGenre function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMusicFromGenreInputSchema = z.object({
  genre: z.string().describe('The genre of music to generate.'),
  lyrics: z.string().describe('The lyrics for the song.').optional(),
  voice: z.string().describe('The voice for the song (e.g., male, female).').optional(),
});
export type GenerateMusicFromGenreInput = z.infer<
  typeof GenerateMusicFromGenreInputSchema
>;

const GenerateMusicFromGenreOutputSchema = z.object({
  musicDataBase64: z
    .string()
    .describe('The generated music in base64 encoded WAV format.'),
});
export type GenerateMusicFromGenreOutput = z.infer<
  typeof GenerateMusicFromGenreOutputSchema
>;

export async function generateMusicFromGenre(
  input: GenerateMusicFromGenreInput
): Promise<GenerateMusicFromGenreOutput> {
  return generateMusicFromGenreFlow(input);
}

// Helper function to create a WAV file buffer from PCM data
function pcmToWavBuffer(
  pcmData: Buffer,
  channels: number,
  sampleRate: number,
  bitDepth: number
): Buffer {
  const byteRate = sampleRate * channels * (bitDepth / 8);
  const blockAlign = channels * (bitDepth / 8);
  const dataSize = pcmData.length;
  const riffSize = 36 + dataSize;

  const header = Buffer.alloc(44);
  let offset = 0;

  // RIFF header
  header.write('RIFF', offset);
  offset += 4;
  header.writeUInt32LE(riffSize, offset);
  offset += 4;
  header.write('WAVE', offset);
  offset += 4;

  // "fmt " sub-chunk
  header.write('fmt ', offset);
  offset += 4;
  header.writeUInt32LE(16, offset);
  offset += 4; // Sub-chunk size (16 for PCM)
  header.writeUInt16LE(1, offset);
  offset += 2; // Audio format (1 for PCM)
  header.writeUInt16LE(channels, offset);
  offset += 2;
  header.writeUInt32LE(sampleRate, offset);
  offset += 4;
  header.writeUInt32LE(byteRate, offset);
  offset += 4;
  header.writeUInt16LE(blockAlign, offset);
  offset += 2;
  header.writeUInt16LE(bitDepth, offset);
  offset += 2;

  // "data" sub-chunk
  header.write('data', offset);
  offset += 4;
  header.writeUInt32LE(dataSize, offset);
  offset += 4;

  return Buffer.concat([header, pcmData]);
}


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  const bitDepth = sampleWidth * 8;
  const wavBuffer = pcmToWavBuffer(pcmData, channels, rate, bitDepth);
  return wavBuffer.toString('base64');
}

const generateMusicFromGenreFlow = ai.defineFlow(
  {
    name: 'generateMusicFromGenreFlow',
    inputSchema: GenerateMusicFromGenreInputSchema,
    outputSchema: GenerateMusicFromGenreOutputSchema,
  },
  async input => {
    const voiceConfig = input.voice === 'female'
      ? { prebuiltVoiceConfig: { voiceName: 'Achernar' } }
      : { prebuiltVoiceConfig: { voiceName: 'Algenib' } };
    
    const promptText = input.lyrics || `A short, instrumental piece in the style of ${input.genre}`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      prompt: promptText,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: voiceConfig,
        },
      },
    });

    if (!media) {
      throw new Error('No media returned from audio generation.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const musicDataBase64 = await toWav(audioBuffer);

    return {musicDataBase64};
  }
);
