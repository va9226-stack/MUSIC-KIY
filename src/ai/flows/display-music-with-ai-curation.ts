'use server';

/**
 * @fileOverview AI-powered music display curation flow.
 *
 * This file defines a Genkit flow that uses AI to pick the most important features
 * of a generated song and decide whether to incorporate them into the UI display.
 *
 * - displayMusicWithAICuration - The main function that orchestrates the curation process.
 * - DisplayMusicWithAICurationInput - The input type for the displayMusicWithAICuration function.
 * - DisplayMusicWithAICurationOutput - The return type for the displayMusicWithAICuration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const DisplayMusicWithAICurationInputSchema = z.object({
  songTitle: z.string().describe('The title of the generated song.'),
  genreTags: z.array(z.string()).describe('An array of genre tags associated with the song.'),
  audioFeatures: z.record(z.any()).describe('A record containing various audio features of the song (e.g., tempo, key, mood).'),
  imageDataUri: z.string().describe("The image associated with the song, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type DisplayMusicWithAICurationInput = z.infer<typeof DisplayMusicWithAICurationInputSchema>;

// Define the output schema
const DisplayMusicWithAICurationOutputSchema = z.object({
  titleIncluded: z.boolean().describe('Whether the song title should be included in the display.'),
  displayedTags: z.array(z.string()).describe('An array of genre tags to be displayed.'),
  highlightedFeatures: z.record(z.any()).describe('A record of audio features to be highlighted in the display.'),
  imageIncluded: z.boolean().describe('Whether the image should be included in the display.'),
});
export type DisplayMusicWithAICurationOutput = z.infer<typeof DisplayMusicWithAICurationOutputSchema>;

// Define the main function
export async function displayMusicWithAICuration(input: DisplayMusicWithAICurationInput): Promise<DisplayMusicWithAICurationOutput> {
  return displayMusicWithAICurationFlow(input);
}

// Define the prompt
const curationPrompt = ai.definePrompt({
  name: 'curationPrompt',
  input: {schema: DisplayMusicWithAICurationInputSchema},
  output: {schema: DisplayMusicWithAICurationOutputSchema},
  prompt: `You are an AI-powered music curation expert. Your task is to analyze a generated song and decide which of its features are most important to display to the user.

  Here's information about the song:
  Title: {{{songTitle}}}
  Genre Tags: {{#each genreTags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Audio Features: {{JSONstringify audioFeatures}}
  Image: {{media url=imageDataUri}}

  Based on this information, decide:
  - Should the song title be included in the display? (titleIncluded: true/false)
  - Which genre tags are most relevant to display? (displayedTags: array of strings)
  - Which audio features should be highlighted? (highlightedFeatures: record)
  - Should the image be included? (imageIncluded: true/false)

  Respond with a JSON object that includes these fields. Be concise and only include the most important information for the user. Focus on features that make this song unique and interesting.
`,
});

// Define the flow
const displayMusicWithAICurationFlow = ai.defineFlow(
  {
    name: 'displayMusicWithAICurationFlow',
    inputSchema: DisplayMusicWithAICurationInputSchema,
    outputSchema: DisplayMusicWithAICurationOutputSchema,
  },
  async input => {
    const {output} = await curationPrompt(input);
    return output!;
  }
);
