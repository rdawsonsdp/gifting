import { Product, SelectedProduct, Recipient, BuyerInfo, AppliedDiscount } from './types';
import FormData from 'form-data';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
// Legacy token support (fallback)
const SHOPIFY_ADMIN_API_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

if (!SHOPIFY_STORE_DOMAIN) {
  console.warn('Shopify store domain not configured.');
}

if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
  if (!SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
    console.warn('Shopify credentials not configured. Using mock data.');
  }
}

const SHOPIFY_GRAPHQL_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`;

// Token cache for client credentials grant
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get access token using client credentials grant (OAuth 2.0)
 * Tokens expire after 24 hours (86399 seconds)
 */
async function getAccessToken(): Promise<string> {
  // If we have a legacy token configured, use it (doesn't expire)
  if (SHOPIFY_ADMIN_API_ACCESS_TOKEN && !SHOPIFY_CLIENT_ID) {
    return SHOPIFY_ADMIN_API_ACCESS_TOKEN;
  }

  // Check if we have a valid cached token (refresh 5 minutes before expiry)
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 5 * 60 * 1000) {
    return cachedToken;
  }

  // Need to fetch a new token using client credentials
  if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
    throw new Error('Shopify client credentials not configured');
  }

  console.log('Fetching new Shopify access token using client credentials...');

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
      }).toString(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error('No access token in response');
  }

  // Cache the token
  cachedToken = data.access_token;
  // Set expiry time (expires_in is in seconds, convert to milliseconds)
  tokenExpiresAt = now + (data.expires_in || 86399) * 1000;

  console.log('Successfully obtained new Shopify access token');

  return cachedToken;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function shopifyRequest<T>(query: string, variables?: Record<string, any>): Promise<T> {
  if (!SHOPIFY_STORE_DOMAIN) {
    throw new Error('Shopify store domain not configured');
  }

  const accessToken = await getAccessToken();

  const response = await fetch(SHOPIFY_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors) {
    const errorMessages = Array.isArray(result.errors)
      ? result.errors.map((e: any) => e.message || String(e)).join(', ')
      : String(result.errors);
    throw new Error(errorMessages);
  }

  if (!result.data) {
    throw new Error('No data returned from Shopify');
  }

  return result.data;
}

// Fetch products from the "Corporate Gifting Collection" collection
export async function fetchGiftProducts(): Promise<Product[]> {
  // First, get the collection by handle (URL-friendly name)
  // The collection handle is typically "corporate-gifting-collection" or "corporate-gifting" (lowercase, hyphens instead of spaces)
  const collectionHandle = process.env.SHOPIFY_COLLECTION_HANDLE || 'corporate-gifting-collection';
  
  const query = `
    query getCollectionProducts($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        title
        products(first: 50) {
          edges {
            node {
              id
              title
              description
              handle
              featuredImage {
                url
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    inventoryQuantity
                  }
                }
              }
              tags
              shippingCost: metafield(namespace: "custom", key: "shipping_cost") {
                value
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyRequest<{
      collectionByHandle: {
        id: string;
        title: string;
        products: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              description: string;
              handle: string;
              featuredImage: { url: string } | null;
              variants: {
                edges: Array<{
                  node: {
                    id: string;
                    price: string;
                    inventoryQuantity: number;
                  };
                }>;
              };
              tags: string[];
              shippingCost: { value: string } | null;
            };
          }>;
        };
      } | null;
    }>(query, { handle: collectionHandle });

    if (!data.collectionByHandle) {
      throw new Error(`Collection "${collectionHandle}" not found. Please check the collection handle in your Shopify store.`);
    }

    if (!data.collectionByHandle.products.edges.length) {
      console.warn(`Collection "${collectionHandle}" exists but has no products.`);
      return [];
    }

    return data.collectionByHandle.products.edges.map(({ node }) => {
      const variant = node.variants.edges[0]?.node;
      // Parse shipping cost from metafield (stored as JSON number or string)
      let shippingCost: number | undefined;
      if (node.shippingCost?.value) {
        const parsed = parseFloat(node.shippingCost.value);
        shippingCost = isNaN(parsed) ? undefined : parsed;
      }
      return {
        id: node.id.split('/').pop() || '',
        title: node.title,
        description: node.description || '',
        price: parseFloat(variant?.price || '0'),
        image: node.featuredImage?.url || '',
        availableForTiers: node.tags.filter(tag => ['bronze', 'silver', 'gold', 'platinum'].includes(tag.toLowerCase())),
        inventory: variant?.inventoryQuantity || 0,
        variantId: variant?.id.split('/').pop() || undefined,
        slug: node.handle,
        shippingCost,
      };
    });
  } catch (error) {
    console.error('Error fetching products from Shopify collection:', error);
    throw error;
  }
}

