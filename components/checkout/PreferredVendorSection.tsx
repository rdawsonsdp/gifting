'use client';

import { useCallback, useState } from 'react';
import Card from '@/components/ui/Card';

export interface VendorDoc {
  filename: string;
  url: string;
}

interface PreferredVendorSectionProps {
  vendorDocs: VendorDoc[];
  vendorNotes: string;
  onDocsChange: (docs: VendorDoc[]) => void;
  onNotesChange: (notes: string) => void;
}

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function isAllowedFile(name: string): boolean {
  const lower = name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export default function PreferredVendorSection({
  vendorDocs,
  vendorNotes,
  onDocsChange,
  onNotesChange,
}: PreferredVendorSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setUploading(true);
      setError(null);

      // Validate locally first
      const invalid = files.filter((f) => !isAllowedFile(f.name));
      if (invalid.length > 0) {
        setError(
          `Unsupported file type: ${invalid.map((f) => f.name).join(', ')}. Allowed: PDF, DOC, DOCX, PNG, JPG.`
        );
        setUploading(false);
        return;
      }

      const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
      if (oversized.length > 0) {
        setError(
          `File too large: ${oversized.map((f) => f.name).join(', ')}. Maximum size is 10MB.`
        );
        setUploading(false);
        return;
      }

      try {
        const formData = new FormData();
        files.forEach((f) => formData.append('files', f));

        const response = await fetch('/api/upload-vendor-docs', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to upload documents');
          setUploading(false);
          return;
        }

        if (data.files && data.files.length > 0) {
          onDocsChange([...vendorDocs, ...data.files]);
        }

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join('; '));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        console.error('Vendor doc upload error:', err);
      } finally {
        setUploading(false);
      }
    },
    [vendorDocs, onDocsChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        uploadFiles(files);
      }
    },
    [uploadFiles]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      uploadFiles(files);
    }
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const removeDoc = (index: number) => {
    onDocsChange(vendorDocs.filter((_, i) => i !== index));
  };

  return (
    <Card hover={false} className="border-[#E98D3D]/30 bg-[#FFF8F0]">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl" aria-hidden="true">
          📋
        </span>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#E98D3D] font-[var(--font-playfair)]">
            Let Us Be Your Preferred Vendor
          </h2>
          <p className="text-xs sm:text-sm text-[#8B7355] mt-1">
            Optional — Many organizations require vendor registration paperwork.
            Upload your forms here and we&apos;ll take care of the rest.
          </p>
        </div>
      </div>

      {/* File upload area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-5 sm:p-6 text-center
          ${isDragging ? 'border-[#E98D3D] bg-[#E6E6FA]/30' : 'border-[#8B7355]/30 bg-white/60'}
          transition-colors duration-200
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E98D3D] mb-2"></div>
            <p className="text-sm text-[#333333]">Uploading...</p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-9 w-9 sm:h-10 sm:w-10 text-[#8B7355] mb-2"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-[#333333] mb-1">
              Drag &amp; drop vendor documents here, or{' '}
              <label className="cursor-pointer">
                <span className="text-[#E98D3D] font-semibold hover:text-[#D67A2E]">
                  browse to upload
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-[#8B7355]">
              PDF, DOC, DOCX, PNG, JPG — up to 10MB each
            </p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs sm:text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Uploaded files list */}
      {vendorDocs.length > 0 && (
        <div className="mt-3 space-y-2">
          {vendorDocs.map((doc, index) => (
            <div
              key={`${doc.filename}-${index}`}
              className="flex items-center justify-between bg-white border border-[#8B7355]/20 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg
                  className="w-4 h-4 text-[#E98D3D] flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm text-[#333333] truncate">
                  {doc.filename}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeDoc(index)}
                className="ml-2 text-[#8B7355] hover:text-red-600 transition-colors flex-shrink-0"
                aria-label={`Remove ${doc.filename}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Notes textarea */}
      <div className="mt-4">
        <label
          htmlFor="vendor-notes"
          className="block text-sm font-medium text-[#333333] mb-1"
        >
          Notes / Special Instructions{' '}
          <span className="text-[#8B7355] font-normal">(optional)</span>
        </label>
        <textarea
          id="vendor-notes"
          value={vendorNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          placeholder="Any instructions for vendor registration, required forms, PO numbers, etc."
          className="w-full border border-[#8B7355]/30 rounded-lg px-3 py-2 text-sm text-[#333333] placeholder-[#8B7355]/50 focus:outline-none focus:ring-2 focus:ring-[#E98D3D]/50 focus:border-[#E98D3D] resize-y"
        />
      </div>
    </Card>
  );
}
