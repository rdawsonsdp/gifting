import nodemailer from 'nodemailer';
import { BuyerInfo, SelectedProduct, Recipient, DeliveryMethod } from './types';

// Email configuration - Update these in .env.local
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

const FROM_EMAIL = process.env.FROM_EMAIL || EMAIL_CONFIG.auth.user || 'noreply@brownsugarbakerychicago.com';
const FROM_NAME = process.env.FROM_NAME || 'Brown Sugar Bakery';
const LOGO_URL = process.env.LOGO_URL || 'https://brownsugarbakerychicago.com/images/BSBLogo.jpeg';
const WEBSITE_URL = process.env.WEBSITE_URL || 'https://www.brownsugarbakerychicago.com';

/**
 * Check if email is configured
 */
export function isEmailConfigured(): boolean {
  return !!(EMAIL_CONFIG.auth.user && EMAIL_CONFIG.auth.pass);
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  buyerInfo: BuyerInfo,
  orderNumber: string,
  orderId: string,
  invoiceUrl: string,
  products: SelectedProduct[],
  recipients: Recipient[],
  pricing: {
    giftSubtotal: number;
    fulfillmentSubtotal: number;
    shippingCost?: number;
    total: number;
    perRecipientFee: number;
    discountCode?: string;
    discountAmount?: number;
  },
  tier: string,
  excelFileBuffer?: Buffer,
  excelFilename?: string,
  deliveryMethod?: DeliveryMethod,
  vendorDocs?: { filename: string; url: string }[],
  vendorNotes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    console.warn('Email not configured. Skipping order confirmation email.');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);

    // Format delivery date
    const deliveryDateFormatted = buyerInfo.deliveryDate
      ? new Date(buyerInfo.deliveryDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Not specified';

    // Format order date
    const orderDateFormatted = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Check if this is a shipped order
    const isShippedOrder = deliveryMethod && deliveryMethod.id !== 'one-location';
    const deliveryMethodName = deliveryMethod?.name || 'One-Location Delivery';

    // Build product list HTML
    const productListHtml = products
      .map(
        (sp, index) => `
        <div style="display: table; width: 100%; padding: 15px 0; ${index < products.length - 1 ? 'border-bottom: 1px solid #e0e0e0;' : ''}">
          <div style="display: table-cell; vertical-align: top;">
            <div style="font-weight: 700; color: #570522; font-size: 16px;">${sp.product.title}</div>
            <div style="color: #666666; font-size: 14px; margin-top: 5px;">Quantity: ${sp.quantity}</div>
          </div>
          <div style="display: table-cell; vertical-align: top; text-align: right; font-weight: 700; color: #333333; font-size: 16px;">$${(sp.product.price * sp.quantity).toFixed(2)}</div>
        </div>
    `
      )
      .join('');

    // Email subject
    const subject = `Order Confirmation - ${orderNumber} - Brown Sugar Bakery`;

    // Email HTML template
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Brown Sugar Bakery</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Arsenal:wght@400;700&family=Noto+Sans:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Noto Sans', Arial, sans-serif;
            background-color: #f5f5f5;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #e68c3b;
            padding: 40px 30px;
            text-align: center;
        }
        .logo-placeholder {
            width: 120px;
            height: 120px;
            margin: 0 auto 20px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: #570522;
        }
        .brand-name {
            font-family: 'Arsenal', serif;
            font-size: 36px;
            color: #570522;
            margin: 0;
            font-weight: 700;
        }
        .brand-subtitle {
            font-family: 'Arsenal', serif;
            font-size: 14px;
            color: #570522;
            margin: 5px 0 0 0;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .hero {
            background-color: #facac1;
            padding: 50px 30px;
            text-align: center;
        }
        .hero-title {
            font-family: 'Arsenal', serif;
            font-size: 32px;
            color: #570522;
            margin: 0 0 15px 0;
            font-weight: 700;
        }
        .hero-message {
            font-family: 'Noto Sans', sans-serif;
            font-size: 16px;
            color: #570522;
            line-height: 1.6;
            margin: 0;
        }
        .content {
            padding: 40px 30px;
        }
        .section-title {
            font-family: 'Arsenal', serif;
            font-size: 24px;
            color: #570522;
            margin: 0 0 20px 0;
            font-weight: 700;
        }
        .order-details {
            background-color: #f9f9f9;
            border-left: 4px solid #e68c3b;
            padding: 20px;
            margin-bottom: 30px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
        }
        .detail-label {
            font-weight: 700;
            color: #570522;
        }
        .detail-value {
            color: #333333;
        }
        .order-items {
            margin-bottom: 30px;
        }
        .item {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .item:last-child {
            border-bottom: none;
        }
        .item-name {
            font-weight: 700;
            color: #570522;
            font-size: 16px;
        }
        .item-details {
            color: #666666;
            font-size: 14px;
            margin-top: 5px;
        }
        .item-price {
            font-weight: 700;
            color: #333333;
            font-size: 16px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            font-size: 16px;
        }
        .total-row.grand-total {
            border-top: 2px solid #570522;
            margin-top: 10px;
            padding-top: 15px;
        }
        .total-label {
            font-weight: 700;
            color: #570522;
        }
        .total-value {
            font-weight: 700;
            color: #570522;
        }
        .grand-total .total-label,
        .grand-total .total-value {
            font-size: 20px;
            font-family: 'Arsenal', serif;
        }
        .cta-section {
            text-align: center;
            padding: 30px 0;
            background-color: #f9f9f9;
            margin: 30px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #570522;
            color: #ffffff;
            font-family: 'Arsenal', serif;
            font-size: 18px;
            font-weight: 700;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 4px;
            margin-top: 10px;
        }
        .info-section {
            background-color: #facac1;
            padding: 30px;
            margin-top: 30px;
        }
        .info-title {
            font-family: 'Arsenal', serif;
            font-size: 18px;
            color: #570522;
            font-weight: 700;
            margin: 0 0 10px 0;
        }
        .info-text {
            font-size: 14px;
            color: #570522;
            line-height: 1.6;
            margin: 0 0 10px 0;
        }
        .notes-section {
            background-color: #fff3cd;
            padding: 20px;
            margin-top: 20px;
            border-left: 4px solid #ffc107;
        }
        .vendor-section {
            background-color: #f3e5f5;
            padding: 20px;
            margin-top: 20px;
            border-left: 4px solid #9c27b0;
        }
        .footer {
            background-color: #570522;
            color: #facac1;
            padding: 30px;
            text-align: center;
        }
        .footer-tagline {
            font-family: 'Arsenal', serif;
            font-size: 24px;
            margin: 0 0 20px 0;
            font-weight: 700;
        }
        .footer-text {
            font-size: 12px;
            line-height: 1.6;
            margin: 0 0 15px 0;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            color: #e68c3b;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
            .hero-title {
                font-size: 26px;
            }
            .brand-name {
                font-size: 28px;
            }
            .section-title {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header with Logo -->
        <div class="header">
            <div class="logo-placeholder">
                <img src="${LOGO_URL}" alt="Brown Sugar Bakery Logo" style="width: 120px; height: 120px; display: block; margin: 0 auto; border-radius: 50%; object-fit: cover;">
            </div>
            <h1 class="brand-name">Brown Sugar</h1>
            <p class="brand-subtitle">BAKERY</p>
        </div>

        <!-- Hero Section -->
        <div class="hero">
            <h2 class="hero-title">Thank You for Your Order!</h2>
            <p class="hero-message">Dear ${buyerInfo.name}, we're so grateful you chose Brown Sugar Bakery for your corporate gifting needs. Your order is confirmed and we're already getting started on making something special for your recipients.</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Order Summary -->
            <h3 class="section-title">Order Details</h3>
            <div class="order-details">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0; font-weight: 700; color: #570522;">Order Number:</td>
                        <td style="padding: 6px 0; color: #333333; text-align: right;">${orderNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 700; color: #570522;">Order Date:</td>
                        <td style="padding: 6px 0; color: #333333; text-align: right;">${orderDateFormatted}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 700; color: #570522;">Gift Tier:</td>
                        <td style="padding: 6px 0; color: #333333; text-align: right;">${tier}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 700; color: #570522;">Delivery Date:</td>
                        <td style="padding: 6px 0; color: #333333; text-align: right;">${deliveryDateFormatted}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 700; color: #570522;">Delivery Method:</td>
                        <td style="padding: 6px 0; color: #333333; text-align: right;">${deliveryMethodName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 700; color: #570522;">Number of Recipients:</td>
                        <td style="padding: 6px 0; color: #333333; text-align: right;">${recipients.length}</td>
                    </tr>
                </table>
            </div>

            <!-- Order Items -->
            <h3 class="section-title">Your Sweet Treats</h3>
            <div class="order-items">
                ${productListHtml}
            </div>

            <!-- Order Total -->
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 15px 0; font-weight: 700; color: #570522; font-size: 16px;">Subtotal:</td>
                    <td style="padding: 15px 0; font-weight: 700; color: #570522; font-size: 16px; text-align: right;">$${pricing.giftSubtotal.toFixed(2)}</td>
                </tr>
                ${!isShippedOrder && pricing.fulfillmentSubtotal > 0 ? `
                <tr>
                    <td style="padding: 15px 0; font-weight: 700; color: #570522; font-size: 16px;">Delivery Fee:</td>
                    <td style="padding: 15px 0; font-weight: 700; color: #570522; font-size: 16px; text-align: right;">$${pricing.fulfillmentSubtotal.toFixed(2)}</td>
                </tr>
                ` : ''}
                ${isShippedOrder && pricing.shippingCost ? `
                <tr>
                    <td style="padding: 15px 0; font-weight: 700; color: #570522; font-size: 16px;">Shipping:</td>
                    <td style="padding: 15px 0; font-weight: 700; color: #570522; font-size: 16px; text-align: right;">$${pricing.shippingCost.toFixed(2)}</td>
                </tr>
                ` : ''}
                ${pricing.discountCode && pricing.discountAmount ? `
                <tr>
                    <td style="padding: 15px 0; font-weight: 700; color: #2E7D32; font-size: 16px;">Discount (${pricing.discountCode}):</td>
                    <td style="padding: 15px 0; font-weight: 700; color: #2E7D32; font-size: 16px; text-align: right;">-$${pricing.discountAmount.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #570522;">
                    <td style="padding: 15px 0; font-weight: 700; color: #570522; font-size: 20px; font-family: 'Arsenal', serif;">Total:</td>
                    <td style="padding: 15px 0; font-weight: 700; color: #570522; font-size: 20px; font-family: 'Arsenal', serif; text-align: right;">$${pricing.total.toFixed(2)}</td>
                </tr>
            </table>

            ${buyerInfo.notes ? `
            <!-- Order Notes -->
            <div class="notes-section">
                <h4 style="margin: 0 0 10px 0; color: #856404; font-family: 'Arsenal', serif;">Order Notes</h4>
                <p style="margin: 0; color: #856404; font-size: 14px;">${buyerInfo.notes.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}

            ${(vendorDocs && vendorDocs.length > 0) || vendorNotes ? `
            <!-- Vendor Documents -->
            <div class="vendor-section">
                <h4 style="margin: 0 0 10px 0; color: #6a1b9a; font-family: 'Arsenal', serif;">Preferred Vendor Documents Received</h4>
                <p style="margin: 0; color: #4a148c; font-size: 14px;">We have received your vendor registration paperwork and will process it promptly.</p>
                ${vendorDocs && vendorDocs.length > 0 ? `<p style="margin: 8px 0 0 0; color: #4a148c; font-size: 14px;"><strong>Documents:</strong> ${vendorDocs.map(d => d.filename).join(', ')}</p>` : ''}
                ${vendorNotes ? `<p style="margin: 8px 0 0 0; color: #4a148c; font-size: 14px;"><strong>Vendor Notes:</strong> ${vendorNotes.replace(/\n/g, '<br>')}</p>` : ''}
            </div>
            ` : ''}

            <!-- CTA Section -->
            <div class="cta-section">
                <p style="margin: 0 0 15px 0; color: #570522; font-size: 16px;">Need to make changes or have questions?</p>
                <a href="${invoiceUrl}" class="cta-button" style="color: #ffffff;">View Order Details</a>
            </div>

            <!-- What Happens Next -->
            <div class="info-section">
                <h4 class="info-title">What Happens Next?</h4>
                <p class="info-text"><strong>1.</strong> You will receive an invoice via email within 24 hours with payment instructions.</p>
                <p class="info-text"><strong>2.</strong> Our team will call you to confirm the order details and answer any questions.</p>
                <p class="info-text"><strong>3.</strong> Once confirmed and paid, we'll begin preparing your gifts with care and attention.</p>
                <p class="info-text" style="margin-top: 15px;">If you need to make any changes, please call us at <a href="tel:773-224-6662" style="color: #570522; font-weight: 700;">(773) 224-6662</a>.</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-tagline">LIFE IS SWEET</p>
            <p class="footer-text">
                <strong>Brown Sugar Bakery</strong><br>
                328 E 75th St, Chicago, IL 60619<br>
                (773) 224-6662<br>
                Made in Chicago Since 2004
            </p>
            <div class="social-links">
                <a href="https://www.instagram.com/brownsugarbakerychicago/">Instagram</a>
                <a href="https://www.facebook.com/brownsugarbakerychicago/">Facebook</a>
                <a href="${WEBSITE_URL}">Website</a>
            </div>
            <p class="footer-text" style="font-size: 11px; margin-top: 20px;">
                You're receiving this email because you placed an order with Brown Sugar Bakery.<br>
                <a href="mailto:info@brownsugarbakerychicago.com" style="color: #e68c3b;">Contact Us</a>
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();

    // Plain text version
    const textContent = `
BROWN SUGAR BAKERY
Corporate Gifting

═══════════════════════════════════════

THANK YOU FOR YOUR ORDER!

Dear ${buyerInfo.name},

We're so grateful you chose Brown Sugar Bakery for your corporate gifting needs. Your order is confirmed and we're already getting started on making something special for your recipients.

═══════════════════════════════════════

ORDER DETAILS
─────────────────────────────────────────
Order Number: ${orderNumber}
Order Date: ${orderDateFormatted}
Gift Tier: ${tier}
Delivery Date: ${deliveryDateFormatted}
Delivery Method: ${deliveryMethodName}
Number of Recipients: ${recipients.length}

YOUR SWEET TREATS
─────────────────────────────────────────
${products.map((sp) => `• ${sp.product.title}\n  Quantity: ${sp.quantity} | $${(sp.product.price * sp.quantity).toFixed(2)}`).join('\n\n')}

ORDER SUMMARY
─────────────────────────────────────────
Subtotal: $${pricing.giftSubtotal.toFixed(2)}${!isShippedOrder && pricing.fulfillmentSubtotal > 0 ? `
Delivery Fee: $${pricing.fulfillmentSubtotal.toFixed(2)}` : ''}${isShippedOrder && pricing.shippingCost ? `
Shipping: $${pricing.shippingCost.toFixed(2)}` : ''}${pricing.discountCode && pricing.discountAmount ? `
Discount (${pricing.discountCode}): -$${pricing.discountAmount.toFixed(2)}` : ''}
─────────────────────────────────────────
TOTAL: $${pricing.total.toFixed(2)}

${buyerInfo.notes ? `ORDER NOTES\n─────────────────────────────────────────\n${buyerInfo.notes}\n` : ''}
${(vendorDocs && vendorDocs.length > 0) || vendorNotes ? `PREFERRED VENDOR DOCUMENTS RECEIVED\n─────────────────────────────────────────\nWe have received your vendor registration paperwork and will process it promptly.${vendorDocs && vendorDocs.length > 0 ? `\nDocuments: ${vendorDocs.map(d => d.filename).join(', ')}` : ''}${vendorNotes ? `\nVendor Notes: ${vendorNotes}` : ''}\n` : ''}
WHAT HAPPENS NEXT?
─────────────────────────────────────────
1. You will receive an invoice via email within 24 hours with payment instructions.
2. Our team will call you to confirm the order details and answer any questions.
3. Once confirmed and paid, we'll begin preparing your gifts with care and attention.

If you need to make any changes, please call us at (773) 224-6662.

View Order Details: ${invoiceUrl}

═══════════════════════════════════════

LIFE IS SWEET

Brown Sugar Bakery
328 E 75th St, Chicago, IL 60619
(773) 224-6662
Made in Chicago Since 2004

Instagram: @brownsugarbakerychicago
Website: ${WEBSITE_URL}
    `.trim();

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: buyerInfo.email,
      replyTo: FROM_EMAIL,
      subject: subject,
      text: textContent,
      html: htmlContent,
      // Optional: Attach Excel file if available
      ...(excelFileBuffer && {
        attachments: [
          {
            filename: excelFilename || `Order_${orderNumber}_Recipients.xlsx`,
            content: excelFileBuffer,
          },
        ],
      }),
    });

    console.log(`Order confirmation email sent successfully to ${buyerInfo.email}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending order confirmation email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
