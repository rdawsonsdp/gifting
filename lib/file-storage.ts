import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const EXCEL_FILES_DIR = join(process.cwd(), 'excel-files');

/**
 * Ensure the excel-files directory exists
 */
async function ensureDirectoryExists(): Promise<void> {
  if (!existsSync(EXCEL_FILES_DIR)) {
    await mkdir(EXCEL_FILES_DIR, { recursive: true });
  }
}

/**
 * Save Excel file to server filesystem
 * Returns the filename (not full path)
 */
export async function saveExcelFile(
  fileBuffer: Buffer,
  filename: string
): Promise<string> {
  await ensureDirectoryExists();
  
  const filePath = join(EXCEL_FILES_DIR, filename);
  await writeFile(filePath, fileBuffer);
  
  return filename; // Return just the filename, not the full path
}

/**
 * Get the public URL for an Excel file
 */
export function getExcelFileUrl(filename: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/api/excel/${filename}`;
}
