import { NextRequest, NextResponse } from 'next/server';
import { createDraftOrder, updateDraftOrderCustomAttributes, appendExcelUrlToDraftOrderNote } from '@/lib/shopify';
import { generateRecipientExcel } from '@/lib/excel-generator';
import { saveExcelFile, getExcelFileUrl } from '@/lib/file-storage';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { SelectedProduct, Recipient, BuyerInfo } from '@/lib/types';
import { calculateOrderTotal } from '@/lib/pricing';

interface RequestBody {
  products: SelectedProduct[];
  recipients: Recipient[];
  buyerInfo: BuyerInfo;
  pricing: {
    fulfillmentSubtotal: number;
    perRecipientFee: number;
  };
  tier?: string; // Optional tier name for Excel
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { products, recipients, buyerInfo, pricing, tier } = body;

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: 'No products selected' },
        { status: 400 }
      );
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients provided' },
        { status: 400 }
      );
    }

    if (!buyerInfo) {
      return NextResponse.json(
        { error: 'Buyer information required' },
        { status: 400 }
      );
    }

    // Build line items with variant IDs
    const lineItems = products
      .filter(sp => sp.product.variantId)
      .map(sp => ({
        variantId: sp.product.variantId!,
        quantity: sp.quantity,
      }));

    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Products must have Shopify variant IDs' },
        { status: 400 }
      );
    }

    // Calculate gift total for Excel
    const giftTotal = products.reduce(
      (sum, sp) => sum + sp.product.price * sp.quantity,
      0
    );
    const orderPricing = calculateOrderTotal(giftTotal, recipients.length);

    // Step 1: Create draft order first to get order number
    const result = await createDraftOrder(
      lineItems,
      pricing.perRecipientFee,
      recipients.length,
      buyerInfo,
      recipients
    );

    // Step 2: Generate Excel spreadsheet and save to server
    let excelFileUrl: string | undefined;
    let excelError: string | undefined;
    let excelBufferForEmail: Buffer | undefined;
    let excelFilenameForEmail: string | undefined;
    try {
      console.log('Generating Excel spreadsheet...');
      const excelBuffer = await generateRecipientExcel({
        draftOrderNumber: result.draftOrderNumber,
        buyerInfo,
        products,
        recipients,
        pricing: {
          giftSubtotal: orderPricing.giftSubtotal,
          fulfillmentSubtotal: orderPricing.fulfillmentSubtotal,
          total: orderPricing.total,
          perRecipientFee: orderPricing.perRecipientFee,
        },
        tier: tier || 'Unknown',
      });
      console.log('Excel generated successfully, size:', excelBuffer.length, 'bytes');

      // Store buffer for email attachment
      excelBufferForEmail = excelBuffer;
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '-');
      excelFilenameForEmail = `Order_${result.draftOrderNumber}_Recipients.xlsx`;

      // Step 3: Save Excel file to server
      const filename = `Corporate_Gift_Order_${result.draftOrderNumber.replace('#', '')}_${dateStr}.xlsx`;
      
      try {
        console.log('Saving Excel file to server:', filename);
        await saveExcelFile(excelBuffer, filename);
        excelFileUrl = getExcelFileUrl(filename);
        console.log('Excel file saved successfully:', excelFileUrl);

        // Step 4: Update draft order note with Excel URL
        try {
          // Append Excel URL to the draft order note with recipient count
          await appendExcelUrlToDraftOrderNote(result.draftOrderId, excelFileUrl, recipients.length);
          
          // Also update custom attributes
          await updateDraftOrderCustomAttributes(result.draftOrderId, [
            {
              key: 'excel_filename',
              value: filename,
            },
            {
              key: 'excel_file_url',
              value: excelFileUrl,
            },
          ]);
          console.log('Draft order updated with Excel file URL in note');
        } catch (updateError) {
          console.error('Error updating draft order with Excel URL:', updateError);
          // Continue - Excel URL will be in the response
        }
      } catch (saveError) {
        excelError = saveError instanceof Error ? saveError.message : String(saveError);
        console.error('Error saving Excel file:', saveError);
        // Continue without Excel - order is already created
      }
    } catch (err) {
      excelError = err instanceof Error ? err.message : String(err);
      console.error('Error generating Excel:', err);
      // Continue without Excel - order is already created
    }

    // Step 5: Send order confirmation email to customer
    let emailSent = false;
    let emailError: string | null = null;
    try {
      console.log('Sending order confirmation email to:', buyerInfo.email);
      const emailResult = await sendOrderConfirmationEmail(
        buyerInfo,
        result.draftOrderNumber,
        result.draftOrderId,
        result.invoiceUrl,
        products,
        recipients,
        {
          giftSubtotal: orderPricing.giftSubtotal,
          fulfillmentSubtotal: orderPricing.fulfillmentSubtotal,
          total: orderPricing.total,
          perRecipientFee: orderPricing.perRecipientFee,
        },
        tier || 'Unknown',
        excelBufferForEmail,
        excelFilenameForEmail
      );
      
      if (emailResult.success) {
        emailSent = true;
        console.log('Order confirmation email sent successfully');
      } else {
        emailError = emailResult.error || 'Unknown error';
        console.warn('Failed to send order confirmation email:', emailError);
      }
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err);
      console.error('Error sending order confirmation email:', err);
      // Continue - order is already created, email failure shouldn't block success
    }

    // If Excel was uploaded, update the draft order with the Excel URL
    // For now, we'll return it in the response - it's already in customAttributes
    // In a future update, we could use draftOrderUpdate mutation to add it to notes

    return NextResponse.json({
      success: true,
      draftOrderId: result.draftOrderId,
      draftOrderNumber: result.draftOrderNumber,
      invoiceUrl: result.invoiceUrl,
      excelFileUrl: excelFileUrl || null,
      excelError: excelError || null,
      emailSent: emailSent,
      emailError: emailError || null,
      message: 'Order submitted successfully. You will receive an invoice shortly.',
    });
  } catch (error) {
    console.error('Error creating draft order:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create draft order',
      },
      { status: 500 }
    );
  }
}
