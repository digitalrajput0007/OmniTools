'use server';

import pdf from 'pdf-parse';

export async function extractText(formData: FormData) {
  const file = formData.get('file') as File | null;

  if (!file) {
    throw new Error('No file uploaded.');
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);

    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse the PDF file. It might be corrupt or protected.');
  }
}
