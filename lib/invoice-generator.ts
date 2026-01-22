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

// Brown Sugar Bakery brand colors
const BRAND_ORANGE = rgb(233 / 255, 141 / 255, 61 / 255); // #E98D3D
const BRAND_BROWN = rgb(139 / 255, 115 / 255, 85 / 255); // #8B7355
const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.4, 0.4, 0.4);
const LIGHT_GRAY = rgb(0.9, 0.9, 0.9);

export async function generateInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  let y = height - 50;

  // Header with brand name
  page.drawText('Brown Sugar Bakery', {
    x: 50,
    y,
    size: 24,
    font: helveticaBold,
    color: BRAND_ORANGE,
  });

  y -= 20;
  page.drawText('Corporate Gifting', {
    x: 50,
    y,
    size: 12,
    font: helvetica,
    color: BRAND_BROWN,
  });

  // Invoice title on the right
  page.drawText('INVOICE', {
    x: width - 130,
    y: height - 50,
    size: 20,
    font: helveticaBold,
    color: BLACK,
  });

  // Order details on the right
  y = height - 80;
  const rightCol = width - 200;

  page.drawText(`Order #: ${data.orderNumber}`, {
    x: rightCol,
    y,
    size: 10,
    font: helvetica,
    color: GRAY,
  });

  y -= 15;
  page.drawText(`Date: ${data.orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`, {
    x: rightCol,
    y,
    size: 10,
    font: helvetica,
    color: GRAY,
  });

  // Divider line
  y = height - 120;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 2,
    color: BRAND_ORANGE,
  });

  // Bill To section
  y -= 30;
  page.drawText('BILL TO:', {
    x: 50,
    y,
    size: 10,
    font: helveticaBold,
    color: BRAND_BROWN,
  });

  y -= 18;
  page.drawText(data.buyerInfo.name, {
    x: 50,
    y,
    size: 11,
    font: helveticaBold,
    color: BLACK,
  });

  y -= 15;
  page.drawText(data.buyerInfo.company, {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: GRAY,
  });

  y -= 15;
  page.drawText(data.buyerInfo.email, {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: GRAY,
  });

  y -= 15;
  page.drawText(data.buyerInfo.phone, {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: GRAY,
  });

  // Delivery Date
  y -= 25;
  page.drawText('DELIVERY DATE:', {
    x: 50,
    y,
    size: 10,
    font: helveticaBold,
    color: BRAND_BROWN,
  });

  y -= 15;
  const deliveryDateFormatted = data.buyerInfo.deliveryDate
    ? new Date(data.buyerInfo.deliveryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'To be confirmed';

  page.drawText(deliveryDateFormatted, {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: BLACK,
  });

  // Order Summary section
  y -= 35;
  page.drawText('ORDER SUMMARY', {
    x: 50,
    y,
    size: 12,
    font: helveticaBold,
    color: BRAND_BROWN,
  });

  // Table header
  y -= 25;
  page.drawRectangle({
    x: 50,
    y: y - 5,
    width: width - 100,
    height: 20,
    color: LIGHT_GRAY,
  });

  page.drawText('Item', {
    x: 55,
    y,
    size: 9,
    font: helveticaBold,
    color: BLACK,
  });

  page.drawText('Qty', {
    x: 320,
    y,
    size: 9,
    font: helveticaBold,
    color: BLACK,
  });

  page.drawText('Unit Price', {
    x: 380,
    y,
    size: 9,
    font: helveticaBold,
    color: BLACK,
  });

  page.drawText('Total', {
    x: 480,
    y,
    size: 9,
    font: helveticaBold,
    color: BLACK,
  });

  // Product items
  y -= 25;
  for (const sp of data.products) {
    // Truncate long product names
    const productName = sp.product.title.length > 40
      ? sp.product.title.substring(0, 37) + '...'
      : sp.product.title;

    page.drawText(productName, {
      x: 55,
      y,
      size: 9,
      font: helvetica,
      color: BLACK,
    });

    page.drawText(sp.quantity.toString(), {
      x: 320,
      y,
      size: 9,
      font: helvetica,
      color: BLACK,
    });

    page.drawText(`$${sp.product.price.toFixed(2)}`, {
      x: 380,
      y,
      size: 9,
      font: helvetica,
      color: BLACK,
    });

    page.drawText(`$${(sp.product.price * sp.quantity).toFixed(2)}`, {
      x: 480,
      y,
      size: 9,
      font: helvetica,
      color: BLACK,
    });

    y -= 18;
  }

  // Recipient count
  y -= 10;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 0.5,
    color: LIGHT_GRAY,
  });

  y -= 20;
  page.drawText(`Number of Recipients: ${data.recipients.length}`, {
    x: 55,
    y,
    size: 10,
    font: helvetica,
    color: GRAY,
  });

  if (data.tier) {
    y -= 15;
    page.drawText(`Package Tier: ${data.tier}`, {
      x: 55,
      y,
      size: 10,
      font: helvetica,
      color: GRAY,
    });
  }

  // Pricing summary
  y -= 30;
  const summaryX = 380;

  // Check if this is a shipped order
  const isShippedOrder = data.deliveryMethod && data.deliveryMethod.id !== 'one-location';

  page.drawText('Gift Subtotal:', {
    x: summaryX,
    y,
    size: 10,
    font: helvetica,
    color: GRAY,
  });
  page.drawText(`$${data.pricing.giftSubtotal.toFixed(2)}`, {
    x: 480,
    y,
    size: 10,
    font: helvetica,
    color: BLACK,
  });

  y -= 18;

  // Show delivery fee for delivery orders, shipping for shipped orders
  const recipientTierLabel = data.recipients.length < 500 ? '< 500' : data.recipients.length < 1500 ? '500-1,499' : '1,500+';
  if (!isShippedOrder && data.pricing.fulfillmentSubtotal > 0) {
    page.drawText(`Delivery Fee (${recipientTierLabel} recipients):`, {
      x: summaryX,
      y,
      size: 10,
      font: helvetica,
      color: GRAY,
    });
    page.drawText(`$${data.pricing.fulfillmentSubtotal.toFixed(2)}`, {
      x: 480,
      y,
      size: 10,
      font: helvetica,
      color: BLACK,
    });
    y -= 18;
  }

  if (isShippedOrder && data.pricing.shippingCost && data.deliveryMethod) {
    page.drawText(`Shipping (${data.deliveryMethod.name}):`, {
      x: summaryX,
      y,
      size: 10,
      font: helvetica,
      color: GRAY,
    });
    page.drawText(`$${data.pricing.shippingCost.toFixed(2)}`, {
      x: 480,
      y,
      size: 10,
      font: helvetica,
      color: BLACK,
    });
    y -= 18;
  }

  page.drawText('Tax:', {
    x: summaryX,
    y,
    size: 10,
    font: helvetica,
    color: GRAY,
  });
  page.drawText('TBD', {
    x: 480,
    y,
    size: 10,
    font: helvetica,
    color: GRAY,
  });

  // Total
  y -= 25;
  page.drawLine({
    start: { x: summaryX - 10, y: y + 15 },
    end: { x: width - 50, y: y + 15 },
    thickness: 1,
    color: BRAND_ORANGE,
  });

  page.drawText('TOTAL:', {
    x: summaryX,
    y,
    size: 12,
    font: helveticaBold,
    color: BRAND_ORANGE,
  });
  page.drawText(`$${data.pricing.total.toFixed(2)}`, {
    x: 480,
    y,
    size: 12,
    font: helveticaBold,
    color: BRAND_ORANGE,
  });

  // Order Notes section (if present)
  if (data.buyerInfo.notes || data.specialInstructions) {
    y -= 40;
    page.drawText('ORDER NOTES:', {
      x: 50,
      y,
      size: 10,
      font: helveticaBold,
      color: BRAND_BROWN,
    });

    y -= 18;
    const notes = data.specialInstructions || data.buyerInfo.notes || '';
    // Split notes into lines
    const words = notes.split(' ');
    let line = '';
    const maxWidth = width - 100;

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const textWidth = helvetica.widthOfTextAtSize(testLine, 10);

      if (textWidth > maxWidth) {
        page.drawText(line, {
          x: 55,
          y,
          size: 10,
          font: helvetica,
          color: GRAY,
        });
        y -= 15;
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
      page.drawText(line, {
        x: 55,
        y,
        size: 10,
        font: helvetica,
        color: GRAY,
      });
    }
  }

  // Footer
  const footerY = 80;

  page.drawLine({
    start: { x: 50, y: footerY + 20 },
    end: { x: width - 50, y: footerY + 20 },
    thickness: 1,
    color: BRAND_ORANGE,
  });

  page.drawText('Questions? Contact us at 773-570-7676', {
    x: 50,
    y: footerY,
    size: 9,
    font: helvetica,
    color: GRAY,
  });

  page.drawText('www.brownsugarbakerychicago.com', {
    x: 50,
    y: footerY - 15,
    size: 9,
    font: helvetica,
    color: BRAND_ORANGE,
  });

  page.drawText('From our kitchen to yours. Life is Sweeter with Brown Sugar Bakery', {
    x: 50,
    y: footerY - 35,
    size: 8,
    font: helvetica,
    color: BRAND_BROWN,
  });

  // Page number
  page.drawText('Page 1 of 1', {
    x: width - 100,
    y: 30,
    size: 8,
    font: helvetica,
    color: GRAY,
  });

  return pdfDoc.save();
}
