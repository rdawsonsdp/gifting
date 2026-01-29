import ExcelJS from 'exceljs';
import { SelectedProduct, Recipient, BuyerInfo, DeliveryMethod } from './types';

export interface OrderData {
  draftOrderNumber: string;
  buyerInfo: BuyerInfo;
  products: SelectedProduct[];
  recipients: Recipient[];
  pricing: {
    giftSubtotal: number;
    fulfillmentSubtotal: number;
    shippingCost?: number;
    total: number;
    perRecipientFee: number;
    discountCode?: string;
    discountAmount?: number;
  };
  tier: string;
  deliveryMethod?: DeliveryMethod;
  vendorNotes?: string;
}

export async function generateRecipientExcel(orderData: OrderData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const { draftOrderNumber, buyerInfo, products, recipients, pricing, tier, deliveryMethod, vendorNotes } = orderData;

  // Sheet 1: Order Summary
  const summarySheet = workbook.addWorksheet('Order Summary');
  summarySheet.columns = [
    { header: 'Field Name', key: 'field', width: 25 },
    { header: 'Value', key: 'value', width: 40 },
  ];

  // Style header row
  summarySheet.getRow(1).font = { bold: true, size: 12 };
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD4AF37' }, // Gold color
  };
  summarySheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

  // Format delivery date for Excel
  const deliveryDateFormatted = buyerInfo.deliveryDate 
    ? new Date(buyerInfo.deliveryDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Not specified';

  // Check if this is a shipped order
  const isShippedOrder = deliveryMethod && deliveryMethod.id !== 'one-location';

  // Add order summary data
  const summaryData = [
    { field: 'Order Number', value: draftOrderNumber },
    { field: 'Order Date', value: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) },
    { field: 'Buyer Name', value: buyerInfo.name },
    { field: 'Buyer Company', value: buyerInfo.company },
    { field: 'Buyer Email', value: buyerInfo.email },
    { field: 'Buyer Phone', value: buyerInfo.phone },
    { field: 'Delivery Date', value: deliveryDateFormatted },
    { field: 'Delivery Method', value: deliveryMethod?.name || 'One-Location Delivery' },
    ...(buyerInfo.notes ? [{ field: 'Order Notes', value: buyerInfo.notes }] : []),
    ...(vendorNotes ? [{ field: 'Vendor Notes', value: vendorNotes }] : []),
    { field: 'Tier', value: tier },
    { field: 'Total Recipients', value: recipients.length.toString() },
    { field: 'Gift Subtotal', value: `$${pricing.giftSubtotal.toFixed(2)}` },
    ...(!isShippedOrder && pricing.fulfillmentSubtotal > 0 ? [{ field: `Delivery Fee (${recipients.length < 500 ? '< 500' : recipients.length < 1500 ? '500-1,499' : '1,500+'} recipients)`, value: `$${pricing.fulfillmentSubtotal.toFixed(2)}` }] : []),
    ...(isShippedOrder && pricing.shippingCost ? [{ field: `Shipping (${deliveryMethod.name})`, value: `$${pricing.shippingCost.toFixed(2)}` }] : []),
    ...(pricing.discountCode && pricing.discountAmount ? [{ field: `Discount (${pricing.discountCode})`, value: `-$${pricing.discountAmount.toFixed(2)}` }] : []),
    { field: 'Order Total', value: `$${pricing.total.toFixed(2)}` },
  ];

  summarySheet.addRows(summaryData);

  // Style data rows
  summarySheet.getColumn(1).font = { bold: true };
  summarySheet.getColumn(2).alignment = { horizontal: 'left' };

  // Sheet 2: Products
  const productsSheet = workbook.addWorksheet('Products');
  productsSheet.columns = [
    { header: 'Product Name', key: 'name', width: 40 },
    { header: 'Quantity per Recipient', key: 'quantity', width: 22 },
    { header: 'Unit Price', key: 'unitPrice', width: 15 },
    { header: 'Total Quantity', key: 'totalQuantity', width: 18 },
    { header: 'Subtotal', key: 'subtotal', width: 15 },
  ];

  // Style header row
  productsSheet.getRow(1).font = { bold: true, size: 12 };
  productsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD4AF37' },
  };
  productsSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

  // Add products data
  products.forEach((sp) => {
    const totalQuantity = sp.quantity * recipients.length;
    const subtotal = sp.product.price * totalQuantity;
    
    productsSheet.addRow({
      name: sp.product.title,
      quantity: sp.quantity,
      unitPrice: `$${sp.product.price.toFixed(2)}`,
      totalQuantity: totalQuantity,
      subtotal: `$${subtotal.toFixed(2)}`,
    });
  });

  // Add total row
  const totalRow = productsSheet.addRow({
    name: 'TOTAL',
    quantity: '',
    unitPrice: '',
    totalQuantity: '',
    subtotal: `$${pricing.giftSubtotal.toFixed(2)}`,
  });
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF5E6D3' }, // Light cream
  };

  // Format currency columns
  productsSheet.getColumn(3).numFmt = '$#,##0.00';
  productsSheet.getColumn(5).numFmt = '$#,##0.00';

  // Sheet 3: Recipients (Main Sheet)
  const recipientsSheet = workbook.addWorksheet('Recipients');
  recipientsSheet.columns = [
    { header: 'Recipient #', key: 'number', width: 12 },
    { header: 'First Name', key: 'firstName', width: 18 },
    { header: 'Last Name', key: 'lastName', width: 18 },
    { header: 'Company', key: 'company', width: 25 },
    { header: 'Address Line 1', key: 'address1', width: 30 },
    { header: 'Address Line 2', key: 'address2', width: 30 },
    { header: 'City', key: 'city', width: 20 },
    { header: 'State', key: 'state', width: 10 },
    { header: 'ZIP Code', key: 'zip', width: 12 },
    { header: 'Gift Message', key: 'message', width: 40 },
  ];

  // Style header row
  recipientsSheet.getRow(1).font = { bold: true, size: 12 };
  recipientsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD4AF37' },
  };
  recipientsSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  // Freeze header row
  recipientsSheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Add recipients data
  recipients.forEach((recipient, index) => {
    recipientsSheet.addRow({
      number: index + 1,
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      company: recipient.company || '',
      address1: recipient.address1,
      address2: recipient.address2 || '',
      city: recipient.city,
      state: recipient.state,
      zip: recipient.zip,
      message: recipient.giftMessage || '',
    });
  });

  // Add borders to all cells
  [summarySheet, productsSheet, recipientsSheet].forEach((sheet) => {
    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });
  });

  // Generate Excel buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
