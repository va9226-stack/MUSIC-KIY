'use server';

/**
 * @fileOverview A KIY motion engine that determines a song's "net force" and "resolved style" based on various inputs.
 * This translates the metaphorical physics from the user's lore into the music creation process.
 *
 * - kiyMotionEngine - The main function that runs the simulation.
 * - KiyMotionEngineInput - The input type.
 * - KiyMotionEngineOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KiyMotionEngineInputSchema = z.object({
  genre: z.string().describe('The primary genre selected by the user.'),
  lyrics: z.string().describe('The lyrics provided by the user.').optional(),
  title: z.string().describe('The title provided by the user.').optional(),
});
export type KiyMotionEngineInput = z.infer<typeof KiyMotionEngineInputSchema>;

const KiyMotionEngineOutputSchema = z.object({
  resolvedStyle: z
    .string()
    .describe(
      "The final musical style determined by resolving all metaphorical 'forces'."
    ),
  contributingForces: z.array(z.object({
    source: z.string(),
    magnitude: z.number(),
    targetRegion: z.string(),
  })).describe("A list of all forces that were part of the calculation.")
});
export type KiyMotionEngineOutput = z.infer<typeof KiyMotionEngineOutputSchema>;

export async function kiyMotionEngine(input: KiyMotionEngineInput): Promise<KiyMotionEngineOutput> {
  return kiyMotionEngineFlow(input);
}

// This flow is a direct translation of the Python logic provided by the user.
// It runs locally and does not call an LLM.
const kiyMotionEngineFlow = ai.defineFlow(
  {
    name: 'kiyMotionEngineFlow',
    inputSchema: KiyMotionEngineInputSchema,
    outputSchema: KiyMotionEngineOutputSchema,
  },
  async ({ genre, lyrics, title }) => {
    const forces: { source: string; magnitude: number; targetRegion: string }[] = [];

    // --- Transmuted Force Plugins ---

    // 1. Gravity Well: The strongest pull, representing the user's chosen genre.
    forces.push({ source: "Gravity Well", magnitude: 10, targetRegion: genre });
    
    // 2. Will: The user's creative intent expressed through title and lyrics.
    if (title || lyrics) {
      let willMagnitude = 5;
      if (title) willMagnitude += 2;
      if (lyrics && lyrics.length > 50) willMagnitude += 5;
      if (lyrics && lyrics.includes('[Chorus]')) willMagnitude += 3;
      forces.push({ source: "Will", magnitude: willMagnitude, targetRegion: genre });
    }

    // 3. Moon/Phase Flow: A contextual, creative force.
    const phases = [
      { name: "Reflection", tag: "Atmospheric" },
      { name: "Crescendo", tag: "Energetic" },
      { name: "Stillness", tag: "Minimalist" },
      { name: "Eclipse", tag: "Experimental" },
    ];
    const activePhase = phases[Math.floor(Math.random() * phases.length)];
    forces.push({ source: `Moon Phase (${activePhase.name})`, magnitude: 7, targetRegion: activePhase.tag });

    // 4. Sun: A constant, foundational force.
    forces.push({ source: "Sun", magnitude: 2, targetRegion: "Melodic" });

    // --- Resolve Forces ---
    // The highest magnitude wins, determining the "resolved style".
    const netForce = forces.reduce((strongest, current) => {
        return (current.magnitude > strongest.magnitude) ? current : strongest;
    }, forces[0] || { source: "None", magnitude: 0, targetRegion: genre });

    return {
      resolvedStyle: netForce.targetRegion,
      contributingForces: forces,
    };
  }
);
