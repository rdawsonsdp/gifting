import twilio from 'twilio';

// Twilio configuration - set these in .env.local
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

/**
 * Check if SMS is configured
 */
export function isSmsConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}

/**
 * Format phone number to E.164 format for Twilio
 * Assumes US numbers if no country code provided
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If already has country code (11 digits starting with 1), use as-is
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // If 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // Return with + prefix if looks like international
  if (digits.length > 10) {
    return `+${digits}`;
  }

  // Return original if can't parse
  return phone;
}

/**
 * Send SMS with invoice link to customer
 */
export async function sendInvoiceSms(
  phoneNumber: string,
  customerName: string,
  orderNumber: string,
  invoiceUrl: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  if (!isSmsConfigured()) {
    console.warn('SMS not configured. Skipping text notification.');
    return { success: false, error: 'SMS not configured' };
  }

  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const formattedPhone = formatPhoneNumber(phoneNumber);

    const message = await client.messages.create({
      body: `Hi ${customerName}! Thank you for your Brown Sugar Bakery corporate gifting order (${orderNumber}). View and pay your invoice here: ${invoiceUrl}\n\nQuestions? Call 773-570-7676 or email brownsugarbakery75@gmail.com`,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(`SMS sent successfully to ${formattedPhone}, SID: ${message.sid}`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending SMS:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
