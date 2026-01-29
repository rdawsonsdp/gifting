import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { SelectedProduct, Recipient, BuyerInfo, DeliveryMethod } from './types';

interface InvoiceData {
  orderNumber: string;
  orderDate: Date;
  buyerInfo: BuyerInfo;
  products: SelectedProduct[];
  recipients: Recipient[];
  pricing: {
    giftSubtotal: number;
    fulfillmentSubtotal: number;
    shippingCost?: number;
    total: number;
    shippingPerRecipient?: number;
  };
  tier?: string;
  specialInstructions?: string;
  deliveryMethod?: DeliveryMethod;
}

// Brown Sugar Bakery brand colors (matching email template)
const BRAND_BURGUNDY = rgb(87 / 255, 5 / 255, 34 / 255); // #570522
const BRAND_ORANGE = rgb(230 / 255, 140 / 255, 59 / 255); // #e68c3b
const BRAND_PINK = rgb(250 / 255, 202 / 255, 193 / 255); // #facac1
const BLACK = rgb(51 / 255, 51 / 255, 51 / 255); // #333333
const GRAY = rgb(102 / 255, 102 / 255, 102 / 255); // #666666
const LIGHT_GRAY = rgb(249 / 255, 249 / 255, 249 / 255); // #f9f9f9
const WHITE = rgb(1, 1, 1);

