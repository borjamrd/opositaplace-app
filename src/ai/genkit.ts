import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash-lite',
});

export const aiGemini3 = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-3-pro-preview',
});
