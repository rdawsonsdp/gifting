import * as XLSX from 'xlsx';
import { Recipient } from './types';
import { validateRecipient } from './csv-utils';

/**
 * Parse Excel file (xlsx, xls) and convert to recipient array
 * Uses xlsx library (SheetJS) which supports both .xlsx and .xls formats
 */
export async function parseExcelFile(fileBuffer: Buffer, fileName: string): Promise<Recipient[]> {
  const lowerName = fileName.toLowerCase();
  
  if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls')) {
    throw new Error('Unsupported Excel file format');
  }

  // Parse workbook using xlsx library (supports both .xls and .xlsx)
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

  // Get the first worksheet
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Excel file must contain at least one worksheet');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert worksheet to JSON array (first row becomes headers)
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1, // Use first row as headers
    defval: '', // Default value for empty cells
    raw: false, // Convert all values to strings
  }) as any[][];

  if (jsonData.length === 0) {
    throw new Error('Excel file is empty');
  }

  // First row contains headers
  const headers = (jsonData[0] || []).map((h: any) => String(h).trim());
  
  if (headers.length === 0 || headers.every((h: string) => !h)) {
    throw new Error('Excel file must have headers in the first row');
  }

  // Parse data rows
  const recipients: Recipient[] = [];
  const errors: string[] = [];

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue; // Skip empty rows

    // Build row object from cells
    const rowData: Record<string, string> = {};
    headers.forEach((header, colIndex) => {
      if (header) {
        const value = row[colIndex];
        rowData[header] = value ? String(value).trim() : '';
      }
    });

    // Skip if row is completely empty
    if (Object.values(rowData).every(v => !v)) continue;

    // Validate and convert to recipient
    const { recipient, errors: rowErrors } = validateRecipient(rowData);
    if (recipient) {
      recipients.push(recipient);
    } else {
      errors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`);
    }
  }

  if (recipients.length === 0) {
    throw new Error('No valid recipients found in Excel file. Please check the format.');
  }

  if (errors.length > 0) {
    console.warn('Some rows had errors:', errors);
  }

  return recipients;
}
