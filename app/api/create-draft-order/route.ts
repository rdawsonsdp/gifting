import { NextRequest, NextResponse } from 'next/server';
import { createDraftOrder } from '@/lib/shopify';
import { SelectedProduct, Recipient, BuyerInfo } from '@/lib/types';

interface RequestBody {
  products: SelectedProduct[];
  recipients: Recipient[];
  buyerInfo: BuyerInfo;
  pricing: {
    fulfillmentSubtotal: number;
    perRecipientFee: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { products, recipients, buyerInfo, pricing } = body;

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

    const result = await createDraftOrder(
      lineItems,
      pricing.perRecipientFee,
      recipients.length,
      buyerInfo,
      recipients
    );

    return NextResponse.json({
      draftOrderId: result.draftOrderId,
      invoiceUrl: result.invoiceUrl,
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
