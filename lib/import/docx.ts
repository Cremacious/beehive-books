import 'server-only';

export async function convertDocxFileToHtml(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ buffer: Buffer.from(arrayBuffer) });
  return result.value;
}
