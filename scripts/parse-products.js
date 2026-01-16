const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Read the CSV file
const csvPath = '/Users/robd/Downloads/products_export_1.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
});

// Helper to strip HTML tags
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

// Extract products suitable for corporate gifting
const products = [];
const productMap = new Map();

records.forEach((row) => {
  const handle = row.Handle?.trim();
  const title = row.Title?.trim();
  const price = parseFloat(row['Variant Price'] || '0');
  const status = row.Status?.trim();
  const published = row.Published === 'true';
  const imageSrc = row['Image Src']?.trim();
  const description = stripHtml(row['Body (HTML)'] || '');
  const tags = row.Tags?.split(',').map(t => t.trim()).filter(Boolean) || [];
  const variantSku = row['Variant SKU']?.trim();
  
  // Skip if no handle, title, or invalid price
  if (!handle || !title || !price || price <= 0) return;
  
  // Skip draft/unpublished products (unless they're good for testing)
  if (status === 'draft' && !published) return;
  
  // Focus on products suitable for corporate gifting:
  // - Chocolates/Candy
  // - Mini Cupcakes
  // - Smaller cakes/pound cakes
  // - Gift boxes
  const isGiftable = 
    title.toLowerCase().includes('chocolate') ||
    title.toLowerCase().includes('tortue') ||
    title.toLowerCase().includes('melt') ||
    title.toLowerCase().includes('caramel') ||
    title.toLowerCase().includes('mini cup') ||
    title.toLowerCase().includes('pound cake') ||
    title.toLowerCase().includes('assortment') ||
    title.toLowerCase().includes('cream') ||
    tags.some(t => t.toLowerCase().includes('chocolate') || t.toLowerCase().includes('gift'));
  
  if (!isGiftable) return;
  
  // Skip large cakes (over $100) unless they're specifically for shipping
  if (price > 100 && !title.toLowerCase().includes('shipping')) return;
  
  // Get or create product
  if (!productMap.has(handle)) {
    const product = {
      id: handle,
      title: title,
      description: description || `${title} from Brown Sugar Bakery`,
      price: price,
      image: imageSrc || '',
      availableForTiers: [],
      inventory: 100, // Default inventory
      variantId: variantSku || `VAR-${handle.toUpperCase().substring(0, 8)}`,
      handle: handle,
    };
    
    productMap.set(handle, product);
    products.push(product);
  } else {
    // Update if this variant has a better price or image
    const product = productMap.get(handle);
    if (imageSrc && !product.image) {
      product.image = imageSrc;
    }
    if (variantSku && !product.variantId) {
      product.variantId = variantSku;
    } else if (!product.variantId) {
      product.variantId = `VAR-${handle.toUpperCase().substring(0, 8)}`;
    }
  }
});

// Assign products to tiers based on price
products.forEach(product => {
  const price = product.price;
  
  if (price >= 15 && price <= 25) {
    product.availableForTiers.push('bronze');
  }
  if (price >= 35 && price <= 50) {
    product.availableForTiers.push('silver');
  }
  if (price >= 75 && price <= 100) {
    product.availableForTiers.push('gold');
  }
  if (price >= 150 && price <= 250) {
    product.availableForTiers.push('platinum');
  }
  
  // If no tier assigned, make available to all
  if (product.availableForTiers.length === 0) {
    product.availableForTiers = ['bronze', 'silver', 'gold', 'platinum'];
  }
});

