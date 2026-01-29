import { NextRequest, NextResponse } from 'next/server';
import { lookupDiscountCode } from '@/lib/shopify';

export async function POST(request: NextRequest) {
  try {
    const { code, orderSubtotal } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Discount code is required' },
        { status: 400 }
      );
    }

    if (typeof orderSubtotal !== 'number' || orderSubtotal <= 0) {
      return NextResponse.json(
        { valid: false, error: 'Valid order subtotal is required' },
        { status: 400 }
      );
    }

    const result = await lookupDiscountCode(code);

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error });
    }

    // Compute the dollar discount amount
    let discountAmount: number;
    if (result.valueType === 'PERCENTAGE') {
      discountAmount = Math.round((orderSubtotal * result.value) / 100 * 100) / 100;
    } else {
      // FIXED_AMOUNT — cap at subtotal
      discountAmount = Math.min(result.value, orderSubtotal);
    }

    return NextResponse.json({
      valid: true,
      code: code.trim().toUpperCase(),
      title: result.title,
      valueType: result.valueType,
      value: result.value,
      discountAmount,
    });
  } catch (error) {
    console.error('Error validating discount code:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