// Fetch products from the "Corporate Gift Packages" collection
export async function fetchGiftPackages(): Promise<Product[]> {
  const collectionHandle = 'corporate-gift-packages';
  console.log('Fetching gift packages from collection:', collectionHandle);

  const query = `
    query getCollectionProducts($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        title
        products(first: 20) {
          edges {
            node {
              id
              title
              description
              handle
              featuredImage {
                url
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    inventoryQuantity
                  }
                }
              }
              tags
              shippingCost: metafield(namespace: "custom", key: "shipping_cost") {
                value
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyRequest<{
      collectionByHandle: {
        id: string;
        title: string;
        products: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              description: string;
              handle: string;
              featuredImage: { url: string } | null;
              variants: {
                edges: Array<{
                  node: {
                    id: string;
                    price: string;
                    inventoryQuantity: number;
                  };
                }>;
              };
              tags: string[];
              shippingCost: { value: string } | null;
            };
          }>;
        };
      } | null;
    }>(query, { handle: collectionHandle });

    if (!data.collectionByHandle) {
      console.warn(`Gift packages collection "${collectionHandle}" not found.`);
      return [];
    }

    console.log(`Found collection "${data.collectionByHandle.title}" with ${data.collectionByHandle.products.edges.length} packages`);

    return data.collectionByHandle.products.edges.map(({ node }) => {
      const variant = node.variants.edges[0]?.node;
      // Parse shipping cost from metafield
      let shippingCost: number | undefined;
      if (node.shippingCost?.value) {
        const parsed = parseFloat(node.shippingCost.value);
        shippingCost = isNaN(parsed) ? undefined : parsed;
      }
      return {
        id: node.id.split('/').pop() || '',
        title: node.title,
        description: node.description || '',
        price: parseFloat(variant?.price || '0'),
        image: node.featuredImage?.url || '',
        availableForTiers: node.tags.filter(tag => ['bronze', 'silver', 'gold', 'platinum'].includes(tag.toLowerCase())),
        inventory: variant?.inventoryQuantity || 0,
        variantId: variant?.id.split('/').pop() || undefined,
        slug: node.handle,
        shippingCost,
      };
    });
  } catch (error) {
    console.error('Error fetching gift packages:', error);
    return [];
  }
}

// Fetch a single product by handle from Shopify
export async function fetchProductByHandle(handle: string): Promise<Product | null> {
  console.log('Fetching product by handle:', handle);

  const query = `
    query getProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        description
        descriptionHtml
        handle
        featuredImage {
          url
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              id
              price
              inventoryQuantity
            }
          }
        }
        tags
        shippingCost: metafield(namespace: "custom", key: "shipping_cost") {
          value
        }
      }
    }
  `;

  try {
    const data = await shopifyRequest<{
      productByHandle: {
        id: string;
        title: string;
        description: string;
        descriptionHtml: string;
        handle: string;
        featuredImage: { url: string } | null;
        images: {
          edges: Array<{
            node: {
              url: string;
              altText: string | null;
            };
          }>;
        };
        variants: {
          edges: Array<{
            node: {
              id: string;
              price: string;
              inventoryQuantity: number;
            };
          }>;
        };
        tags: string[];
        shippingCost: { value: string } | null;
      } | null;
    }>(query, { handle });

    if (!data.productByHandle) {
      console.warn(`Product with handle "${handle}" not found.`);
      return null;
    }

    const node = data.productByHandle;
    const variant = node.variants.edges[0]?.node;

    // Parse shipping cost from metafield
    let shippingCost: number | undefined;
    if (node.shippingCost?.value) {
      const parsed = parseFloat(node.shippingCost.value);
      shippingCost = isNaN(parsed) ? undefined : parsed;
    }

    return {
      id: node.id.split('/').pop() || '',
      title: node.title,
      description: node.description || '',
      price: parseFloat(variant?.price || '0'),
      image: node.featuredImage?.url || '',
      availableForTiers: node.tags.filter(tag => ['bronze', 'silver', 'gold', 'platinum'].includes(tag.toLowerCase())),
      inventory: variant?.inventoryQuantity || 0,
      variantId: variant?.id.split('/').pop() || undefined,
      slug: node.handle,
      descriptionHtml: node.descriptionHtml,
      images: node.images.edges.map(edge => edge.node.url),
      shippingCost,
    } as Product & { descriptionHtml?: string; images?: string[] };
  } catch (error) {
    console.error('Error fetching product by handle:', error);
    return null;
  }
}

// Fetch products from the "Corporate Gifting Special Offer" collection
export async function fetchSpecialOfferProducts(): Promise<Product[]> {
  const collectionHandle = process.env.SHOPIFY_SPECIAL_OFFER_COLLECTION_HANDLE || 'corporate-gifting-special-offer';
  console.log('Fetching special offers from collection:', collectionHandle);

  const query = `
    query getCollectionProducts($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        title
        products(first: 20) {
          edges {
            node {
              id
              title
              description
              featuredImage {
                url
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    compareAtPrice
                    inventoryQuantity
                  }
                }
              }
              tags
              shippingCost: metafield(namespace: "custom", key: "shipping_cost") {
                value
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyRequest<{
      collectionByHandle: {
        id: string;
        title: string;
        products: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              description: string;
              featuredImage: { url: string } | null;
              variants: {
                edges: Array<{
                  node: {
                    id: string;
                    price: string;
                    compareAtPrice: string | null;
                    inventoryQuantity: number;
                  };
                }>;
              };
              tags: string[];
              shippingCost: { value: string } | null;
            };
          }>;
        };
      } | null;
    }>(query, { handle: collectionHandle });

    if (!data.collectionByHandle) {
      console.warn(`Special offer collection "${collectionHandle}" not found. Please check the collection handle in Shopify.`);
      console.warn('Hint: Go to Shopify Admin > Products > Collections > [Your Collection] and check the URL handle in settings.');
      return [];
    }

    console.log(`Found collection "${data.collectionByHandle.title}" with products`);

    if (!data.collectionByHandle.products.edges.length) {
      console.warn(`Special offer collection "${collectionHandle}" exists but has no products.`);
      return [];
    }

    return data.collectionByHandle.products.edges.map(({ node }) => {
      const variant = node.variants.edges[0]?.node;
      // Parse shipping cost from metafield
      let shippingCost: number | undefined;
      if (node.shippingCost?.value) {
        const parsed = parseFloat(node.shippingCost.value);
        shippingCost = isNaN(parsed) ? undefined : parsed;
      }
      return {
        id: node.id.split('/').pop() || '',
        title: node.title,
        description: node.description || '',
        price: parseFloat(variant?.price || '0'),
        image: node.featuredImage?.url || '',
        availableForTiers: node.tags.filter(tag => ['bronze', 'silver', 'gold', 'platinum'].includes(tag.toLowerCase())),
        inventory: variant?.inventoryQuantity || 0,
        variantId: variant?.id.split('/').pop() || undefined,
        compareAtPrice: variant?.compareAtPrice ? parseFloat(variant.compareAtPrice) : undefined,
        shippingCost,
      };
    });
  } catch (error) {
    console.error('Error fetching special offer products:', error);
    return [];
  }
}

