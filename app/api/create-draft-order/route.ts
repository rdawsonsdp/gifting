import { NextRequest, NextResponse } from 'next/server';
import { createDraftOrder, updateDraftOrderCustomAttributes, appendExcelUrlToDraftOrderNote, sendDraftOrderInvoice, lookupDiscountCode } from '@/lib/shopify';
import { generateRecipientExcel } from '@/lib/excel-generator';
import { saveExcelFile, getExcelFileUrl } from '@/lib/file-storage';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendInvoiceSms } from '@/lib/sms';
import { SelectedProduct, Recipient, BuyerInfo, DeliveryMethod, AppliedDiscount, SelectedPackage } from '@/lib/types';
import { calculateOrderTotal } from '@/lib/pricing';

interface VendorDoc {
  filename: string;
  url: string;
}

interface RequestBody {
  products: SelectedProduct[];
  selectedPackage?: SelectedPackage;
  recipients: Recipient[];
  buyerInfo: BuyerInfo;
  pricing: {
    fulfillmentSubtotal: number;
    perRecipientFee: number;
  };
  deliveryMethod?: DeliveryMethod;
  tier?: string; // Optional tier name for Excel
  vendorDocs?: VendorDoc[];
  vendorNotes?: string;
  discount?: AppliedDiscount;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { products, selectedPackage, recipients, buyerInfo, pricing, deliveryMethod, tier, vendorDocs, vendorNotes, discount } = body;

    // Validate that either products or a package is selected
    const hasProducts = products && products.length > 0;
    const hasPackage = selectedPackage && selectedPackage.variantId;

    if (!hasProducts && !hasPackage) {
      return NextResponse.json(
        { error: 'No products or package selected' },
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

    // Build line items with variant IDs - from either products or package
    let lineItems: { variantId: string; quantity: number }[] = [];
    let giftTotal: number;

    if (hasPackage) {
      // Use the selected package
      lineItems = [{
        variantId: selectedPackage.variantId!,
        quantity: selectedPackage.quantity,
      }];
      giftTotal = selectedPackage.price;
    } else {
      // Use individual products
      lineItems = products
        .filter(sp => sp.product.variantId)
        .map(sp => ({
          variantId: sp.product.variantId!,
          quantity: sp.quantity,
        }));
      giftTotal = products.reduce(
        (sum, sp) => sum + sp.product.price * sp.quantity,
        0
      );
    }

    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Products must have Shopify variant IDs' },
        { status: 400 }
      );
    }

    // Create a products array for functions that expect it (for packages, create a synthetic product)
    const productsForExcel: SelectedProduct[] = hasPackage
      ? [{
          product: {
            id: selectedPackage.id,
            title: selectedPackage.name,
            description: selectedPackage.description,
            price: selectedPackage.price,
            image: selectedPackage.image,
            availableForTiers: [],
            inventory: 999,
            variantId: selectedPackage.variantId,
          },
          quantity: selectedPackage.quantity,
        }]
      : products;

    // Calculate order pricing (includes 15% delivery fee)
    const orderPricing = calculateOrderTotal(giftTotal, recipients.length, productsForExcel);

    // Calculate shipping cost for shipped orders (not one-location)
    const isShippedOrder = deliveryMethod && deliveryMethod.id !== 'one-location';
    const isDeliveryOrder = !deliveryMethod || deliveryMethod.id === 'one-location';
    const shippingCostPerRecipient = isShippedOrder ? deliveryMethod.price : 0;
    const totalShippingCost = shippingCostPerRecipient * recipients.length;

    // Delivery fee only applies to one-location delivery, not shipped orders
    const deliveryFee = isDeliveryOrder ? orderPricing.fulfillmentSubtotal : 0;

    // Re-validate discount server-side if provided
    let validatedDiscount: AppliedDiscount | undefined;
    let discountAmount = 0;
    if (discount && discount.code) {
      try {
        const lookupResult = await lookupDiscountCode(discount.code);
        if (lookupResult.valid) {
          if (lookupResult.valueType === 'PERCENTAGE') {
            discountAmount = Math.round((orderPricing.giftSubtotal * lookupResult.value) / 100 * 100) / 100;
          } else {
            discountAmount = Math.min(lookupResult.value, orderPricing.giftSubtotal);
          }
          validatedDiscount = {
            code: discount.code.trim().toUpperCase(),
            title: lookupResult.title,
            valueType: lookupResult.valueType,
            value: lookupResult.value,
            discountAmount,
          };
          console.log('Discount validated server-side:', validatedDiscount);
        } else {
          console.warn('Discount code no longer valid at order time:', lookupResult.error);
          // Proceed without discount
        }
      } catch (err) {
        console.warn('Error re-validating discount, proceeding without:', err);
      }
    }

    const grandTotal = orderPricing.giftSubtotal + deliveryFee + totalShippingCost - discountAmount;

