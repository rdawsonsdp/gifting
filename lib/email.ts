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
  },
  tier: string,
  excelFileBuffer?: Buffer,
  excelFilename?: string,
  deliveryMethod?: DeliveryMethod
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
        (sp) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${sp.product.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${sp.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${sp.product.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${(sp.product.price * sp.quantity).toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    // Email subject
    const subject = `Order Confirmation - ${orderNumber} - Brown Sugar Bakery`;

    // Email HTML template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #E98D3D; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">Brown Sugar Bakery</h1>
    <p style="margin: 5px 0 0 0; font-size: 14px;">Corporate Gifting</p>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
    <h2 style="color: #E98D3D; margin-top: 0;">Order Confirmation</h2>
    
    <p>Dear ${buyerInfo.name},</p>
    
    <p>Thank you for your corporate gifting order! We've received your order and are excited to help you share the sweetness.</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #E98D3D;">
      <h3 style="margin-top: 0; color: #E98D3D;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px 0; font-weight: bold;">Order Number:</td>
          <td style="padding: 5px 0;">${orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; font-weight: bold;">Order Date:</td>
          <td style="padding: 5px 0;">${orderDateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; font-weight: bold;">Tier:</td>
          <td style="padding: 5px 0;">${tier}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; font-weight: bold;">Delivery Date:</td>
          <td style="padding: 5px 0;">${deliveryDateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; font-weight: bold;">Delivery Method:</td>
          <td style="padding: 5px 0;">${deliveryMethodName}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; font-weight: bold;">Number of Recipients:</td>
          <td style="padding: 5px 0;">${recipients.length}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #E98D3D;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #E98D3D;">Product</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #E98D3D;">Quantity</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #E98D3D;">Unit Price</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #E98D3D;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${productListHtml}
        </tbody>
      </table>
    </div>

    <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #E98D3D;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;">Gift Subtotal:</td>
          <td style="padding: 8px 0; text-align: right;">$${pricing.giftSubtotal.toFixed(2)}</td>
        </tr>
        ${!isShippedOrder && pricing.fulfillmentSubtotal > 0 ? `
        <tr>
          <td style="padding: 8px 0;">Delivery Fee (${recipients.length < 500 ? '< 500' : recipients.length < 1500 ? '500-1,499' : '1,500+'} recipients):</td>
          <td style="padding: 8px 0; text-align: right;">$${pricing.fulfillmentSubtotal.toFixed(2)}</td>
        </tr>
        ` : ''}
        ${isShippedOrder && pricing.shippingCost ? `
        <tr>
          <td style="padding: 8px 0;">Shipping (${deliveryMethodName}):</td>
          <td style="padding: 8px 0; text-align: right;">$${pricing.shippingCost.toFixed(2)}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #E98D3D; font-size: 18px; font-weight: bold; color: #E98D3D;">
          <td style="padding: 12px 0;">Total:</td>
          <td style="padding: 12px 0; text-align: right;">$${pricing.total.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    ${buyerInfo.notes ? `
    <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <h4 style="margin-top: 0; color: #856404;">Order Notes</h4>
      <p style="margin: 0; color: #856404;">${buyerInfo.notes.replace(/\n/g, '<br>')}</p>
    </div>
    ` : ''}

    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4caf50;">
      <h3 style="margin-top: 0; color: #2e7d32;">What Happens Next?</h3>
      <ol style="margin: 0; padding-left: 20px; color: #2e7d32;">
        <li style="margin-bottom: 10px;"><strong>You will receive an invoice</strong> via email within 24 hours with payment instructions.</li>
        <li style="margin-bottom: 10px;"><strong>Our team will call you</strong> to confirm the order details and answer any questions.</li>
        <li style="margin-bottom: 10px;"><strong>Once confirmed and paid</strong>, we'll begin preparing your gifts with care and attention.</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${invoiceUrl}" style="display: inline-block; background-color: #E98D3D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Invoice</a>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
      <p style="margin: 5px 0;"><strong>Questions?</strong></p>
      <p style="margin: 5px 0;">Contact us at <a href="tel:773-570-7676" style="color: #E98D3D;">773-570-7676</a></p>
      <p style="margin: 5px 0;">Visit us at <a href="https://www.brownsugarbakerychicago.com" style="color: #E98D3D;">brownsugarbakerychicago.com</a></p>
    </div>

    <p style="margin-top: 30px; font-style: italic; color: #8B7355; text-align: center;">
      From our kitchen to yours. Small batches made daily with the freshest ingredients.<br>
      Life is Sweeter with Brown Sugar Bakery
    </p>
  </div>

  <!-- INSTRUCTIONS FOR CUSTOMIZATION -->
  <!--
    This is a placeholder email template. To customize:
    
    1. UPDATE BRANDING:
       - Replace "Brown Sugar Bakery" with your actual brand name
       - Update colors (#E98D3D is the primary orange color)
       - Update logo/header section
    
    2. UPDATE CONTENT:
       - Customize the greeting and thank you message
       - Update "What Happens Next?" section with your actual process
       - Add your company's unique messaging
    
    3. UPDATE CONTACT INFO:
       - Update phone number (currently 773-570-7676)
       - Update website URL
       - Add social media links if desired
    
    4. ADD ATTACHMENTS (optional):
       - Excel file can be attached if needed
       - Add PDF invoice attachment
       - Add product images
    
    5. ADD PERSONALIZATION:
       - Add customer's company logo
       - Add personalized product recommendations
       - Add seasonal messaging
    
    6. TESTING:
       - Test with different order sizes
       - Test with/without notes
       - Test on different email clients
       - Verify mobile responsiveness
  -->
</body>
</html>
    `.trim();

    // Plain text version
    const textContent = `
Brown Sugar Bakery - Corporate Gifting
Order Confirmation

Dear ${buyerInfo.name},

Thank you for your corporate gifting order! We've received your order and are excited to help you share the sweetness.

ORDER DETAILS
Order Number: ${orderNumber}
Order Date: ${orderDateFormatted}
Tier: ${tier}
Delivery Date: ${deliveryDateFormatted}
Delivery Method: ${deliveryMethodName}
Number of Recipients: ${recipients.length}

ORDER ITEMS
${products.map((sp) => `- ${sp.product.title} × ${sp.quantity} @ $${sp.product.price.toFixed(2)} = $${(sp.product.price * sp.quantity).toFixed(2)}`).join('\n')}

ORDER SUMMARY
Gift Subtotal: $${pricing.giftSubtotal.toFixed(2)}${!isShippedOrder && pricing.fulfillmentSubtotal > 0 ? `
Delivery Fee (${recipients.length < 500 ? '< 500' : recipients.length < 1500 ? '500-1,499' : '1,500+'} recipients): $${pricing.fulfillmentSubtotal.toFixed(2)}` : ''}${isShippedOrder && pricing.shippingCost ? `
Shipping (${deliveryMethodName}): $${pricing.shippingCost.toFixed(2)}` : ''}
Total: $${pricing.total.toFixed(2)}

${buyerInfo.notes ? `ORDER NOTES\n${buyerInfo.notes}\n` : ''}

WHAT HAPPENS NEXT?
1. You will receive an invoice via email within 24 hours with payment instructions.
2. Our team will call you to confirm the order details and answer any questions.
3. Once confirmed and paid, we'll begin preparing your gifts with care and attention.

View Invoice: ${invoiceUrl}

Questions? Contact us at 773-570-7676
Visit us at https://www.brownsugarbakerychicago.com

From our kitchen to yours. Small batches made daily with the freshest ingredients.
Life is Sweeter with Brown Sugar Bakery
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