// Fetch products from the "Corporate Gifting Promotional" collection
export async function fetchPromotionalProducts(): Promise<Product[]> {
  const collectionHandle = process.env.SHOPIFY_PROMOTIONAL_COLLECTION_HANDLE || 'corporate-gifting-promotional';

  const query = `
    query getCollectionProducts($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        title
        products(first: 50) {
          edges {
            node {
              id
              title
              description
              handle
              featuredImage {
                url
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    compareAtPrice
                    inventoryQuantity
                  }
                }
              }
              tags
              shippingCost: metafield(namespace: "custom", key: "shipping_cost") {
                value
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyRequest<{
      collectionByHandle: {
        id: string;
        title: string;
        products: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              description: string;
              handle: string;
              featuredImage: { url: string } | null;
              variants: {
                edges: Array<{
                  node: {
                    id: string;
                    price: string;
                    compareAtPrice: string | null;
                    inventoryQuantity: number;
                  };
                }>;
              };
              tags: string[];
              shippingCost: { value: string } | null;
            };
          }>;
        };
      } | null;
    }>(query, { handle: collectionHandle });

    if (!data.collectionByHandle) {
      console.warn(`Promotional collection "${collectionHandle}" not found.`);
      return [];
    }

    if (!data.collectionByHandle.products.edges.length) {
      console.warn(`Promotional collection "${collectionHandle}" exists but has no products.`);
      return [];
    }

    return data.collectionByHandle.products.edges.map(({ node }) => {
      const variant = node.variants.edges[0]?.node;
      let shippingCost: number | undefined;
      if (node.shippingCost?.value) {
        const parsed = parseFloat(node.shippingCost.value);
        shippingCost = isNaN(parsed) ? undefined : parsed;
      }
      return {
        id: node.id.split('/').pop() || '',
        title: node.title,
        description: node.description || '',
        price: parseFloat(variant?.price || '0'),
        image: node.featuredImage?.url || '',
        availableForTiers: node.tags.filter(tag => ['bronze', 'silver', 'gold', 'platinum'].includes(tag.toLowerCase())),
        inventory: variant?.inventoryQuantity || 0,
        variantId: variant?.id.split('/').pop() || undefined,
        slug: node.handle,
        compareAtPrice: variant?.compareAtPrice ? parseFloat(variant.compareAtPrice) : undefined,
        shippingCost,
      };
    });
  } catch (error) {
    console.error('Error fetching promotional products:', error);
    return [];
  }
}

/**
 * Lookup a discount code via Shopify Admin REST API.
 * Uses /discount_codes/lookup.json + /price_rules/{id}.json
 * which require the `read_price_rules` scope.
 */
export async function lookupDiscountCode(code: string): Promise<
  | { valid: true; title: string; valueType: 'PERCENTAGE' | 'FIXED_AMOUNT'; value: number }
  | { valid: false; error: string }
> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
    return { valid: false, error: 'Shopify credentials not configured' };
  }

  const normalizedCode = code.trim().toUpperCase();
  const restBase = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01`;

  try {
    // Step 1: Look up the discount code to get its price_rule_id
    // Shopify returns a 303 redirect; we follow it manually to preserve the auth header
    const lookupUrl = `${restBase}/discount_codes/lookup.json?code=${encodeURIComponent(normalizedCode)}`;
    let lookupRes = await fetch(lookupUrl, {
      headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN },
      redirect: 'manual',
    });

    // Follow redirect manually so auth header is preserved
    if (lookupRes.status === 301 || lookupRes.status === 302 || lookupRes.status === 303) {
      const redirectUrl = lookupRes.headers.get('location');
      if (redirectUrl) {
        const fullUrl = redirectUrl.startsWith('http') ? redirectUrl : `https://${SHOPIFY_STORE_DOMAIN}${redirectUrl}`;
        lookupRes = await fetch(fullUrl, {
          headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN },
        });
      }
    }

    if (lookupRes.status === 404) {
      return { valid: false, error: 'Discount code not found' };
    }
    if (!lookupRes.ok) {
      const errText = await lookupRes.text();
      console.error('Discount lookup failed:', lookupRes.status, errText);
      return { valid: false, error: 'Failed to validate discount code' };
    }

    const lookupData = await lookupRes.json();
    const discountCode = lookupData.discount_code;
    if (!discountCode) {
      return { valid: false, error: 'Discount code not found' };
    }

    const priceRuleId = discountCode.price_rule_id;
    if (!priceRuleId) {
      return { valid: false, error: 'Discount code has no associated price rule' };
    }

    // Step 2: Fetch the price rule to get the value details
    const priceRuleUrl = `${restBase}/price_rules/${priceRuleId}.json`;
    const priceRuleRes = await fetch(priceRuleUrl, {
      headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN },
    });

    if (!priceRuleRes.ok) {
      const errText = await priceRuleRes.text();
      console.error('Price rule fetch failed:', priceRuleRes.status, errText);
      return { valid: false, error: 'Failed to retrieve discount details' };
    }

    const priceRuleData = await priceRuleRes.json();
    const rule = priceRuleData.price_rule;
    if (!rule) {
      return { valid: false, error: 'Price rule not found' };
    }

    // Check date range
    const now = new Date();
    if (rule.starts_at && new Date(rule.starts_at) > now) {
      return { valid: false, error: 'This discount code is not yet active' };
    }
    if (rule.ends_at && new Date(rule.ends_at) < now) {
      return { valid: false, error: 'This discount code has expired' };
    }

    // Determine value type and value
    // Shopify REST price rule value_type: "percentage" or "fixed_amount"
    // value is negative (e.g. "-10.0" for 10% off or "-5.00" for $5 off)
    const valueType = rule.value_type === 'percentage' ? 'PERCENTAGE' : 'FIXED_AMOUNT';
    const rawValue = parseFloat(rule.value);
    const value = Math.abs(rawValue); // Shopify stores as negative

    const title = rule.title || normalizedCode;

    return { valid: true, title, valueType, value };
  } catch (error) {
    console.error('Error looking up discount code:', error);
    return { valid: false, error: 'Failed to validate discount code' };
  }
}

