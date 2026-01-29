import { NextRequest, NextResponse } from 'next/server';
import { saveVendorDoc, getVendorDocUrl } from '@/lib/file-storage';

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function isAllowedFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const results: { filename: string; url: string }[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        errors.push('Invalid file entry');
        continue;
      }

      if (!isAllowedFile(file.name)) {
        errors.push(`${file.name}: unsupported file type. Allowed: PDF, DOC, DOCX, PNG, JPG`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: exceeds 10MB limit`);
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      // Prefix with timestamp to avoid collisions
      const safeFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      await saveVendorDoc(buffer, safeFilename);
      const url = getVendorDocUrl(safeFilename);

      results.push({ filename: file.name, url });
    }

    if (results.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { error: errors.join('; ') },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      files: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error uploading vendor docs:', error);
    return NextResponse.json(
      { error: 'Failed to upload vendor documents' },
      { status: 500 }
    );
  }
}