    // Step 1: Create draft order first to get order number
    const result = await createDraftOrder(
      lineItems,
      pricing.perRecipientFee,
      recipients.length,
      buyerInfo,
      recipients,
      undefined,
      validatedDiscount
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
        products: productsForExcel,
        recipients,
        pricing: {
          giftSubtotal: orderPricing.giftSubtotal,
          fulfillmentSubtotal: deliveryFee,
          shippingCost: totalShippingCost,
          total: grandTotal,
          perRecipientFee: orderPricing.perRecipientFee,
          discountCode: validatedDiscount?.code,
          discountAmount: validatedDiscount?.discountAmount,
        },
        tier: tier || 'Unknown',
        deliveryMethod: deliveryMethod || undefined,
        vendorNotes: vendorNotes || undefined,
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

    // Step 4b: Store vendor info as custom attributes on draft order
    if (vendorDocs?.length || vendorNotes) {
      try {
        const vendorAttributes: { key: string; value: string }[] = [];

        if (vendorNotes) {
          vendorAttributes.push({ key: 'vendor_notes', value: vendorNotes });
        }

        if (vendorDocs && vendorDocs.length > 0) {
          vendorAttributes.push({
            key: 'vendor_doc_urls',
            value: vendorDocs.map((d) => d.url).join('\n'),
          });
          vendorAttributes.push({
            key: 'vendor_doc_filenames',
            value: vendorDocs.map((d) => d.filename).join(', '),
          });
        }

        await updateDraftOrderCustomAttributes(result.draftOrderId, vendorAttributes);
        console.log('Vendor info saved to draft order custom attributes');
      } catch (vendorErr) {
        console.error('Error saving vendor info to draft order:', vendorErr);
        // Continue - vendor info is optional
      }
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
          fulfillmentSubtotal: deliveryFee,
          shippingCost: totalShippingCost,
          total: grandTotal,
          perRecipientFee: orderPricing.perRecipientFee,
          discountCode: validatedDiscount?.code,
          discountAmount: validatedDiscount?.discountAmount,
        },
        tier || 'Unknown',
        excelBufferForEmail,
        excelFilenameForEmail,
        deliveryMethod,
        vendorDocs,
        vendorNotes
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

    // Step 6: Send Shopify draft order invoice to customer for payment
    let invoiceSent = false;
    let invoiceError: string | null = null;
    try {
      console.log('Sending Shopify draft order invoice to:', buyerInfo.email);

      // Build subject with order number and customer name
      const invoiceSubject = `Corporate Gifting Order ${result.draftOrderNumber} - ${buyerInfo.name}`;

      // Build custom message with order details and customer notes
      let customMessage = `Dear ${buyerInfo.name},\n\nThank you for your corporate gifting order with Brown Sugar Bakery!\n\nOrder Details:\n- Order Number: ${result.draftOrderNumber}\n- Company: ${buyerInfo.company}\n- Delivery Date: ${buyerInfo.deliveryDate ? new Date(buyerInfo.deliveryDate).toLocaleDateString() : 'To be confirmed'}\n- Delivery Method: ${deliveryMethod?.name || 'One-Location Delivery'}\n- Total Recipients: ${recipients.length}`;

      if (isShippedOrder) {
        customMessage += `\n- Shipping Cost: $${totalShippingCost.toFixed(2)} (${deliveryMethod.name} × ${recipients.length} recipients)`;
      }

      // Add customer notes if present
      if (buyerInfo.notes) {
        customMessage += `\n\nCustomer Notes:\n${buyerInfo.notes}`;
      }

      // Add vendor info if present
      if (vendorDocs?.length || vendorNotes) {
        customMessage += '\n\nPreferred Vendor Information:';
        if (vendorNotes) {
          customMessage += `\n${vendorNotes}`;
        }
        if (vendorDocs && vendorDocs.length > 0) {
          customMessage += `\nVendor Documents Submitted: ${vendorDocs.map((d) => d.filename).join(', ')}`;
        }
      }

      customMessage += '\n\nPlease review the invoice below and click the payment link to complete your purchase.\n\nWe look forward to helping you share the sweetness!\n\n- The Brown Sugar Bakery Team';

      const invoiceResult = await sendDraftOrderInvoice(
        result.draftOrderId,
        buyerInfo.email,
        invoiceSubject,
        customMessage
      );

      if (invoiceResult.success) {
        invoiceSent = true;
        console.log('Shopify draft order invoice sent successfully');
      } else {
        invoiceError = invoiceResult.error || 'Unknown error';
        console.warn('Failed to send Shopify draft order invoice:', invoiceError);
      }
    } catch (err) {
      invoiceError = err instanceof Error ? err.message : String(err);
      console.error('Error sending Shopify draft order invoice:', err);
      // Continue - order is already created
    }

    // Step 7: Send SMS notification if customer opted in - DISABLED FOR NOW
    let smsSent = false;
    let smsError: string | null = null;
    /*
    if (buyerInfo.notifyByText && buyerInfo.phone) {
      try {
        console.log('Sending SMS notification to:', buyerInfo.phone);
        const smsResult = await sendInvoiceSms(
          buyerInfo.phone,
          buyerInfo.name,
          result.draftOrderNumber,
          result.invoiceUrl
        );

        if (smsResult.success) {
          smsSent = true;
          console.log('SMS notification sent successfully');
        } else {
          smsError = smsResult.error || 'Unknown error';
          console.warn('Failed to send SMS notification:', smsError);
        }
      } catch (err) {
        smsError = err instanceof Error ? err.message : String(err);
        console.error('Error sending SMS notification:', err);
        // Continue - order is already created
      }
    }
    */

    return NextResponse.json({
      success: true,
      draftOrderId: result.draftOrderId,
      draftOrderNumber: result.draftOrderNumber,
      invoiceUrl: result.invoiceUrl,
      excelFileUrl: excelFileUrl || null,
      excelError: excelError || null,
      emailSent: emailSent,
      emailError: emailError || null,
      invoiceSent: invoiceSent,
      invoiceError: invoiceError || null,
      smsSent: smsSent,
      smsError: smsError || null,
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