export async function generateInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  let y = height - 50;

  // Orange header bar
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: BRAND_ORANGE,
  });

  // Header with brand name (white text on orange)
  page.drawText('Brown Sugar', {
    x: 50,
    y: height - 45,
    size: 28,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });

  page.drawText('BAKERY', {
    x: 50,
    y: height - 68,
    size: 12,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });

  // Invoice title on the right (in header)
  page.drawText('INVOICE', {
    x: width - 130,
    y: height - 55,
    size: 24,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });

  // Order details below header
  y = height - 130;

  page.drawText(`Order #: ${data.orderNumber}`, {
    x: 50,
    y,
    size: 11,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });

  page.drawText(`Date: ${data.orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`, {
    x: width - 200,
    y,
    size: 11,
    font: helvetica,
    color: GRAY,
  });

  // Bill To section with left border accent
  y -= 30;

  // Draw accent border on left
  page.drawRectangle({
    x: 50,
    y: y - 80,
    width: 4,
    height: 95,
    color: BRAND_ORANGE,
  });

  // Draw light background
  page.drawRectangle({
    x: 54,
    y: y - 80,
    width: 220,
    height: 95,
    color: LIGHT_GRAY,
  });

  page.drawText('BILL TO', {
    x: 65,
    y,
    size: 11,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });

  y -= 20;
  page.drawText(data.buyerInfo.name, {
    x: 65,
    y,
    size: 11,
    font: helveticaBold,
    color: BLACK,
  });

  y -= 16;
  page.drawText(data.buyerInfo.company, {
    x: 65,
    y,
    size: 10,
    font: helvetica,
    color: GRAY,
  });

  y -= 14;
  page.drawText(data.buyerInfo.email, {
    x: 65,
    y,
    size: 10,
    font: helvetica,
    color: GRAY,
  });

  y -= 14;
  page.drawText(data.buyerInfo.phone, {
    x: 65,
    y,
    size: 10,
    font: helvetica,
    color: GRAY,
  });

  // Delivery Info section (right side)
  const deliveryY = height - 160;

  // Draw accent border on left
  page.drawRectangle({
    x: 320,
    y: deliveryY - 80,
    width: 4,
    height: 95,
    color: BRAND_ORANGE,
  });

  // Draw light background
  page.drawRectangle({
    x: 324,
    y: deliveryY - 80,
    width: 238,
    height: 95,
    color: LIGHT_GRAY,
  });

  page.drawText('DELIVERY DETAILS', {
    x: 335,
    y: deliveryY,
    size: 11,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });

  const deliveryDateFormatted = data.buyerInfo.deliveryDate
    ? new Date(data.buyerInfo.deliveryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'To be confirmed';

  page.drawText('Delivery Date:', {
    x: 335,
    y: deliveryY - 20,
    size: 10,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });

  page.drawText(deliveryDateFormatted, {
    x: 420,
    y: deliveryY - 20,
    size: 10,
    font: helvetica,
    color: BLACK,
  });

  const deliveryMethodName = data.deliveryMethod?.name || 'One-Location Delivery';
  page.drawText('Method:', {
    x: 335,
    y: deliveryY - 36,
    size: 10,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });

  page.drawText(deliveryMethodName, {
    x: 420,
    y: deliveryY - 36,
    size: 10,
    font: helvetica,
    color: BLACK,
  });

  page.drawText('Recipients:', {
    x: 335,
    y: deliveryY - 52,
    size: 10,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });

  page.drawText(data.recipients.length.toString(), {
    x: 420,
    y: deliveryY - 52,
    size: 10,
    font: helvetica,
    color: BLACK,
  });

  y = deliveryY - 100;

  // Order Summary section
  y -= 20;
  page.drawText('YOUR SWEET TREATS', {
    x: 50,
    y,
    size: 14,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });

  // Table header with burgundy background
  y -= 28;
  page.drawRectangle({
    x: 50,
    y: y - 8,
    width: width - 100,
    height: 24,
    color: BRAND_BURGUNDY,
  });

  page.drawText('Item', {
    x: 60,
    y,
    size: 10,
    font: helveticaBold,
    color: WHITE,
  });

  page.drawText('Qty', {
    x: 320,
    y,
    size: 10,
    font: helveticaBold,
    color: WHITE,
  });

  page.drawText('Unit Price', {
    x: 380,
    y,
    size: 10,
    font: helveticaBold,
    color: WHITE,
  });

  page.drawText('Total', {
    x: 490,
    y,
    size: 10,
    font: helveticaBold,
    color: WHITE,
  });

  // Product items
  y -= 28;
  let rowIndex = 0;
  for (const sp of data.products) {
    // Alternate row backgrounds
    if (rowIndex % 2 === 0) {
      page.drawRectangle({
        x: 50,
        y: y - 8,
        width: width - 100,
        height: 22,
        color: LIGHT_GRAY,
      });
    }

    // Truncate long product names
    const productName = sp.product.title.length > 40
      ? sp.product.title.substring(0, 37) + '...'
      : sp.product.title;

    page.drawText(productName, {
      x: 60,
      y,
      size: 10,
      font: helvetica,
      color: BRAND_BURGUNDY,
    });

    page.drawText(sp.quantity.toString(), {
      x: 328,
      y,
      size: 10,
      font: helvetica,
      color: BLACK,
    });

    page.drawText(`$${sp.product.price.toFixed(2)}`, {
      x: 380,
      y,
      size: 10,
      font: helvetica,
      color: BLACK,
    });

    page.drawText(`$${(sp.product.price * sp.quantity).toFixed(2)}`, {
      x: 485,
      y,
      size: 10,
      font: helveticaBold,
      color: BLACK,
    });

    y -= 22;
    rowIndex++;
  }

  // Tier info
  if (data.tier) {
    y -= 10;
    page.drawText(`Gift Tier: ${data.tier}`, {
      x: 60,
      y,
      size: 10,
      font: helvetica,
      color: GRAY,
    });
  }

  // Pricing summary section
  y -= 25;
  const summaryX = 380;

  // Draw summary background
  page.drawRectangle({
    x: summaryX - 20,
    y: y - 80,
    width: 192,
    height: 100,
    color: BRAND_PINK,
  });

  // Check if this is a shipped order
  const isShippedOrder = data.deliveryMethod && data.deliveryMethod.id !== 'one-location';

  page.drawText('Subtotal:', {
    x: summaryX,
    y,
    size: 11,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });
  page.drawText(`$${data.pricing.giftSubtotal.toFixed(2)}`, {
    x: 500,
    y,
    size: 11,
    font: helvetica,
    color: BLACK,
  });

  y -= 18;

  // Show delivery fee for delivery orders, shipping for shipped orders
  if (!isShippedOrder && data.pricing.fulfillmentSubtotal > 0) {
    page.drawText('Delivery Fee:', {
      x: summaryX,
      y,
      size: 11,
      font: helveticaBold,
      color: BRAND_BURGUNDY,
    });
    page.drawText(`$${data.pricing.fulfillmentSubtotal.toFixed(2)}`, {
      x: 500,
      y,
      size: 11,
      font: helvetica,
      color: BLACK,
    });
    y -= 18;
  }

  if (isShippedOrder && data.pricing.shippingCost && data.deliveryMethod) {
    page.drawText('Shipping:', {
      x: summaryX,
      y,
      size: 11,
      font: helveticaBold,
      color: BRAND_BURGUNDY,
    });
    page.drawText(`$${data.pricing.shippingCost.toFixed(2)}`, {
      x: 500,
      y,
      size: 11,
      font: helvetica,
      color: BLACK,
    });
    y -= 18;
  }

  page.drawText('Tax:', {
    x: summaryX,
    y,
    size: 11,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });
  page.drawText('TBD', {
    x: 500,
    y,
    size: 11,
    font: helvetica,
    color: GRAY,
  });

  // Total with burgundy line
  y -= 25;
  page.drawLine({
    start: { x: summaryX - 10, y: y + 12 },
    end: { x: width - 50, y: y + 12 },
    thickness: 2,
    color: BRAND_BURGUNDY,
  });

  page.drawText('TOTAL:', {
    x: summaryX,
    y,
    size: 14,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });
  page.drawText(`$${data.pricing.total.toFixed(2)}`, {
    x: 490,
    y,
    size: 14,
    font: helveticaBold,
    color: BRAND_BURGUNDY,
  });

  // Order Notes section (if present)
  if (data.buyerInfo.notes || data.specialInstructions) {
    y -= 45;

    // Draw accent border on left
    const notesHeight = 60;
    page.drawRectangle({
      x: 50,
      y: y - notesHeight + 15,
      width: 4,
      height: notesHeight,
      color: BRAND_ORANGE,
    });

    // Draw light background
    page.drawRectangle({
      x: 54,
      y: y - notesHeight + 15,
      width: 280,
      height: notesHeight,
      color: LIGHT_GRAY,
    });

    page.drawText('ORDER NOTES', {
      x: 65,
      y,
      size: 11,
      font: helveticaBold,
      color: BRAND_BURGUNDY,
    });

    y -= 18;
    const notes = data.specialInstructions || data.buyerInfo.notes || '';
    // Split notes into lines
    const words = notes.split(' ');
    let line = '';
    const maxWidth = 260;

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const textWidth = helvetica.widthOfTextAtSize(testLine, 10);

      if (textWidth > maxWidth) {
        page.drawText(line, {
          x: 65,
          y,
          size: 10,
          font: helvetica,
          color: GRAY,
        });
        y -= 14;
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
      page.drawText(line, {
        x: 65,
        y,
        size: 10,
        font: helvetica,
        color: GRAY,
      });
    }
  }

  // Footer with burgundy background
  const footerHeight = 90;
  const footerY = footerHeight;

  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: footerHeight,
    color: BRAND_BURGUNDY,
  });

  // Tagline
  page.drawText('LIFE IS SWEET', {
    x: 50,
    y: footerY - 25,
    size: 16,
    font: helveticaBold,
    color: BRAND_PINK,
  });

  // Contact info
  page.drawText('Brown Sugar Bakery  |  328 E 75th St, Chicago, IL 60619  |  (773) 224-6662', {
    x: 50,
    y: footerY - 45,
    size: 9,
    font: helvetica,
    color: BRAND_PINK,
  });

  page.drawText('www.brownsugarbakerychicago.com  |  Made in Chicago Since 2004', {
    x: 50,
    y: footerY - 60,
    size: 9,
    font: helvetica,
    color: BRAND_ORANGE,
  });

  // Page number
  page.drawText('Page 1 of 1', {
    x: width - 100,
    y: footerY - 75,
    size: 8,
    font: helvetica,
    color: BRAND_PINK,
  });

  return pdfDoc.save();
}