export async function createDraftOrder(
  lineItems: Array<{ variantId: string; quantity: number }>,
  fulfillmentFee: number,
  recipientCount: number,
  buyerInfo: BuyerInfo,
  recipientData: Recipient[],
  excelFileUrl?: string,
  appliedDiscount?: AppliedDiscount
): Promise<{ draftOrderId: string; draftOrderNumber: string; invoiceUrl: string }> {
  // Create line items for products
  const productLineItems = lineItems.map(item => ({
    variantId: `gid://shopify/ProductVariant/${item.variantId}`,
    quantity: item.quantity * recipientCount, // Multiply by recipient count
  }));

  // Add delivery fee as custom line item (using DraftOrderLineItemInput)
  // Note: For MVP, we'll add delivery fee to the note and handle pricing manually
  // Custom line items can be added later if needed via Shopify admin
  const customLineItems: Array<{
    title: string;
    quantity: number;
    originalUnitPrice: string;
  }> = [
    {
      title: `Delivery Fee`,
      quantity: 1,
      originalUnitPrice: fulfillmentFee.toFixed(2),
    },
  ];

  const deliveryFee = fulfillmentFee; // Flat delivery fee
  
  // Format delivery date for display
  const deliveryDateFormatted = buyerInfo.deliveryDate 
    ? new Date(buyerInfo.deliveryDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Not specified';
  
  // Note: Recipient details are in the Excel file, not in the note
  // The Excel file URL will be appended after the file is created
  const note = `Corporate Gifting Order

Buyer: ${buyerInfo.name}
Company: ${buyerInfo.company}
Email: ${buyerInfo.email}
Phone: ${buyerInfo.phone}
Delivery Date: ${deliveryDateFormatted}
${buyerInfo.notes ? `\nOrder Notes:\n${buyerInfo.notes}` : ''}

Order Details:
- Total Recipients: ${recipientCount}
- Delivery Fee: $${deliveryFee.toFixed(2)}${appliedDiscount ? `\n- Discount (${appliedDiscount.code}): -$${appliedDiscount.discountAmount.toFixed(2)}` : ''}

Note: Complete recipient list is available in the Excel spreadsheet (link will be added below).`;

  const mutation = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          name
          invoiceUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables: {
    input: {
      lineItems: Array<{ variantId: string; quantity: number }>;
      customAttributes: Array<{ key: string; value: string }>;
      note: string;
      email: string;
      tags: string[];
      shippingAddress: {
        firstName: string;
        lastName: string;
        company: string;
        phone: string;
      };
      appliedDiscount?: {
        title: string;
        description: string;
        value: number;
        valueType: 'PERCENTAGE' | 'FIXED_AMOUNT';
      };
      customLineItems?: Array<{
        title: string;
        quantity: number;
        originalUnitPrice: string;
      }>;
    };
  } = {
    input: {
      lineItems: productLineItems,
      customAttributes: [
        {
          key: 'recipient_count',
          value: recipientCount.toString(),
        },
        {
          key: 'order_type',
          value: 'corporate_gifting',
        },
        {
          key: 'delivery_fee',
          value: deliveryFee.toFixed(2),
        },
        {
          key: 'delivery_date',
          value: buyerInfo.deliveryDate || '',
        },
        ...(excelFileUrl ? [
          {
            key: 'excel_file_url',
            value: excelFileUrl,
          },
        ] : []),
        ...(appliedDiscount ? [
          {
            key: 'discount_code',
            value: appliedDiscount.code,
          },
          {
            key: 'discount_amount',
            value: appliedDiscount.discountAmount.toFixed(2),
          },
        ] : []),
      ],
      note,
      email: buyerInfo.email,
      tags: ['Corporate Gifting'],
      shippingAddress: {
        firstName: buyerInfo.name.split(' ')[0] || buyerInfo.name,
        lastName: buyerInfo.name.split(' ').slice(1).join(' ') || '',
        company: buyerInfo.company,
        phone: buyerInfo.phone,
      },
      ...(appliedDiscount ? {
        appliedDiscount: {
          title: appliedDiscount.title,
          description: `Discount code: ${appliedDiscount.code}`,
          value: appliedDiscount.value,
          valueType: appliedDiscount.valueType,
        },
      } : {}),
      // Note: customLineItems removed for MVP - delivery fee added to note and customAttributes
      // Staff will manually add delivery fee as line item in Shopify admin
    },
  };

  try {
    const data = await shopifyRequest<{
      draftOrderCreate: {
        draftOrder: {
          id: string;
          name: string;
          invoiceUrl: string;
        } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(mutation, variables);

    if (data.draftOrderCreate.userErrors.length > 0) {
      throw new Error(
        data.draftOrderCreate.userErrors.map(e => e.message).join(', ')
      );
    }

    if (!data.draftOrderCreate.draftOrder) {
      throw new Error('Failed to create draft order');
    }

    const draftOrderId = data.draftOrderCreate.draftOrder.id.split('/').pop() || '';
    const draftOrderNumber = data.draftOrderCreate.draftOrder.name || draftOrderId;

    return {
      draftOrderId,
      draftOrderNumber,
      invoiceUrl: data.draftOrderCreate.draftOrder.invoiceUrl,
    };
  } catch (error) {
    console.error('Error creating draft order:', error);
    throw error;
  }
}

/**
 * Update a draft order with additional custom attributes
 */
export async function updateDraftOrderCustomAttributes(
  draftOrderId: string,
  customAttributes: Array<{ key: string; value: string }>
): Promise<void> {
  const mutation = `
    mutation draftOrderUpdate($id: ID!, $input: DraftOrderInput!) {
      draftOrderUpdate(id: $id, input: $input) {
        draftOrder {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    id: `gid://shopify/DraftOrder/${draftOrderId}`,
    input: {
      customAttributes,
    },
  };

  try {
    const data = await shopifyRequest<{
      draftOrderUpdate: {
        draftOrder: { id: string } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(mutation, variables);

    if (data.draftOrderUpdate.userErrors.length > 0) {
      throw new Error(
        data.draftOrderUpdate.userErrors.map(e => e.message).join(', ')
      );
    }
  } catch (error) {
    console.error('Error updating draft order:', error);
    throw error;
  }
}

/**
 * Update draft order note with Excel file URL
 */
export async function updateDraftOrderNote(
  draftOrderId: string,
  note: string
): Promise<void> {
  const mutation = `
    mutation draftOrderUpdate($id: ID!, $input: DraftOrderInput!) {
      draftOrderUpdate(id: $id, input: $input) {
        draftOrder {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Handle both GID format and plain ID format
  const orderId = draftOrderId.startsWith('gid://') 
    ? draftOrderId 
    : `gid://shopify/DraftOrder/${draftOrderId}`;

  const variables = {
    id: orderId,
    input: {
      note,
    },
  };

  try {
    const data = await shopifyRequest<{
      draftOrderUpdate: {
        draftOrder: { id: string } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(mutation, variables);

    if (data.draftOrderUpdate.userErrors.length > 0) {
      throw new Error(
        data.draftOrderUpdate.userErrors.map(e => e.message).join(', ')
      );
    }
  } catch (error) {
    console.error('Error updating draft order note:', error);
    throw error;
  }
}

/**
 * Fetch current draft order note
 */
async function getDraftOrderNote(draftOrderId: string): Promise<string> {
  const query = `
    query getDraftOrder($id: ID!) {
      draftOrder(id: $id) {
        id
        note
      }
    }
  `;

  // Handle both GID format and plain ID format
  const orderId = draftOrderId.startsWith('gid://') 
    ? draftOrderId 
    : `gid://shopify/DraftOrder/${draftOrderId}`;

  const variables = {
    id: orderId,
  };

  try {
    const data = await shopifyRequest<{
      draftOrder: {
        id: string;
        note: string | null;
      } | null;
    }>(query, variables);

    if (!data.draftOrder) {
      throw new Error('Draft order not found');
    }

    return data.draftOrder.note || '';
  } catch (error) {
    console.error('Error fetching draft order note:', error);
    throw error;
  }
}

/**
 * Append Excel URL to draft order note
 */
export async function appendExcelUrlToDraftOrderNote(
  draftOrderId: string,
  excelFileUrl: string,
  recipientCount?: number
): Promise<void> {
  try {
    console.log('Appending Excel URL to draft order note:', { draftOrderId, excelFileUrl });
    
    // Get current note
    const currentNote = await getDraftOrderNote(draftOrderId);
    console.log('Current note length:', currentNote.length);
    
    // Check if URL is already in the note
    if (currentNote.includes(excelFileUrl)) {
      console.log('Excel URL already present in draft order note');
      return;
    }

    // Append Excel URL as a clear, clickable link
    // Format it prominently so it's easy to find and click
    const recipientCountText = recipientCount !== undefined 
      ? `\nTotal Recipients: ${recipientCount}`
      : '';
    
    const excelUrlText = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📎 EXCEL RECIPIENT LIST:${recipientCountText}
${excelFileUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    // Append the URL to the note
    const updatedNote = currentNote + excelUrlText;
    console.log('Updated note length:', updatedNote.length);

    // Update draft order with new note
    await updateDraftOrderNote(draftOrderId, updatedNote);
    console.log('✅ Excel URL appended to draft order note successfully');
  } catch (error) {
    console.error('❌ Error appending Excel URL to draft order note:', error);
    // Don't throw - allow order to succeed even if note update fails
    // The URL is still in custom attributes
  }
}

/**
 * Upload a file to Shopify Files API
 * Returns the public URL of the uploaded file, or throws error for fallback handling
 */
export async function uploadFileToShopify(
  fileBuffer: Buffer,
  filename: string,
  contentType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
): Promise<string> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
    throw new Error('Shopify credentials not configured');
  }

  // Try REST API first (simpler)
  try {
    const base64Content = fileBuffer.toString('base64');
    const formData = new FormData();
    formData.append('file[attachment]', base64Content);
    formData.append('file[filename]', filename);
    formData.append('file[content_type]', contentType);

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/files.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
          ...formData.getHeaders(),
        },
        body: formData as any,
      }
    );

    const responseText = await response.text();
    
    if (response.ok) {
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
      }
      
      if (data.file && data.file.url) {
        return data.file.url;
      }

      if (data.errors) {
        throw new Error(`Shopify API errors: ${JSON.stringify(data.errors)}`);
      }
    }
    
    // If REST API fails, throw error to trigger fallback
    throw new Error(`REST API upload failed: ${response.status}`);
  } catch (error) {
    console.error('Shopify Files API upload failed, will use base64 fallback:', error);
    throw error; // Re-throw to trigger fallback in calling code
  }
}

/**
 * Get base64 representation of file for fallback storage
 */
export function getFileBase64(fileBuffer: Buffer): string {
  return fileBuffer.toString('base64');
}

/**
 * Send draft order invoice to customer for payment
 * This sends the Shopify draft order invoice email to the customer
 */
export async function sendDraftOrderInvoice(
  draftOrderId: string,
  toEmail?: string,
  subject?: string,
  customMessage?: string
): Promise<{ success: boolean; error?: string }> {
  const mutation = `
    mutation draftOrderInvoiceSend($id: ID!, $email: EmailInput) {
      draftOrderInvoiceSend(id: $id, email: $email) {
        draftOrder {
          id
          invoiceUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Handle both GID format and plain ID format
  const orderId = draftOrderId.startsWith('gid://')
    ? draftOrderId
    : `gid://shopify/DraftOrder/${draftOrderId}`;

  // Build email input if custom values provided
  const emailInput = toEmail || subject || customMessage ? {
    to: toEmail,
    subject: subject || 'Invoice from Brown Sugar Bakery - Corporate Gifting',
    customMessage: customMessage || 'Thank you for your corporate gifting order! Please review the attached invoice and complete your payment.',
  } : undefined;

  const variables: {
    id: string;
    email?: {
      to?: string;
      subject?: string;
      customMessage?: string;
    };
  } = {
    id: orderId,
    ...(emailInput && { email: emailInput }),
  };

  try {
    console.log('Sending draft order invoice:', { draftOrderId, toEmail });

    const data = await shopifyRequest<{
      draftOrderInvoiceSend: {
        draftOrder: { id: string; invoiceUrl: string } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(mutation, variables);

    if (data.draftOrderInvoiceSend.userErrors.length > 0) {
      const errorMessage = data.draftOrderInvoiceSend.userErrors
        .map((e) => e.message)
        .join(', ');
      console.error('Error sending draft order invoice:', errorMessage);
      return { success: false, error: errorMessage };
    }

    console.log('✅ Draft order invoice sent successfully');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error sending draft order invoice:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