// Create logical gift packages (as regular products for MVP)
const packages = [
  // Bronze Tier Packages ($15-25)
  {
    id: 'bronze-chocolate-sampler',
    title: 'Chocolate Sampler Box',
    description: 'A curated selection of our finest chocolates including Tortues, Melt-A-Ways, and Sea Salt Caramels. Perfect for appreciation gifts.',
    price: 19.99,
    image: products.find(p => p.title.toLowerCase().includes('tortue') && p.image)?.image || '',
    availableForTiers: ['bronze'],
    inventory: 100,
    variantId: 'BRONZE-SAMPLER',
    handle: 'bronze-chocolate-sampler',
  },
  {
    id: 'bronze-caramel-collection',
    title: 'Caramel Collection',
    description: 'Rich, creamy caramels in various flavors - perfect for appreciation gifts',
    price: 18.99,
    image: products.find(p => p.title.toLowerCase().includes('caramel') && p.image)?.image || '',
    availableForTiers: ['bronze'],
    inventory: 100,
    variantId: 'BRONZE-CARAMEL',
    handle: 'bronze-caramel-collection',
  },
  
  // Silver Tier Packages ($35-50)
  {
    id: 'silver-premium-chocolate-box',
    title: 'Premium Chocolate Gift Box',
    description: 'An elegant assortment of our signature chocolates including Tortues, Melt-A-Ways, and premium selections',
    price: 44.99,
    image: products.find(p => p.title.toLowerCase().includes('tortue') && p.image)?.image || '',
    availableForTiers: ['silver'],
    inventory: 100,
    variantId: 'SILVER-PREMIUM',
    handle: 'silver-premium-chocolate-box',
  },
  {
    id: 'silver-mini-cupcake-variety',
    title: 'Mini Cupcake Variety Pack',
    description: '24 count mini cupcakes featuring our signature flavors - perfect for office celebrations',
    price: 40.58,
    image: products.find(p => p.title.toLowerCase().includes('mini cup') && p.image)?.image || '',
    availableForTiers: ['silver'],
    inventory: 100,
    variantId: 'SILVER-CUPCAKE',
    handle: 'silver-mini-cupcake-variety',
  },
  
  // Gold Tier Packages ($75-100)
  {
    id: 'gold-deluxe-chocolate-assortment',
    title: 'Deluxe Chocolate Assortment',
    description: 'A premium collection featuring our finest chocolates, caramels, and specialty items in an elegant gift box',
    price: 89.99,
    image: products.find(p => p.title.toLowerCase().includes('tortue') && p.image)?.image || '',
    availableForTiers: ['gold'],
    inventory: 100,
    variantId: 'GOLD-DELUXE',
    handle: 'gold-deluxe-chocolate-assortment',
  },
  {
    id: 'gold-mini-cupcake-party-pack',
    title: 'Mini Cupcake Party Pack',
    description: '48 count mini cupcakes with variety pack options - ideal for larger corporate celebrations',
    price: 78.98,
    image: products.find(p => p.title.toLowerCase().includes('mini cup') && p.image)?.image || '',
    availableForTiers: ['gold'],
    inventory: 100,
    variantId: 'GOLD-PARTY',
    handle: 'gold-mini-cupcake-party-pack',
  },
  
  // Platinum Tier Packages ($150-250)
  {
    id: 'platinum-executive-gift-basket',
    title: 'Executive Gift Basket',
    description: 'Our most luxurious gift collection featuring premium chocolates, specialty items, and handcrafted treats',
    price: 199.99,
    image: products.find(p => p.title.toLowerCase().includes('tortue') && p.image)?.image || '',
    availableForTiers: ['platinum'],
    inventory: 100,
    variantId: 'PLATINUM-EXEC',
    handle: 'platinum-executive-gift-basket',
  },
];

// Combine individual products and packages
const allProducts = [...products, ...packages];

// Save to JSON file
const outputPath = path.join(__dirname, '../lib/products.json');
fs.writeFileSync(outputPath, JSON.stringify({ products: allProducts }, null, 2));

console.log(`✅ Parsed ${products.length} individual products`);
console.log(`✅ Created ${packages.length} gift packages`);
console.log(`✅ Total products: ${allProducts.length}`);
console.log(`✅ Saved to ${outputPath}`);

// Print summary by tier
console.log('\n📊 Products by Tier:');
['bronze', 'silver', 'gold', 'platinum'].forEach(tier => {
  const count = allProducts.filter(p => p.availableForTiers.includes(tier)).length;
  console.log(`  ${tier}: ${count} products`);
});
