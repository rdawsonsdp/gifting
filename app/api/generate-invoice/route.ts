import { NextRequest, NextResponse } from 'next/server';
import { generateInvoicePDF } from '@/lib/invoice-generator';
import { SelectedProduct, BuyerInfo, Recipient, DeliveryMethod } from '@/lib/types';

interface RequestBody {
  orderNumber: string;
  buyerInfo: BuyerInfo;
  products: SelectedProduct[];
  recipients: Recipient[];
  pricing: {
    giftSubtotal: number;
    fulfillmentSubtotal: number;
    shippingCost?: number;
    total: number;
  };
  tier?: string;
  deliveryMethod?: DeliveryMethod;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { orderNumber, buyerInfo, products, recipients, pricing, tier, deliveryMethod } = body;

    if (!orderNumber || !buyerInfo || !products || !recipients || !pricing) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pdfBytes = await generateInvoicePDF({
      orderNumber,
      orderDate: new Date(),
      buyerInfo,
      products,
      recipients,
      pricing,
      tier,
      deliveryMethod,
    });

    // Return PDF as a downloadable file
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="BSB-Invoice-${orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
