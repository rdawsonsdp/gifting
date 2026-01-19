# Excel File Storage Implementation

## ✅ Implementation Complete

Excel files are now saved to the server and linked in Shopify draft order notes.

## How It Works

### 1. File Storage
- Excel files are saved to `excel-files/` directory in the project root
- Directory is automatically created if it doesn't exist
- Files are named: `Corporate_Gift_Order_[OrderNumber]_[Date].xlsx`
- Example: `Corporate_Gift_Order_D172_2026-01-19.xlsx`

### 2. File Serving
- API route: `/api/excel/[filename]`
- Serves Excel files with proper headers:
  - `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `Content-Disposition: attachment; filename="..."`
- Security: Only allows `.xlsx` files, prevents directory traversal

### 3. Shopify Integration
- Excel URL is added to draft order note
- Format: `📎 Excel Recipient List: [URL]`
- Also stored in custom attributes:
  - `excel_filename`: Filename
  - `excel_file_url`: Full URL

## File Structure

```
gifting/
├── excel-files/              # Excel files directory (gitignored)
│   └── Corporate_Gift_Order_*.xlsx
├── lib/
│   └── file-storage.ts       # File save/URL generation
├── app/
│   └── api/
│       └── excel/
│           └── [filename]/
│               └── route.ts  # File serving endpoint
```

## Configuration

### Environment Variable
Set `NEXT_PUBLIC_BASE_URL` in `.env.local`:

```env
# For local development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# For production
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Git Ignore
The `excel-files/` directory is automatically added to `.gitignore` to prevent committing Excel files.

## Usage Flow

1. **Order Creation**
   - Customer places order
   - Excel file is generated
   - File is saved to `excel-files/` directory
   - URL is generated: `{BASE_URL}/api/excel/{filename}`

2. **Shopify Integration**
   - Excel URL is appended to draft order note
   - URL is stored in custom attributes
   - Staff can click the link in Shopify admin

3. **File Access**
   - Staff clicks link in draft order note
   - File downloads automatically
   - File remains on server for future access

## Testing

### Test Order Creation
```bash
./test-order-creation.sh
```

Expected response:
```json
{
  "success": true,
  "draftOrderId": "...",
  "draftOrderNumber": "#D172",
  "excelFileUrl": "http://localhost:3000/api/excel/Corporate_Gift_Order_D172_2026-01-19.xlsx",
  "excelError": null
}
```

### Verify File Exists
```bash
ls -lh excel-files/
```

### Test File Download
```bash
curl -O "http://localhost:3000/api/excel/Corporate_Gift_Order_D172_2026-01-19.xlsx"
```

## Benefits

✅ **Simple**: No external services required  
✅ **Reliable**: Files stored on server  
✅ **Accessible**: Direct download links  
✅ **Integrated**: Links in Shopify notes  
✅ **Secure**: API route validates filenames  

## Production Considerations

1. **File Cleanup**: Consider implementing a cleanup job to remove old Excel files
2. **Storage**: Monitor disk space usage
3. **Backup**: Include `excel-files/` in backup strategy
4. **Base URL**: Ensure `NEXT_PUBLIC_BASE_URL` is set correctly for production

## Files Modified

- ✅ `lib/file-storage.ts` - File save/URL functions
- ✅ `app/api/excel/[filename]/route.ts` - File serving endpoint
- ✅ `lib/shopify.ts` - Added `appendExcelUrlToDraftOrderNote()` function
- ✅ `app/api/create-draft-order/route.ts` - Updated to save files and update notes
- ✅ `.gitignore` - Added `excel-files/` directory

## Status

🎉 **Fully Functional**

All features working:
- ✅ Excel generation
- ✅ File storage
- ✅ File serving
- ✅ Shopify note integration
- ✅ Custom attributes
