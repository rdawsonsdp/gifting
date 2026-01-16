import { Product, SelectedProduct, Recipient, BuyerInfo } from './types';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_API_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
  console.warn('Shopify credentials not configured. Using mock data.');
}

const SHOPIFY_GRAPHQL_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function shopifyRequest<T>(query: string, variables?: Record<string, any>): Promise<T> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
    throw new Error('Shopify credentials not configured');
  }

  const response = await fetch(SHOPIFY_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  if (!result.data) {
    throw new Error('No data returned from Shopify');
  }

  return result.data;
}

// Commented out - using static products for now
// TODO: Uncomment to enable Shopify product fetching
/*
export async function fetchGiftProducts(): Promise<Product[]> {
  const query = `
    query {
      products(first: 50, query: "tag:corporate-gift") {
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
                  inventoryQuantity
                }
              }
            }
            tags
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyRequest<{
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
                  inventoryQuantity: number;
                };
              }>;
            };
            tags: string[];
          };
        }>;
      };
    }>(query);

    return data.products.edges.map(({ node }) => {
      const variant = node.variants.edges[0]?.node;
      return {
        id: node.id.split('/').pop() || '',
        title: node.title,
        description: node.description || '',
        price: parseFloat(variant?.price || '0'),
        image: node.featuredImage?.url || '',
        availableForTiers: node.tags.filter(tag => ['bronze', 'silver', 'gold', 'platinum'].includes(tag.toLowerCase())),
        inventory: variant?.inventoryQuantity || 0,
        variantId: variant?.id.split('/').pop() || undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching products from Shopify:', error);
    throw error;
  }
}
*/

export async function createDraftOrder(
  lineItems: Array<{ variantId: string; quantity: number }>,
  fulfillmentFee: number,
  recipientCount: number,
  buyerInfo: BuyerInfo,
  recipientData: Recipient[]
): Promise<{ draftOrderId: string; invoiceUrl: string }> {
  // Create line items for products
  const productLineItems = lineItems.map(item => ({
    variantId: `gid://shopify/ProductVariant/${item.variantId}`,
    quantity: item.quantity * recipientCount, // Multiply by recipient count
  }));

  // Add fulfillment fee as custom line item
  const customLineItems = [
    {
      title: `Fulfillment Fee (${recipientCount} recipients × $${fulfillmentFee.toFixed(2)})`,
      quantity: 1,
      originalUnitPrice: fulfillmentFee * recipientCount,
    },
  ];

  // Format recipient data for order note
  const recipientNote = recipientData
    .map((r, i) => {
      return `Recipient ${i + 1}:
${r.firstName} ${r.lastName}
${r.company ? `${r.company}\n` : ''}${r.address1}
${r.address2 ? `${r.address2}\n` : ''}${r.city}, ${r.state} ${r.zip}
${r.giftMessage ? `Message: ${r.giftMessage}` : ''}`;
    })
    .join('\n\n---\n\n');

  const note = `Corporate Gifting Order

Buyer: ${buyerInfo.name}
Company: ${buyerInfo.company}
Email: ${buyerInfo.email}
Phone: ${buyerInfo.phone}

Recipients (${recipientCount}):
${recipientNote}`;

  const mutation = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
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

  const variables = {
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
      ],
      note,
      email: buyerInfo.email,
      shippingAddress: {
        firstName: buyerInfo.name.split(' ')[0] || buyerInfo.name,
        lastName: buyerInfo.name.split(' ').slice(1).join(' ') || '',
        company: buyerInfo.company,
        phone: buyerInfo.phone,
      },
      customLineItems,
    },
  };

  try {
    const data = await shopifyRequest<{
      draftOrderCreate: {
        draftOrder: {
          id: string;
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

    return {
      draftOrderId,
      invoiceUrl: data.draftOrderCreate.draftOrder.invoiceUrl,
    };
  } catch (error) {
    console.error('Error creating draft order:', error);
    throw error;
  }
}
