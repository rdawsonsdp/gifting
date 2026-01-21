import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_API_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

const SHOPIFY_GRAPHQL_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`;

interface ShippingRate {
  id: string;
  name: string;
  price: number;
  currency: string;
  estimatedDays?: string;
}

interface ShippingRatesResponse {
  rates: ShippingRate[];
  fallbackRates?: ShippingRate[];
}

async function fetchShopifyShippingProfiles(): Promise<any> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
    throw new Error('Shopify credentials not configured');
  }

  // Query delivery profiles and their shipping rates
  const query = `
    query getDeliveryProfiles {
      deliveryProfiles(first: 10) {
        edges {
          node {
            id
            name
            default
            profileLocationGroups {
              locationGroup {
                id
              }
              locationGroupZones(first: 20) {
                edges {
                  node {
                    zone {
                      id
                      name
                      countries {
                        code {
                          countryCode
                        }
                        provinces {
                          code
                        }
                      }
                    }
                    methodDefinitions(first: 20) {
                      edges {
                        node {
                          id
                          name
                          active
                          rateProvider {
                            ... on DeliveryRateDefinition {
                              id
                              price {
                                amount
                                currencyCode
                              }
                            }
                            ... on DeliveryParticipant {
                              id
                              carrierService {
                                id
                                name
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(SHOPIFY_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('Shopify GraphQL errors:', result.errors);
    throw new Error(result.errors.map((e: any) => e.message).join(', '));
  }

  return result.data;
}

function parseShippingRates(data: any): ShippingRate[] {
  const rates: ShippingRate[] = [];

  try {
    const profiles = data?.deliveryProfiles?.edges || [];

    for (const profileEdge of profiles) {
      const profile = profileEdge.node;
      const locationGroups = profile.profileLocationGroups || [];

      for (const locationGroup of locationGroups) {
        const zones = locationGroup.locationGroupZones?.edges || [];

        for (const zoneEdge of zones) {
          const zone = zoneEdge.node;
          const methodDefinitions = zone.methodDefinitions?.edges || [];

          for (const methodEdge of methodDefinitions) {
            const method = methodEdge.node;

            if (method.active && method.rateProvider?.price) {
              rates.push({
                id: method.id,
                name: method.name,
                price: parseFloat(method.rateProvider.price.amount),
                currency: method.rateProvider.price.currencyCode,
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error parsing shipping rates:', error);
  }

  return rates;
}

// Fallback rates if Shopify rates can't be fetched
const FALLBACK_SHIPPING_RATES: ShippingRate[] = [
  {
    id: 'one-location',
    name: 'One-Location Delivery',
    price: 0,
    currency: 'USD',
    estimatedDays: '3-5 business days',
  },
  {
    id: 'usps',
    name: 'USPS',
    price: 8.99,
    currency: 'USD',
    estimatedDays: '5-7 business days',
  },
  {
    id: 'ups-ground',
    name: 'UPS Ground',
    price: 12.99,
    currency: 'USD',
    estimatedDays: '3-5 business days',
  },
  {
    id: 'ups-2day',
    name: 'UPS 2nd Day Air',
    price: 24.99,
    currency: 'USD',
    estimatedDays: '2 business days',
  },
];

export async function GET(request: NextRequest) {
  try {
    // Try to fetch rates from Shopify
    const shopifyData = await fetchShopifyShippingProfiles();
    const shopifyRates = parseShippingRates(shopifyData);

    // If we got rates from Shopify, map them to our delivery methods
    if (shopifyRates.length > 0) {
      // Try to match Shopify rates to our delivery methods
      const mappedRates: ShippingRate[] = [];

      // Look for matching rate names (case-insensitive)
      for (const fallbackRate of FALLBACK_SHIPPING_RATES) {
        const matchingRate = shopifyRates.find(
          (r) =>
            r.name.toLowerCase().includes(fallbackRate.name.toLowerCase()) ||
            fallbackRate.name.toLowerCase().includes(r.name.toLowerCase())
        );

        if (matchingRate) {
          mappedRates.push({
            ...fallbackRate,
            price: matchingRate.price,
            currency: matchingRate.currency,
          });
        } else {
          // Use fallback if no match found
          mappedRates.push(fallbackRate);
        }
      }

      return NextResponse.json({
        rates: mappedRates,
        source: 'shopify',
      });
    }

    // If no Shopify rates, return fallback rates
    return NextResponse.json({
      rates: FALLBACK_SHIPPING_RATES,
      source: 'fallback',
    });
  } catch (error) {
    console.error('Error fetching shipping rates:', error);

    // Return fallback rates on error
    return NextResponse.json({
      rates: FALLBACK_SHIPPING_RATES,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deliveryMethod, recipientCount, destinationZip } = body;

    // Fetch base rates
    const ratesResponse = await GET(request);
    const ratesData = await ratesResponse.json();

    // Find the rate for the selected delivery method
    const selectedRate = ratesData.rates.find(
      (r: ShippingRate) => r.id === deliveryMethod
    );

    if (!selectedRate) {
      return NextResponse.json(
        { error: 'Invalid delivery method' },
        { status: 400 }
      );
    }

    // Calculate total shipping cost
    // One-location delivery is flat rate, others are per-recipient
    const shippingCostPerRecipient =
      deliveryMethod === 'one-location' ? 0 : selectedRate.price;
    const totalShippingCost =
      deliveryMethod === 'one-location'
        ? selectedRate.price
        : selectedRate.price * recipientCount;

    return NextResponse.json({
      deliveryMethod,
      rateName: selectedRate.name,
      pricePerRecipient: shippingCostPerRecipient,
      totalShippingCost,
      recipientCount,
      currency: selectedRate.currency,
      estimatedDays: selectedRate.estimatedDays,
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}
