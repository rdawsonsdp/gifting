// Test Excel generation
const { generateRecipientExcel } = require('./lib/excel-generator.ts');
const fs = require('fs');

const testData = {
  draftOrderNumber: '#D157',
  buyerInfo: {
    name: 'Jane Buyer',
    company: 'Acme Corp',
    email: 'jane@acme.com',
    phone: '555-1234',
  },
  products: [
    {
      product: {
        id: '1',
        title: 'Sea Salt Caramels',
        price: 24.95,
      },
      quantity: 2,
    },
  ],
  recipients: [
    {
      id: 'rec1',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Test Company',
      address1: '123 Test St',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      isValid: true,
      errors: [],
    },
  ],
  pricing: {
    giftSubtotal: 49.90,
    fulfillmentSubtotal: 8.00,
    total: 57.90,
    perRecipientFee: 8.00,
  },
  tier: 'Gold',
};

async function test() {
  try {
    console.log('Generating Excel...');
    const buffer = await generateRecipientExcel(testData);
    console.log('Excel generated successfully!');
    console.log('Buffer size:', buffer.length, 'bytes');
    
    // Save to file for inspection
    fs.writeFileSync('/tmp/test-order.xlsx', buffer);
    console.log('Excel saved to /tmp/test-order.xlsx');
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
