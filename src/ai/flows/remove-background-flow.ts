'use server';
/**
 * @fileOverview An AI flow for removing the background from an image.
 *
 * - removeBackground - A function that handles the background removal process.
 * - BackgroundRemoverInput - The input type for the removeBackground function.
 * - BackgroundRemoverOutput - The return type for the removeBackground function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BackgroundRemoverInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the subject, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type BackgroundRemoverInput = z.infer<
  typeof BackgroundRemoverInputSchema
>;

const BackgroundRemoverOutputSchema = z.object({
  imageWithBackgroundRemoved: z
    .string()
    .describe(
      "The generated image with the background removed, as a PNG with a transparent background. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type BackgroundRemoverOutput = z.infer<
  typeof BackgroundRemoverOutputSchema
>;

export async function removeBackground(
  input: BackgroundRemoverInput
): Promise<BackgroundRemoverOutput> {
  return removeBackgroundFlow(input);
}

const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: BackgroundRemoverInputSchema,
    outputSchema: BackgroundRemoverOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {
          media: {
            url: input.photoDataUri,
          },
        },
        {
          text: `You are an expert image editor specializing in removing backgrounds.

          Your task is to take the user's uploaded image and remove the background completely.
        
          - The subject should be cleanly isolated.
          - The output must be a PNG image.
          - The background of the output image must be transparent.`,
        },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    if (!media?.url) {
      throw new Error('The model did not return an image.');
    }

    return {
      imageWithBackgroundRemoved: media.url,
    };
  }
);
