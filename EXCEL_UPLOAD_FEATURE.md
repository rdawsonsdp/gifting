# Excel File Upload Support

## ✅ Implementation Complete

The application now supports uploading recipient lists in **CSV, XLS, and XLSX** formats.

## Supported File Formats

- ✅ **CSV** (.csv) - Comma-separated values
- ✅ **XLSX** (.xlsx) - Excel 2007+ format
- ✅ **XLS** (.xls) - Legacy Excel format

## How It Works

### 1. File Upload Component
- Updated `CSVUploader` component to accept multiple file types
- File input accepts: `.csv,.xlsx,.xls`
- Drag-and-drop support for all formats
- Visual feedback during file processing

### 2. Server-Side Parsing
- New API endpoint: `/api/parse-recipients`
- Handles file parsing server-side for security
- Uses `xlsx` library (SheetJS) for Excel file parsing
- Uses `papaparse` for CSV parsing (existing)

### 3. File Processing Flow

```
User uploads file
    ↓
CSVUploader component validates file type
    ↓
File sent to /api/parse-recipients
    ↓
Server detects file type (.csv, .xlsx, .xls)
    ↓
File parsed using appropriate library
    ↓
Data validated and converted to Recipient format
    ↓
Recipients returned to client
    ↓
Recipients added to recipient list
```

## File Format Requirements

### Required Columns
- `first_name` (or `First Name`)
- `last_name` (or `Last Name`)
- `address1` (or `Address 1` or `address`)
- `city` (or `City`)
- `state` (or `State`) - 2-letter abbreviation (e.g., IL, NY, CA)
- `zip` (or `ZIP` or `Zip Code`) - 5 digits or 5+4 format

### Optional Columns
- `company` (or `Company`)
- `address2` (or `Address 2`)
- `gift_message` (or `Gift Message`) - Max 200 characters

### Excel File Format
- First row must contain column headers
- Data starts from second row
- Empty rows are skipped
- Multiple worksheets supported (uses first worksheet)

## Technical Implementation

### Files Created
- `lib/excel-parser.ts` - Excel file parsing logic
- `app/api/parse-recipients/route.ts` - API endpoint for file parsing

### Files Modified
- `components/recipients/CSVUploader.tsx` - Updated to support Excel files
- `app/recipients/page.tsx` - Updated UI text

### Dependencies Added
- `xlsx` - Excel file parsing library (SheetJS)
- `@types/xlsx` - TypeScript types

## Usage

1. Navigate to the Recipients page
2. Click "browse to upload" or drag-and-drop a file
3. Select a CSV, XLS, or XLSX file
4. File is processed automatically
5. Valid recipients are added to the list
6. Invalid rows are skipped (with warnings)

## Error Handling

- Invalid file types are rejected with clear error messages
- Empty files show appropriate error
- Missing headers are detected and reported
- Invalid recipient data is skipped with row-level error messages
- File parsing errors are caught and displayed to user

## Benefits

✅ **Flexibility**: Users can upload files in their preferred format  
✅ **Compatibility**: Supports both modern (.xlsx) and legacy (.xls) Excel formats  
✅ **Security**: File parsing happens server-side  
✅ **Validation**: Same validation rules apply to all file types  
✅ **User-Friendly**: Clear error messages and visual feedback  

## Testing

To test the feature:
1. Create a CSV, XLSX, or XLS file with recipient data
2. Navigate to `/recipients` page
3. Upload the file
4. Verify recipients are parsed correctly
5. Check for any validation errors

## Notes

- Excel files use the first worksheet only
- Column headers are case-insensitive and support multiple formats
- Empty rows are automatically skipped
- Duplicate detection works across all file formats
