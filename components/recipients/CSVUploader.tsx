'use client';

import { useCallback, useState } from 'react';
import { Recipient } from '@/lib/types';
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

  const isValidFileType = (fileName: string): boolean => {
    const lowerName = fileName.toLowerCase();
    return lowerName.endsWith('.csv') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');
  };

  const processFile = useCallback(async (file: File) => {
    setUploading(true);
    onError(''); // Clear previous errors

    if (!isValidFileType(file.name)) {
      onError('Please upload a comma separated text file (.csv) or Excel file (.xls, .xlsx).');
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-recipients', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        onError(data.error || 'Failed to parse file');
        setUploading(false);
        return;
      }

      if (data.recipients && data.recipients.length > 0) {
        onUpload(data.recipients);
      } else {
        onError('No valid recipients found in file. Please check the format.');
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to process file');
      console.error('Error processing file:', error);
    } finally {
      setUploading(false);
    }
  }, [onUpload, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && isValidFileType(file.name)) {
      processFile(file);
    } else {
      onError('Please upload a comma separated text file (.csv) or Excel file (.xls, .xlsx).');
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
      <h2 className="text-lg sm:text-xl font-bold text-[#E98D3D] mb-3 sm:mb-4 font-[var(--font-playfair)]">
        Upload Recipient List
      </h2>
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 sm:p-8 text-center
          ${isDragging ? 'border-[#E98D3D] bg-[#E6E6FA]/30' : 'border-[#8B7355]/30'}
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
            <p className="text-sm sm:text-base text-[#333333]">Processing file...</p>
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
              Drag and drop your recipient list file here, or
            </p>
            <label className="cursor-pointer">
              <span className="text-[#E98D3D] font-semibold hover:text-[#D67A2E] text-sm sm:text-base">
                browse to upload
              </span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-xs sm:text-sm text-[#8B7355] mt-3 sm:mt-4">
              Comma separated text file (.csv) or Excel file (.xls, .xlsx) supported
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
          Download Template File
        </Button>
        <p className="text-xs text-[#8B7355] mt-2 text-center">
          Template can be opened in Excel, Google Sheets, or any spreadsheet application
        </p>
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
