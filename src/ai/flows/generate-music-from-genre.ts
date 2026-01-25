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
import wav from 'wav';

const GenerateMusicFromGenreInputSchema = z.object({
  genre: z.string().describe('The genre of music to generate.'),
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

const prompt = ai.definePrompt({
  name: 'generateMusicFromGenrePrompt',
  input: {schema: GenerateMusicFromGenreInputSchema},
  output: {schema: GenerateMusicFromGenreOutputSchema},
  prompt: `You are a music generation AI. Generate a song in the style of the following genre: {{{genre}}}. Return the song in a format suitable for audio playback.

Follow these instructions strictly:
1.  The response MUST be encoded as a WAV file.
2.  The WAV file MUST be encoded as base64.
3.  The output must be assigned to the 'musicDataBase64' field.`,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateMusicFromGenreFlow = ai.defineFlow(
  {
    name: 'generateMusicFromGenreFlow',
    inputSchema: GenerateMusicFromGenreInputSchema,
    outputSchema: GenerateMusicFromGenreOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      prompt: input.genre,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
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
