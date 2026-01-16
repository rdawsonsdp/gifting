import { z } from 'zod';
import { Recipient } from './types';

// US State abbreviations
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

// Zod schema for recipient validation
export const recipientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2-letter abbreviation').refine(
    (val) => US_STATES.includes(val.toUpperCase()),
    'Invalid US state abbreviation'
  ),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'ZIP must be 5 digits or 5+4 format'),
  gift_message: z.string().max(200, 'Gift message must be 200 characters or less').optional(),
});

export type RecipientRow = z.infer<typeof recipientSchema>;

export function validateRecipient(row: Record<string, string>): {
  recipient: Recipient | null;
  errors: string[];
} {
  const errors: string[] = [];
  
  try {
    const validated = recipientSchema.parse({
      first_name: row.first_name || row['First Name'] || '',
      last_name: row.last_name || row['Last Name'] || '',
      company: row.company || row['Company'] || '',
      address1: row.address1 || row['Address 1'] || row.address || '',
      address2: row.address2 || row['Address 2'] || '',
      city: row.city || row['City'] || '',
      state: (row.state || row['State'] || '').toUpperCase(),
      zip: row.zip || row['ZIP'] || row['Zip Code'] || '',
      gift_message: row.gift_message || row['Gift Message'] || '',
    });

    const recipient: Recipient = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: validated.first_name,
      lastName: validated.last_name,
      company: validated.company || undefined,
      address1: validated.address1,
      address2: validated.address2 || undefined,
      city: validated.city,
      state: validated.state,
      zip: validated.zip,
      giftMessage: validated.gift_message || undefined,
      isValid: true,
      errors: [],
    };

    return { recipient, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((e) => {
        const field = e.path.join('.');
        return `${field}: ${e.message}`;
      });
      return { recipient: null, errors: errorMessages };
    }
    return { recipient: null, errors: ['Invalid row format'] };
  }
}

export function parseCSV(csvText: string): Record<string, string>[] {
  // Simple CSV parser (Papa Parse will be used in component)
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}
