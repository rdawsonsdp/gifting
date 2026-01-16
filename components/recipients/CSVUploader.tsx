'use client';

import { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { Recipient } from '@/lib/types';
import { validateRecipient } from '@/lib/csv-utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface CSVUploaderProps {
  onUpload: (recipients: Recipient[]) => void;
  onError: (error: string) => void;
}

export default function CSVUploader({ onUpload, onError }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const processFile = useCallback((file: File) => {
    setUploading(true);
    
    Papa.parse(file, {
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
            onError('No valid recipients found in CSV. Please check the format.');
          } else {
            onUpload(validatedRecipients);
            if (errors.length > 0) {
              console.warn('Some rows had errors:', errors);
            }
          }
        } catch (error) {
          onError('Failed to parse CSV file. Please ensure it\'s a valid CSV format.');
          console.error(error);
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        onError(`CSV parsing error: ${error.message}`);
        setUploading(false);
      },
    });
  }, [onUpload, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv' || file.name.endsWith('.csv')) {
      processFile(file);
    } else {
      onError('Please upload a CSV file.');
    }
  }, [processFile, onError]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/template.csv';
    link.download = 'recipient-template.csv';
    link.click();
  };

  return (
    <Card>
      <h2 className="text-lg sm:text-xl font-bold text-[#5D4037] mb-3 sm:mb-4 font-[var(--font-playfair)]">
        Upload Recipient List
      </h2>
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 sm:p-8 text-center
          ${isDragging ? 'border-[#5D4037] bg-[#E6E6FA]/30' : 'border-[#8B7355]/30'}
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D4037] mb-2"></div>
            <p className="text-sm sm:text-base text-[#333333]">Processing CSV...</p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-[#8B7355] mb-3 sm:mb-4"
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
            <p className="text-sm sm:text-base text-[#333333] mb-2">
              Drag and drop your CSV file here, or
            </p>
            <label className="cursor-pointer">
              <span className="text-[#5D4037] font-semibold hover:text-[#4A3329] text-sm sm:text-base">
                browse to upload
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-xs sm:text-sm text-[#8B7355] mt-3 sm:mt-4">
              CSV format required
            </p>
          </>
        )}
      </div>

      <div className="mt-4 sm:mt-6">
        <Button
          variant="secondary"
          onClick={handleDownloadTemplate}
          className="w-full"
        >
          Download CSV Template
        </Button>
      </div>

      <Alert variant="info" className="mt-3 sm:mt-4">
        <p className="text-xs sm:text-sm">
          <strong>Required columns:</strong> first_name, last_name, address1, city, state, zip
          <br />
          <strong>Optional columns:</strong> company, address2, gift_message (max 200 characters)
          <br />
          <strong>State format:</strong> Use 2-letter abbreviation (e.g., IL, NY, CA)
        </p>
      </Alert>
    </Card>
  );
}
