const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Test recipient data
const recipients = [
  { first_name: 'John', last_name: 'Smith', company: 'Acme Corporation', address1: '123 Main Street', address2: 'Suite 100', city: 'Chicago', state: 'IL', zip: '60601', gift_message: 'Thank you for your partnership!' },
  { first_name: 'Sarah', last_name: 'Johnson', company: 'Tech Solutions Inc', address1: '456 Oak Avenue', address2: '', city: 'New York', state: 'NY', zip: '10001', gift_message: 'Happy Holidays!' },
  { first_name: 'Michael', last_name: 'Brown', company: 'Global Industries', address1: '789 Pine Road', address2: 'Building B', city: 'Los Angeles', state: 'CA', zip: '90001', gift_message: 'Looking forward to working together' },
  { first_name: 'Emily', last_name: 'Davis', company: 'Creative Designs LLC', address1: '321 Elm Street', address2: 'Floor 3', city: 'San Francisco', state: 'CA', zip: '94102', gift_message: 'Best wishes for the new year' },
  { first_name: 'David', last_name: 'Wilson', company: 'Marketing Pro', address1: '654 Maple Drive', address2: '', city: 'Boston', state: 'MA', zip: '02101', gift_message: 'Thank you for your continued support' },
  { first_name: 'Jessica', last_name: 'Miller', company: 'Finance Group', address1: '987 Cedar Lane', address2: 'Unit 5', city: 'Seattle', state: 'WA', zip: '98101', gift_message: 'Appreciate your business' },
  { first_name: 'Christopher', last_name: 'Moore', company: 'Consulting Co', address1: '147 Birch Court', address2: '', city: 'Miami', state: 'FL', zip: '33101', gift_message: 'Happy New Year!' },
  { first_name: 'Amanda', last_name: 'Taylor', company: 'Sales Force Inc', address1: '258 Spruce Way', address2: 'Suite 200', city: 'Phoenix', state: 'AZ', zip: '85001', gift_message: 'Thank you for everything' },
  { first_name: 'James', last_name: 'Anderson', company: 'Development Corp', address1: '369 Willow Street', address2: '', city: 'Dallas', state: 'TX', zip: '75201', gift_message: 'Best regards' },
  { first_name: 'Michelle', last_name: 'Thomas', company: 'Operations LLC', address1: '741 Ash Avenue', address2: 'Building 2', city: 'Denver', state: 'CO', zip: '80201', gift_message: 'Looking forward to 2026' },
  { first_name: 'Robert', last_name: 'Jackson', company: 'Innovation Labs', address1: '852 Poplar Road', address2: '', city: 'Atlanta', state: 'GA', zip: '30301', gift_message: 'Thank you for your partnership' },
  { first_name: 'Lisa', last_name: 'White', company: 'Service Solutions', address1: '963 Hickory Lane', address2: 'Floor 4', city: 'Houston', state: 'TX', zip: '77001', gift_message: 'Happy Holidays!' },
  { first_name: 'Daniel', last_name: 'Harris', company: 'Quality Systems', address1: '159 Sycamore Drive', address2: '', city: 'Portland', state: 'OR', zip: '97201', gift_message: 'Best wishes' },
  { first_name: 'Jennifer', last_name: 'Martin', company: 'Strategic Partners', address1: '357 Chestnut Street', address2: 'Suite 300', city: 'Philadelphia', state: 'PA', zip: '19101', gift_message: 'Thank you for your support' },
  { first_name: 'Matthew', last_name: 'Thompson', company: 'Digital Media Co', address1: '468 Walnut Avenue', address2: '', city: 'San Diego', state: 'CA', zip: '92101', gift_message: 'Appreciate your business' },
  { first_name: 'Ashley', last_name: 'Garcia', company: 'Creative Agency', address1: '579 Cherry Lane', address2: 'Unit 10', city: 'Detroit', state: 'MI', zip: '48201', gift_message: 'Happy New Year!' },
  { first_name: 'Kevin', last_name: 'Martinez', company: 'Technology Group', address1: '680 Peach Street', address2: '', city: 'Minneapolis', state: 'MN', zip: '55401', gift_message: 'Best regards' },
  { first_name: 'Stephanie', last_name: 'Robinson', company: 'Marketing Solutions', address1: '791 Plum Court', address2: '', city: 'Charlotte', state: 'NC', zip: '28201', gift_message: 'Thank you for everything' },
  { first_name: 'Brian', last_name: 'Clark', company: 'Business Services', address1: '802 Apple Way', address2: 'Building 3', city: 'Indianapolis', state: 'IN', zip: '46201', gift_message: 'Looking forward to working together' },
  { first_name: 'Nicole', last_name: 'Rodriguez', company: 'Consulting Partners', address1: '913 Orange Drive', address2: '', city: 'Columbus', state: 'OH', zip: '43201', gift_message: 'Happy Holidays!' },
  { first_name: 'Ryan', last_name: 'Lewis', company: 'Development Team', address1: '124 Grape Street', address2: 'Suite 400', city: 'Fort Worth', state: 'TX', zip: '76101', gift_message: 'Thank you for your continued support' },
  { first_name: 'Lauren', last_name: 'Lee', company: 'Operations Group', address1: '235 Lemon Avenue', address2: '', city: 'Memphis', state: 'TN', zip: '38101', gift_message: 'Best wishes for the new year' },
  { first_name: 'Justin', last_name: 'Walker', company: 'Sales Team', address1: '346 Lime Road', address2: '', city: 'Baltimore', state: 'MD', zip: '21201', gift_message: 'Appreciate your business' },
  { first_name: 'Megan', last_name: 'Hall', company: 'Finance Department', address1: '457 Berry Lane', address2: 'Floor 5', city: 'Milwaukee', state: 'WI', zip: '53201', gift_message: 'Happy New Year!' },
  { first_name: 'Tyler', last_name: 'Allen', company: 'IT Solutions', address1: '568 Mango Court', address2: '', city: 'Albuquerque', state: 'NM', zip: '87101', gift_message: 'Thank you for your partnership!' },
];

async function createExcelFile() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Recipients');

  // Add headers
  worksheet.columns = [
    { header: 'first_name', key: 'first_name', width: 15 },
    { header: 'last_name', key: 'last_name', width: 15 },
    { header: 'company', key: 'company', width: 25 },
    { header: 'address1', key: 'address1', width: 25 },
    { header: 'address2', key: 'address2', width: 20 },
    { header: 'city', key: 'city', width: 15 },
    { header: 'state', key: 'state', width: 10 },
    { header: 'zip', key: 'zip', width: 10 },
    { header: 'gift_message', key: 'gift_message', width: 40 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE98D3D' }
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add data rows
  recipients.forEach(recipient => {
    worksheet.addRow(recipient);
  });

  // Save to public directory
  const publicDir = path.join(__dirname, '..', 'public');
  const filePath = path.join(publicDir, 'test-recipients.xlsx');
  
  await workbook.xlsx.writeFile(filePath);
  console.log(`✅ Created test-recipients.xlsx with ${recipients.length} recipients`);
  console.log(`   Location: ${filePath}`);
}

createExcelFile().catch(console.error);
