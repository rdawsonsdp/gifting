import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local BEFORE importing other modules
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

async function main() {
  // Dynamic import after env is loaded
  const { sendOrderConfirmationEmail } = await import('../lib/email');

  // Test data
  const testBuyerInfo = {
    name: 'Robert Dawson',
    email: 'rdawson@strategicdataproducts.com',
    phone: '312-555-1234',
    company: 'Strategic Data Products',
    deliveryDate: '2026-02-14',
    notes: 'Please include gift tags with company logo.',
  };

  const testProducts = [
    {
      product: {
        id: '1',
        title: 'Caramel Pecan Turtles - 12 Pack',
        price: 24.99,
        image: '',
        description: 'Handcrafted caramel pecan turtles',
        tier: 'gold',
      },
      quantity: 25,
    },
    {
      product: {
        id: '2',
        title: 'Assorted Cookie Box - 24 Pack',
        price: 32.99,
        image: '',
        description: 'Assorted freshly baked cookies',
        tier: 'gold',
      },
      quantity: 25,
    },
    {
      product: {
        id: '3',
        title: 'Chocolate Brownie Bites - 18 Pack',
        price: 28.99,
        image: '',
        description: 'Rich chocolate brownie bites',
        tier: 'gold',
      },
      quantity: 25,
    },
  ];

  const testRecipients = Array.from({ length: 25 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Recipient ${i + 1}`,
    email: `recipient${i + 1}@example.com`,
    address: '123 Main St',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
  }));

  const testDeliveryMethod = {
    id: 'one-location',
    name: 'One-Location Delivery',
    description: 'All gifts delivered to one address',
    price: 0,
  };

  const testPricing = {
    giftSubtotal: 2174.25,
    fulfillmentSubtotal: 40.00,
    total: 2214.25,
    perRecipientFee: 1.60,
  };

  console.log('Sending test email to rdawson@strategicdataproducts.com...');
  console.log('SMTP Config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER ? '***configured***' : 'NOT SET',
    pass: process.env.SMTP_PASS ? '***configured***' : 'NOT SET',
  });

  const result = await sendOrderConfirmationEmail(
    testBuyerInfo as any,
    'BSB-TEST-001',
    'test-order-id',
    'https://brownsugarbakerychicago.com/invoice/test',
    testProducts as any,
    testRecipients as any,
    testPricing,
    'Gold',
    undefined,
    undefined,
    testDeliveryMethod as any
  );

  if (result.success) {
    console.log('✅ Test email sent successfully!');
  } else {
    console.error('❌ Failed to send test email:', result.error);
  }
}

main().catch(console.error);
