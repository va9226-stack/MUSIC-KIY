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
  title: z.string().describe('The title of the song.').optional(),
  genre: z.string().describe('The genre of music to generate.'),
  lyrics: z
    .string()
    .describe(
      'The lyrics for the song, with structure tags like [Verse], [Chorus].'
    )
    .optional(),
  voice: z
    .string()
    .describe('The main voice for the song (e.g., male, female).')
    .optional(),
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

// Helper function to create a WAV file buffer from PCM data using the 'wav' package
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

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

function processLyricsForTTS(
  lyrics: string,
  mainVoice: 'male' | 'female'
): {prompt: string; useMultiSpeaker: boolean} {
  if (!lyrics || !lyrics.includes('[')) {
    return {prompt: lyrics || '', useMultiSpeaker: false};
  }

  const mainSpeaker = 'Speaker1';
  const secondarySpeaker = 'Speaker2';
  let multiSpeakerPrompt = '';

  // Split by tags, keeping the tags.
  const sections = lyrics.split(/(\[[a-zA-Z]+\])/).filter(p => p.trim() !== '');

  let currentSpeaker = mainSpeaker;
  let hasStructure = false;

  for (const section of sections) {
    if (section.startsWith('[') && section.endsWith(']')) {
      hasStructure = true;
      const tag = section.slice(1, -1).toLowerCase();
      // Assign speaker based on tag. Chorus and Hook get the secondary voice.
      currentSpeaker =
        tag === 'chorus' || tag === 'hook' || tag === 'bridge'
          ? secondarySpeaker
          : mainSpeaker;
    } else {
      multiSpeakerPrompt += `${currentSpeaker}: ${section.trim()}\n`;
    }
  }

  if (!hasStructure) return {prompt: lyrics, useMultiSpeaker: false};

  return {prompt: multiSpeakerPrompt.trim(), useMultiSpeaker: true};
}

const generateMusicFromGenreFlow = ai.defineFlow(
  {
    name: 'generateMusicFromGenreFlow',
    inputSchema: GenerateMusicFromGenreInputSchema,
    outputSchema: GenerateMusicFromGenreOutputSchema,
  },
  async input => {
    const mainVoiceSelection = input.voice === 'female' ? 'female' : 'male';

    const {prompt: promptText, useMultiSpeaker} = processLyricsForTTS(
      input.lyrics ||
        `A short, instrumental piece in the style of ${input.genre}`,
      mainVoiceSelection
    );

    let speechConfig: any;

    if (useMultiSpeaker) {
      const mainVoiceName =
        mainVoiceSelection === 'female' ? 'Achernar' : 'Algenib';
      const secondaryVoiceName =
        mainVoiceSelection === 'female' ? 'Algenib' : 'Achernar'; // The other voice
      speechConfig = {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: 'Speaker1',
              voiceConfig: {
                prebuiltVoiceConfig: {voiceName: mainVoiceName},
              },
            },
            {
              speaker: 'Speaker2',
              voiceConfig: {
                prebuiltVoiceConfig: {voiceName: secondaryVoiceName},
              },
            },
          ],
        },
      };
    } else {
      speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: mainVoiceSelection === 'female' ? 'Achernar' : 'Algenib',
          },
        },
      };
    }

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      prompt: promptText,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: speechConfig,
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
