import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const EXCEL_FILES_DIR = join(process.cwd(), 'excel-files');
const VENDOR_DOCS_DIR = join(process.cwd(), 'vendor-docs');

/**
 * Ensure the excel-files directory exists
 */
async function ensureDirectoryExists(): Promise<void> {
  if (!existsSync(EXCEL_FILES_DIR)) {
    await mkdir(EXCEL_FILES_DIR, { recursive: true });
  }
}

/**
 * Ensure the vendor-docs directory exists
 */
async function ensureVendorDocsDirectoryExists(): Promise<void> {
  if (!existsSync(VENDOR_DOCS_DIR)) {
    await mkdir(VENDOR_DOCS_DIR, { recursive: true });
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

/**
 * Save vendor document to server filesystem
 * Returns the filename (not full path)
 */
export async function saveVendorDoc(
  fileBuffer: Buffer,
  filename: string
): Promise<string> {
  await ensureVendorDocsDirectoryExists();

  const filePath = join(VENDOR_DOCS_DIR, filename);
  await writeFile(filePath, fileBuffer);

  return filename;
}

/**
 * Get the public URL for a vendor document
 */
export function getVendorDocUrl(filename: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/api/vendor-docs/${filename}`;
}
