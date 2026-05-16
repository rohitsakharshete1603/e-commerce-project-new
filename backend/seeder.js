/**
 * seeder.js  —  Run: node seeder.js
 * Seeds 20 furniture products into MongoDB
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Product = require('./models/Product');

const products = [
  // LIVING ROOM
  {
    name: 'Luxury 5-Seater Sofa Set',
    description: 'Premium 5-seater sofa set with plush velvet upholstery and solid sheesham wood frame. Includes 3-seater sofa + 2 single armchairs.',
    price: 15999, oldPrice: 22000, emoji: '🛋️', category: 'Living Room',
    badge: 'Best Seller', stock: 8, rating: 5, numReviews: 128,
    material: 'Sheesham Wood + Velvet', dimensions: '220 x 90 x 85 cm', warranty: '2 Years',
  },
  {
    name: 'Wooden Coffee Table',
    description: 'Solid sheesham wood coffee table with a lower open shelf for magazines. Natural oil finish highlights the beautiful grain of the wood.',
    price: 3499, oldPrice: 5000, emoji: '☕', category: 'Living Room',
    badge: 'New', stock: 15, rating: 5, numReviews: 41,
    material: 'Solid Sheesham Wood', dimensions: '100 x 60 x 45 cm', warranty: '1 Year',
  },
  {
    name: 'Recliner Sofa Chair',
    description: 'Luxurious single-seater recliner with padded armrests, footrest, and smooth manual reclining mechanism. Ideal for reading or watching TV.',
    price: 8999, oldPrice: 12000, emoji: '💺', category: 'Living Room',
    badge: 'Best Seller', stock: 6, rating: 5, numReviews: 102,
    material: 'Leatherette + Steel Frame', dimensions: '90 x 85 x 100 cm', warranty: '2 Years',
  },
  {
    name: 'TV Unit with Storage',
    description: 'Modern TV unit with 2 cabinets, open shelves, and cable management hole. Fits TVs up to 65 inches. Matte finish with gold handles.',
    price: 6499, oldPrice: 9500, emoji: '📺', category: 'Living Room',
    badge: 'Sale', stock: 10, rating: 4, numReviews: 67,
    material: 'MDF + Laminate', dimensions: '150 x 40 x 55 cm', warranty: '1 Year',
  },
  {
    name: 'Accent Armchair',
    description: 'Stylish single-seater accent armchair with a button-tufted back and solid wood legs. Classic mustard yellow fabric. Great for reading nooks.',
    price: 4999, oldPrice: 7000, emoji: '🪑', category: 'Living Room',
    badge: 'New', stock: 12, rating: 4, numReviews: 38,
    material: 'Fabric + Solid Wood Legs', dimensions: '75 x 70 x 85 cm', warranty: '1 Year',
  },
  // BEDROOM
  {
    name: 'King Size Bed with Storage',
    description: 'Spacious king size bed with hydraulic lift-up storage and premium tufted headboard. Walnut finish on engineered wood. Mattress not included.',
    price: 12999, oldPrice: 18000, emoji: '🛏️', category: 'Bedroom',
    badge: 'Best Seller', stock: 5, rating: 5, numReviews: 95,
    material: 'Engineered Wood (Walnut)', dimensions: '200 x 180 x 110 cm', warranty: '1 Year',
  },
  {
    name: 'Wardrobe 4-Door with Mirror',
    description: 'Large 4-door wardrobe with full-length mirror, multiple shelves, hanging rods and bottom drawer. White finish to match any bedroom.',
    price: 18999, oldPrice: 25000, emoji: '🚪', category: 'Bedroom',
    badge: 'New', stock: 4, rating: 5, numReviews: 212,
    material: 'Plywood + Laminate (White)', dimensions: '180 x 55 x 210 cm', warranty: '2 Years',
  },
  {
    name: 'Dressing Table with Mirror',
    description: 'Elegant dressing table with large LED-backlit mirror, 4 drawers, and padded cushioned stool. Perfect vanity for any bedroom.',
    price: 5999, oldPrice: 8500, emoji: '🪞', category: 'Bedroom',
    badge: 'Best Seller', stock: 10, rating: 4, numReviews: 63,
    material: 'MDF + Toughened Glass', dimensions: '100 x 45 x 155 cm', warranty: '1 Year',
  },
  {
    name: 'Queen Size Bed',
    description: 'Elegant queen size bed with curved upholstered headboard in premium fabric. Simple clean design for modern bedrooms. Solid wood slat base included.',
    price: 8499, oldPrice: 11000, emoji: '🛌', category: 'Bedroom',
    badge: 'Sale', stock: 7, rating: 4, numReviews: 54,
    material: 'Solid Wood + Fabric Headboard', dimensions: '200 x 160 x 100 cm', warranty: '1 Year',
  },
  {
    name: 'Bedside Table Set of 2',
    description: 'Pair of matching bedside tables with one drawer each and an open lower shelf. Natural oak finish. Ideal companions for any bed.',
    price: 2999, oldPrice: 4500, emoji: '🌿', category: 'Bedroom',
    badge: 'New', stock: 20, rating: 4, numReviews: 47,
    material: 'Engineered Wood (Oak Finish)', dimensions: '45 x 35 x 55 cm each', warranty: '1 Year',
  },
  // DINING ROOM
  {
    name: 'Dining Table 6-Seater',
    description: '6-seater solid sheesham wood dining table with matching cushioned chairs. Classic design with natural wood finish.',
    price: 9999, oldPrice: 14000, emoji: '🍽️', category: 'Dining Room',
    badge: 'Sale', stock: 6, rating: 4, numReviews: 78,
    material: 'Solid Sheesham Wood', dimensions: '150 x 90 x 76 cm', warranty: '1 Year',
  },
  {
    name: 'Dining Table 4-Seater Compact',
    description: 'Compact 4-seater dining table perfect for smaller apartments. Teak wood finish with sturdy metal legs. Chairs included.',
    price: 6799, oldPrice: 9500, emoji: '🍴', category: 'Dining Room',
    badge: 'New', stock: 9, rating: 4, numReviews: 33,
    material: 'MDF + Metal Legs (Teak)', dimensions: '120 x 75 x 76 cm', warranty: '1 Year',
  },
  {
    name: 'Crockery Cabinet with Glass Doors',
    description: 'Elegant crockery cabinet with 2 glass-panelled upper doors to display chinaware and 2 solid lower doors for extra storage. Gold handles.',
    price: 7499, oldPrice: 10500, emoji: '🍶', category: 'Dining Room',
    badge: 'Best Seller', stock: 5, rating: 5, numReviews: 44,
    material: 'Solid Wood + Tempered Glass', dimensions: '90 x 40 x 180 cm', warranty: '1 Year',
  },
  // OFFICE
  {
    name: 'Ergonomic Mesh Office Chair',
    description: 'Fully adjustable ergonomic chair with lumbar support, breathable mesh backrest, adjustable armrests and headrest. Perfect for long WFH sessions.',
    price: 2999, oldPrice: 4500, emoji: '🪑', category: 'Office',
    badge: 'Sale', stock: 20, rating: 3, numReviews: 47,
    material: 'Mesh + Steel Frame', dimensions: '65 x 65 x 120 cm', warranty: '1 Year',
  },
  {
    name: 'L-Shaped Corner Desk',
    description: 'Large L-shaped corner desk with cable management tray and 140cm work surface. Ideal for home offices, coding and gaming setups.',
    price: 6499, oldPrice: 9000, emoji: '🖥️', category: 'Office',
    badge: 'New', stock: 7, rating: 4, numReviews: 34,
    material: 'MDF + Metal Legs', dimensions: '140 x 120 x 75 cm', warranty: '1 Year',
  },
  {
    name: '5-Shelf Industrial Bookshelf',
    description: 'Spacious 5-tier open bookshelf with wood shelves and black metal frame. Industrial design. Perfect for living rooms, offices or study rooms.',
    price: 4299, oldPrice: 6200, emoji: '📚', category: 'Office',
    badge: 'Sale', stock: 12, rating: 4, numReviews: 89,
    material: 'Engineered Wood + Metal Frame', dimensions: '80 x 30 x 180 cm', warranty: '1 Year',
  },
  {
    name: 'Executive Office Chair',
    description: 'Premium high-back executive chair with genuine leatherette, adjustable height, tilt lock and 360 degree swivel. Professional look for any home office.',
    price: 5499, oldPrice: 8000, emoji: '🏆', category: 'Office',
    badge: 'Best Seller', stock: 8, rating: 5, numReviews: 61,
    material: 'Leatherette + Chrome Base', dimensions: '70 x 70 x 125 cm', warranty: '2 Years',
  },
  // KIDS ROOM
  {
    name: 'Kids Study Table & Chair Set',
    description: 'Height-adjustable study table and chair for children aged 5-15. Bright blue, built-in pencil tray, bookshelf and storage drawer.',
    price: 3199, oldPrice: 4500, emoji: '🧸', category: 'Kids Room',
    badge: 'New', stock: 18, rating: 5, numReviews: 56,
    material: 'ABS Plastic + Steel', dimensions: '80 x 50 x 55-75 cm adj.', warranty: '1 Year',
  },
  {
    name: 'Bunk Bed with Ladder',
    description: 'Space-saving bunk bed for kids with safety rails on top bunk, built-in ladder, and pull-out storage drawer. Slats included.',
    price: 11499, oldPrice: 16000, emoji: '🛏️', category: 'Kids Room',
    badge: 'Sale', stock: 3, rating: 4, numReviews: 27,
    material: 'Solid Pine Wood', dimensions: '200 x 100 x 160 cm', warranty: '1 Year',
  },
  {
    name: 'Kids Wardrobe 2-Door',
    description: 'Colourful 2-door kids wardrobe with hanging rod, 3 shelves and small mirror. Pastel green finish with star-shaped handles. Safe rounded corners.',
    price: 7999, oldPrice: 11000, emoji: '🌟', category: 'Kids Room',
    badge: 'New', stock: 6, rating: 4, numReviews: 19,
    material: 'Engineered Wood (Pastel)', dimensions: '90 x 45 x 180 cm', warranty: '1 Year',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared old products');

    const inserted = await Product.insertMany(products);
    console.log('');
    console.log('Seeded ' + inserted.length + ' products:');
    inserted.forEach((p, i) => {
      console.log('  ' + (i + 1) + '. ' + p.emoji + ' ' + p.name + ' - Rs.' + p.price);
    });
    console.log('');
    console.log('Done! Open MongoDB Compass -> modernfurniture -> products');
  } catch (err) {
    console.error('Seeder error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();