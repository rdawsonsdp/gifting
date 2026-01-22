import { NextRequest, NextResponse } from 'next/server';
import { generateInvoicePDF } from '@/lib/invoice-generator';
import { SelectedProduct, Recipient, BuyerInfo } from '@/lib/types';

interface InvoiceRequestBody {
  orderNumber: string;
  buyerInfo: BuyerInfo;
  products: SelectedProduct[];
  recipients: Recipient[];
  pricing: {
    giftSubtotal: number;
    fulfillmentSubtotal: number;
    total: number;
    shippingPerRecipient?: number;
  };
  tier?: string;
  specialInstructions?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: InvoiceRequestBody = await request.json();

    const {
      orderNumber,
      buyerInfo,
      products,
      recipients,
      pricing,
      tier,
      specialInstructions,
    } = body;

    // Validate required fields
    if (!orderNumber || !buyerInfo || !products || !recipients || !pricing) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate the PDF
    const pdfBytes = await generateInvoicePDF({
      orderNumber,
      orderDate: new Date(),
      buyerInfo,
      products,
      recipients,
      pricing,
      tier,
      specialInstructions: specialInstructions || buyerInfo.notes,
    });

    // Convert Uint8Array to Buffer for NextResponse
    const pdfBuffer = Buffer.from(pdfBytes);

    // Return as downloadable PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice_${orderNumber.replace('#', '')}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
