'use server';
/**
 * @fileOverview An AI flow for removing the background from an image.
 *
 * - removeBackground - A function that handles the background removal process.
 * - BackgroundRemoverInput - The input type for the removeBackground function.
 * - BackgroundRemoverOutput - The return type for the removeBackground function.
 */

import { z } from 'genkit';
import FormData from 'form-data';

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
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    throw new Error(
      'REMOVE_BG_API_KEY is not configured. Please add it to your .env file.'
    );
  }

  const base64Data = input.photoDataUri.split(',')[1];
  const imageBuffer = Buffer.from(base64Data, 'base64');

  const formData = new FormData();
  formData.append('image_file', imageBuffer, 'image.jpg');
  formData.append('size', 'auto');

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      ...formData.getHeaders(),
      'X-Api-Key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.statusText} - ${errorText}`);
  }

  const resultBuffer = await response.arrayBuffer();
  const resultBase64 = Buffer.from(resultBuffer).toString('base64');

  return {
    imageWithBackgroundRemoved: `data:image/png;base64,${resultBase64}`,
  };
}
