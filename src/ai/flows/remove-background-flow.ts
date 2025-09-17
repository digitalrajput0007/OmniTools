/**
 * @fileOverview A client-side flow for removing the background from an image.
 *
 * - removeBackground - A function that handles the background removal process using HTML Canvas.
 * - BackgroundRemoverInput - The input type for the removeBackground function.
 * - BackgroundRemoverOutput - The return type for the removeBackground function.
 */

import { z } from 'genkit';

export const BackgroundRemoverInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the subject, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  tolerance: z
    .number()
    .min(0)
    .max(255)
    .default(30)
    .describe('Color similarity tolerance for background removal.'),
});
export type BackgroundRemoverInput = z.infer<
  typeof BackgroundRemoverInputSchema
>;

export const BackgroundRemoverOutputSchema = z.object({
  imageWithBackgroundRemoved: z
    .string()
    .describe(
      "The generated image with the background removed, as a PNG with a transparent background. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type BackgroundRemoverOutput = z.infer<
  typeof BackgroundRemoverOutputSchema
>;

// This function now runs entirely on the client side.
export async function removeBackground(
  input: BackgroundRemoverInput
): Promise<BackgroundRemoverOutput> {
  return new Promise((resolve, reject) => {
    const { photoDataUri, tolerance } = input;
    const image = new Image();
    image.src = photoDataUri;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Could not get canvas context.'));
      }

      ctx.drawImage(image, 0, 0);

      // Get the color of the top-left pixel as the background color
      const pixelData = ctx.getImageData(0, 0, 1, 1).data;
      const bgR = pixelData[0];
      const bgG = pixelData[1];
      const bgB = pixelData[2];

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate color difference
        const diff = Math.sqrt(
          Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
        );

        if (diff < tolerance) {
          // Set pixel to transparent
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const resultDataUri = canvas.toDataURL('image/png');

      resolve({ imageWithBackgroundRemoved: resultDataUri });
    };

    image.onerror = () => {
      reject(new Error('Failed to load image for processing.'));
    };
  });
}
