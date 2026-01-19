# Test Recipient Files

## Files Created

Two test files with 25 recipients each have been created:

1. **`public/test-recipients.csv`** - CSV format (2.4 KB)
2. **`public/test-recipients.xlsx`** - Excel format (8.8 KB)

## File Locations

Both files are located in the `public/` directory:
- `/public/test-recipients.csv`
- `/public/test-recipients.xlsx`

## File Format

Both files contain the same 25 test recipients with the following columns:

### Required Columns
- `first_name` - First name
- `last_name` - Last name
- `address1` - Street address
- `city` - City name
- `state` - 2-letter state abbreviation (IL, NY, CA, etc.)
- `zip` - ZIP code (5 digits)

### Optional Columns
- `company` - Company name
- `address2` - Secondary address (suite, floor, unit, etc.)
- `gift_message` - Personal gift message

## Test Data Details

- **25 recipients** across various US cities
- **Diverse names** for realistic testing
- **Various address formats** including suites, floors, units, and buildings
- **Different states** (IL, NY, CA, MA, WA, FL, AZ, TX, CO, GA, OR, PA, NC, IN, OH, TN, MD, WI, NM)
- **Valid ZIP codes** in 5-digit format
- **Gift messages** included for most recipients

## Usage

### Testing CSV Upload
1. Navigate to `/recipients` page
2. Click "browse to upload" or drag-and-drop
3. Select `test-recipients.csv`
4. Verify all 25 recipients are imported correctly

### Testing Excel Upload
1. Navigate to `/recipients` page
2. Click "browse to upload" or drag-and-drop
3. Select `test-recipients.xlsx`
4. Verify all 25 recipients are imported correctly

## Sample Recipients

1. John Smith - Acme Corporation - Chicago, IL
2. Sarah Johnson - Tech Solutions Inc - New York, NY
3. Michael Brown - Global Industries - Los Angeles, CA
4. Emily Davis - Creative Designs LLC - San Francisco, CA
5. David Wilson - Marketing Pro - Boston, MA
... (20 more)

## Notes

- All recipients have valid US addresses
- State codes are 2-letter abbreviations
- ZIP codes are in standard 5-digit format
- Some recipients have address2 fields (suites, floors, units)
- All recipients have gift messages
- Files are ready for immediate testing

## Accessing Files

The files are in the `public/` directory, so they can be accessed via:
- CSV: `http://localhost:3000/test-recipients.csv`
- Excel: `http://localhost:3000/test-recipients.xlsx`

Or navigate to the `public/` folder in your file system.
