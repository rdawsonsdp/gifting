import { NextRequest, NextResponse } from 'next/server';
import { parseExcelFile } from '@/lib/excel-parser';
import Papa from 'papaparse';
import { Recipient } from '@/lib/types';
import { validateRecipient } from '@/lib/csv-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    let recipients: Recipient[] = [];

    // Handle Excel files (.xlsx, .xls)
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      recipients = await parseExcelFile(fileBuffer, file.name);
    }
    // Handle CSV files
    else if (fileName.endsWith('.csv')) {
      const csvText = fileBuffer.toString('utf-8');
      
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              const validatedRecipients: Recipient[] = [];
              const errors: string[] = [];

              results.data.forEach((row: any, index: number) => {
                const { recipient, errors: rowErrors } = validateRecipient(row);
                if (recipient) {
                  validatedRecipients.push(recipient);
                } else {
                  errors.push(`Row ${index + 2}: ${rowErrors.join(', ')}`);
                }
              });

              if (validatedRecipients.length === 0) {
                resolve(NextResponse.json(
                  { error: 'No valid recipients found in CSV. Please check the format.' },
                  { status: 400 }
                ));
              } else {
                resolve(NextResponse.json({ recipients: validatedRecipients }));
              }
            } catch (error) {
              resolve(NextResponse.json(
                { error: 'Failed to parse CSV file. Please ensure it\'s a valid CSV format.' },
                { status: 400 }
              ));
            }
          },
          error: (error) => {
            resolve(NextResponse.json(
              { error: `CSV parsing error: ${error.message}` },
              { status: 400 }
            ));
          },
        });
      });
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a CSV, XLS, or XLSX file.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ recipients });
  } catch (error) {
    console.error('Error parsing file:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to parse file',
      },
      { status: 500 }
    );
  }
}
