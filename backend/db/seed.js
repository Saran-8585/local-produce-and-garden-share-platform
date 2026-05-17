const { db, initializeDatabase } = require('./database');
const bcrypt = require('bcryptjs');

initializeDatabase();

db.exec('DELETE FROM reviews');
db.exec('DELETE FROM exchange_requests');
db.exec('DELETE FROM listings');
db.exec('DELETE FROM users');
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users','listings','exchange_requests','reviews')");

const users = [
  { name: 'Priya Sharma', email: 'priya@garden.com', password: 'garden123', neighbourhood: 'Koramangala', bio: 'Organic vegetable gardener. Growing tomatoes, brinjal, and leafy greens since 2019.' },
  { name: 'Arjun Patel', email: 'arjun@garden.com', password: 'garden123', neighbourhood: 'Indiranagar', bio: 'Herb enthusiast with a small terrace garden. Love growing curry leaves, mint, and tulsi.' },
  { name: 'Lakshmi Narayan', email: 'lakshmi@garden.com', password: 'garden123', neighbourhood: 'Whitefield', bio: 'Retired teacher with a large backyard garden. Specialize in mangoes, guavas, and seasonal vegetables.' },
  { name: 'Ravi Kumar', email: 'ravi@garden.com', password: 'garden123', neighbourhood: 'HSR Layout', bio: 'Software engineer by day, gardener by evening. Growing exotic herbs and microgreens.' },
  { name: 'Ananya Reddy', email: 'ananya@garden.com', password: 'garden123', neighbourhood: 'Jayanagar', bio: 'Flower gardener passionate about marigolds, roses, and native Indian flowering plants.' },
  { name: 'Vikram Singh', email: 'vikram@garden.com', password: 'garden123', neighbourhood: 'MG Road', bio: 'Hydroponic setup enthusiast. Growing lettuce, spinach, and strawberries year-round.' },
  { name: 'Meera Krishnan', email: 'meera@garden.com', password: 'garden123', neighbourhood: 'JP Nagar', bio: 'Home gardener growing traditional Indian vegetables like drumstick, bitter gourd, and ridge gourd.' },
  { name: 'Suresh Rao', email: 'suresh@garden.com', password: 'garden123', neighbourhood: 'Electronic City', bio: 'Community garden coordinator. Growing saplings and seeds to share with neighbours.' },
  { name: 'Divya Nair', email: 'divya@garden.com', password: 'garden123', neighbourhood: 'Bellandur', bio: 'Permaculture enthusiast with a food forest. Grow fruits, vegetables, and medicinal plants.' },
  { name: 'Karthik Menon', email: 'karthik@garden.com', password: 'garden123', neighbourhood: 'Banashankari', bio: 'Growing organic vegetables using traditional composting methods. Believer in seed sharing.' },
  { name: 'Pooja Iyer', email: 'pooja@garden.com', password: 'garden123', neighbourhood: 'Marathahalli', bio: 'Balcony gardener proving you can grow food in small spaces. Specialize in herbs and microgreens.' },
  { name: 'Rajeshwari Devi', email: 'rajeshwari@garden.com', password: 'garden123', neighbourhood: 'Yelahanka', bio: 'Third-generation farmer turned urban gardener. Grow heirloom varieties of vegetables and fruits.' }
];

const bcryptRounds = 10;

const insertUser = db.prepare(`INSERT INTO users (name, email, password, neighbourhood, bio) VALUES (?, ?, ?, ?, ?)`);

const userIds = [];
for (const u of users) {
  const hashed = bcrypt.hashSync(u.password, bcryptRounds);
  const result = insertUser.run(u.name, u.email, hashed, u.neighbourhood, u.bio);
  userIds.push(result.lastInsertRowid);
}

const listings = [
  { user_id: userIds[0], produce_name: 'Organic Tomatoes', category: 'Vegetables', description: 'Juicy hybrid variety tomatoes grown with compost tea. Perfect for salads and curries. Naturally ripened on vine.', quantity: 5, unit: 'kg', exchange_type: 'Both', swap_for: 'Looking for fresh herbs or leafy greens in exchange', harvest_date: '2026-05-10', available_until: '2026-06-10', location_name: 'Koramangala 1st Block', latitude: 12.935, longitude: 77.624 },
  { user_id: userIds[0], produce_name: 'Green Chillies', category: 'Vegetables', description: 'Spicy Byadagi variety chillies. Homegrown without pesticides. Great for adding heat to any dish.', quantity: 500, unit: 'g', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-12', available_until: '2026-06-05', location_name: 'Koramangala 1st Block', latitude: 12.936, longitude: 77.626 },
  { user_id: userIds[0], produce_name: 'Brinjal (Purple)', category: 'Vegetables', description: 'Glossy purple brinjals from my organic garden. Great for baingan bharta and curries.', quantity: 3, unit: 'kg', exchange_type: 'Swap', swap_for: 'Looking for fresh fruit or flower saplings', harvest_date: '2026-05-11', available_until: '2026-06-08', location_name: 'Koramangala 1st Block', latitude: 12.934, longitude: 77.623 },
  { user_id: userIds[1], produce_name: 'Fresh Curry Leaves', category: 'Herbs', description: 'Plucked fresh from my terrace garden. Aromatic and flavourful. Essential for South Indian cooking.', quantity: 200, unit: 'g', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-14', available_until: '2026-05-28', location_name: 'Indiranagar 2nd Stage', latitude: 12.971, longitude: 77.641 },
  { user_id: userIds[1], produce_name: 'Tulsi (Holy Basil)', category: 'Herbs', description: 'Ram tulsi and Shyam tulsi varieties. Grown in organic soil. Known for medicinal properties and tea.', quantity: 10, unit: 'pots', exchange_type: 'Both', swap_for: 'Interested in any flowering plants or vegetable seeds', harvest_date: '2026-05-01', available_until: '2026-06-30', location_name: 'Indiranagar Double Road', latitude: 12.973, longitude: 77.643 },
  { user_id: userIds[1], produce_name: 'Mint Leaves', category: 'Herbs', description: 'Spearmint variety grown in shade. Perfect for chutneys, drinks, and garnishing.', quantity: 300, unit: 'g', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-13', available_until: '2026-06-01', location_name: 'Indiranagar 100ft Road', latitude: 12.969, longitude: 77.639 },
  { user_id: userIds[2], produce_name: 'Alphonso Mangoes', category: 'Fruits', description: 'Tree-ripened Alphonso mangoes from my backyard. Sweet, creamy, and aromatic. Limited quantity this season.', quantity: 10, unit: 'kg', exchange_type: 'Swap', swap_for: 'Looking for vegetable plants or organic compost', harvest_date: '2026-05-05', available_until: '2026-06-05', location_name: 'Whitefield Main Road', latitude: 12.969, longitude: 77.749 },
  { user_id: userIds[2], produce_name: 'Guava (Allahabad)', category: 'Fruits', description: 'Crisp Allahabad guavas from my garden. Sweet with pink flesh. Rich in Vitamin C.', quantity: 8, unit: 'kg', exchange_type: 'Both', swap_for: 'Would like to exchange for any rare saplings', harvest_date: '2026-05-08', available_until: '2026-06-08', location_name: 'Whitefield Hoodi', latitude: 12.972, longitude: 77.745 },
  { user_id: userIds[2], produce_name: 'Drumstick (Moringa)', category: 'Vegetables', description: 'Fresh drumsticks from my garden tree. Tender and perfect for sambar. Moringa leaves also available on request.', quantity: 2, unit: 'kg', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-10', available_until: '2026-06-10', location_name: 'Whitefield', latitude: 12.968, longitude: 77.747 },
  { user_id: userIds[3], produce_name: 'Microgreens Mix', category: 'Herbs', description: 'Assorted microgreens - sunflower, pea shoots, and radish. Grown on coco peat in my indoor setup. Nutrient dense.', quantity: 200, unit: 'g', exchange_type: 'Both', swap_for: 'Looking for exotic vegetable seeds or saplings', harvest_date: '2026-05-15', available_until: '2026-05-25', location_name: 'HSR Layout Sector 1', latitude: 12.911, longitude: 77.634 },
  { user_id: userIds[3], produce_name: 'Basil (Sweet Thai)', category: 'Herbs', description: 'Thai basil plants grown organically. Strong anise flavor. Great for Thai and Italian cuisine.', quantity: 5, unit: 'pots', exchange_type: 'Swap', swap_for: 'Interested in any fruit saplings', harvest_date: '2026-05-10', available_until: '2026-06-15', location_name: 'HSR Layout Sector 2', latitude: 12.913, longitude: 77.636 },
  { user_id: userIds[3], produce_name: 'Rosemary', category: 'Herbs', description: 'Mediterranean rosemary well adapted to Bangalore climate. Potted plants ready for your kitchen garden.', quantity: 3, unit: 'pots', exchange_type: 'Both', swap_for: 'Looking for lavender or thyme plants', harvest_date: '2026-05-01', available_until: '2026-06-30', location_name: 'HSR Layout', latitude: 12.909, longitude: 77.632 },
  { user_id: userIds[4], produce_name: 'Marigold Saplings', category: 'Flowers', description: 'Orange and yellow marigold saplings. Perfect for gardens and festivals. Grown from heirloom seeds.', quantity: 20, unit: 'pots', exchange_type: 'Both', swap_for: 'Looking for vegetable saplings or seeds', harvest_date: '2026-05-10', available_until: '2026-06-20', location_name: 'Jayanagar 4th Block', latitude: 12.924, longitude: 77.588 },
  { user_id: userIds[4], produce_name: 'Rose Cuttings', category: 'Flowers', description: 'Rooted cuttings of hybrid tea roses. Colours include red, pink, and yellow. Disease-resistant varieties.', quantity: 10, unit: 'pots', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-01', available_until: '2026-06-15', location_name: 'Jayanagar 5th Block', latitude: 12.926, longitude: 77.586 },
  { user_id: userIds[4], produce_name: 'Hibiscus Plants', category: 'Flowers', description: 'Red and pink hibiscus plants. Flowering size. Great for hedges and ornamental gardens.', quantity: 6, unit: 'pots', exchange_type: 'Swap', swap_for: 'Want vegetable plants or curry leaf plant', harvest_date: '2026-04-20', available_until: '2026-06-01', location_name: 'Jayanagar', latitude: 12.922, longitude: 77.59 },
  { user_id: userIds[5], produce_name: 'Hydroponic Lettuce', category: 'Vegetables', description: 'Crisp butterhead lettuce grown in nutrient film technique. No soil, no pesticides. Ready to harvest.', quantity: 1, unit: 'kg', exchange_type: 'Both', swap_for: 'Looking for exotic seeds or hydroponic supplies', harvest_date: '2026-05-14', available_until: '2026-05-24', location_name: 'MG Road', latitude: 12.971, longitude: 77.595 },
  { user_id: userIds[5], produce_name: 'Strawberries', category: 'Fruits', description: 'Sweet Bangalore strawberries grown in vertical towers. Naturally ripened. Limited daily harvest.', quantity: 500, unit: 'g', exchange_type: 'Swap', swap_for: 'Want blueberry plants or raspberry saplings', harvest_date: '2026-05-13', available_until: '2026-05-30', location_name: 'MG Road', latitude: 12.973, longitude: 77.597 },
  { user_id: userIds[5], produce_name: 'Spinach (Palak)', category: 'Vegetables', description: 'Nutrient-rich spinach grown in my hydroponic setup. Tender leaves, ready to eat. Harvested fresh daily.', quantity: 1, unit: 'kg', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-15', available_until: '2026-05-22', location_name: 'MG Road', latitude: 12.97, longitude: 77.593 },
  { user_id: userIds[6], produce_name: 'Bitter Gourd', category: 'Vegetables', description: 'Organic bitter gourd from my terrace garden. Medium-sized, less bitter variety. Great for stuffed recipes.', quantity: 2, unit: 'kg', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-12', available_until: '2026-06-05', location_name: 'JP Nagar 6th Phase', latitude: 12.906, longitude: 77.593 },
  { user_id: userIds[6], produce_name: 'Ridge Gourd', category: 'Vegetables', description: 'Tender ridge gourds grown on my terrace trellis. Chemical-free farming. Great for chutney and curry.', quantity: 3, unit: 'kg', exchange_type: 'Swap', swap_for: 'Looking for brinjal or tomato plants', harvest_date: '2026-05-11', available_until: '2026-06-02', location_name: 'JP Nagar 3rd Phase', latitude: 12.908, longitude: 77.595 },
  { user_id: userIds[6], produce_name: 'Coconut', category: 'Fruits', description: 'Tender coconuts from my garden. Sweet water and soft malai. Perfect summer drink.', quantity: 10, unit: 'pieces', exchange_type: 'Both', swap_for: 'Looking for banana saplings or papaya plants', harvest_date: '2026-05-10', available_until: '2026-06-10', location_name: 'JP Nagar', latitude: 12.904, longitude: 77.591 },
  { user_id: userIds[7], produce_name: 'Mango Saplings', category: 'Seeds & Saplings', description: 'Grafted Alphonso mango saplings, 1 year old. Ready for transplanting. Disease-free and vigorous growth.', quantity: 5, unit: 'pots', exchange_type: 'Both', swap_for: 'Looking for jackfruit or chikoo saplings', harvest_date: '2025-12-01', available_until: '2026-06-30', location_name: 'Electronic City Phase 1', latitude: 12.845, longitude: 77.66 },
  { user_id: userIds[7], produce_name: 'Vegetable Seeds Pack', category: 'Seeds & Saplings', description: 'Assorted desi vegetable seeds - brinjal, tomato, chilli, and okra. Open-pollinated varieties. Save seeds for next season.', quantity: 10, unit: 'packets', exchange_type: 'Free', swap_for: '', harvest_date: '2026-01-15', available_until: '2026-12-31', location_name: 'Electronic City', latitude: 12.847, longitude: 77.662 },
  { user_id: userIds[7], produce_name: 'Lemon Sapling', category: 'Seeds & Saplings', description: 'Grafted lemon saplings, bearing size. Produces juicy lemons year-round. Easy to grow in pots.', quantity: 3, unit: 'pots', exchange_type: 'Swap', swap_for: 'Interested in any fruit tree saplings', harvest_date: '2026-03-01', available_until: '2026-08-30', location_name: 'Electronic City Phase 2', latitude: 12.843, longitude: 77.658 },
  { user_id: userIds[8], produce_name: 'Banana (Elakki)', category: 'Fruits', description: 'Elakki banana bunch from my food forest. Small, sweet, and aromatic. Naturally grown without chemicals.', quantity: 5, unit: 'kg', exchange_type: 'Both', swap_for: 'Looking for papaya or pomegranate plants', harvest_date: '2026-05-12', available_until: '2026-05-26', location_name: 'Bellandur Outer Ring Road', latitude: 12.926, longitude: 77.676 },
  { user_id: userIds[8], produce_name: 'Papaya (Red Lady)', category: 'Fruits', description: 'Red Lady papayas from my permaculture garden. Sweet, orange flesh. Tree-ripened for best flavour.', quantity: 6, unit: 'kg', exchange_type: 'Swap', swap_for: 'Looking for sapota or jackfruit saplings', harvest_date: '2026-05-09', available_until: '2026-06-01', location_name: 'Bellandur', latitude: 12.928, longitude: 77.678 },
  { user_id: userIds[8], produce_name: 'Lemongrass', category: 'Herbs', description: 'Fresh lemongrass stalks from my garden. Great for tea, soups, and Thai cooking. Easy to propagate.', quantity: 500, unit: 'g', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-14', available_until: '2026-06-10', location_name: 'Bellandur', latitude: 12.924, longitude: 77.674 },
  { user_id: userIds[9], produce_name: 'Capsicum (Green)', category: 'Vegetables', description: 'Crisp green capsicums grown with vermicompost. Thick-walled and flavourful. Perfect for stuffed capsicum.', quantity: 3, unit: 'kg', exchange_type: 'Both', swap_for: 'Looking for carrot or beetroot seeds', harvest_date: '2026-05-13', available_until: '2026-06-06', location_name: 'Banashankari 2nd Stage', latitude: 12.916, longitude: 77.546 },
  { user_id: userIds[9], produce_name: 'Heirloom Tomato Seeds', category: 'Seeds & Saplings', description: 'Collected from my best black Krim tomato plants. Open-pollinated, non-GMO. Limited stock.', quantity: 5, unit: 'packets', exchange_type: 'Swap', swap_for: 'Looking for any rare vegetable seeds', harvest_date: '2026-04-20', available_until: '2027-04-20', location_name: 'Banashankari', latitude: 12.918, longitude: 77.548 },
  { user_id: userIds[9], produce_name: 'Coriander (Dhaniya)', category: 'Herbs', description: 'Fresh coriander bunches from my organic garden. Strong aroma. Harvested this morning.', quantity: 10, unit: 'bunch', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-15', available_until: '2026-05-20', location_name: 'Banashankari', latitude: 12.914, longitude: 77.544 },
  { user_id: userIds[10], produce_name: 'Microgreens Starter Kit', category: 'Other', description: 'Complete kit with tray, coco peat, and seeds. Grow your own microgreens on your balcony. Includes instructions.', quantity: 3, unit: 'pieces', exchange_type: 'Both', swap_for: 'Looking for potted herbs or succulents', harvest_date: '2026-05-01', available_until: '2026-06-15', location_name: 'Marathahalli Bridge', latitude: 12.956, longitude: 77.701 },
  { user_id: userIds[10], produce_name: 'Snake Plant Pups', category: 'Flowers', description: 'Sansevieria pups from my mother plant. Air-purifying indoor plants. Very easy to care for.', quantity: 8, unit: 'pots', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-01', available_until: '2026-07-01', location_name: 'Marathahalli', latitude: 12.954, longitude: 77.699 },
  { user_id: userIds[11], produce_name: 'Pumpkin (Red)', category: 'Vegetables', description: 'Red pumpkin from heirloom seeds. Sweet and firm. Perfect for halwa and sambar. Grown with traditional methods.', quantity: 4, unit: 'kg', exchange_type: 'Swap', swap_for: 'Looking for yam or elephant foot yam', harvest_date: '2026-05-08', available_until: '2026-06-20', location_name: 'Yelahanka New Town', latitude: 13.100, longitude: 77.596 },
  { user_id: userIds[11], produce_name: 'Ash Gourd', category: 'Vegetables', description: 'Large ash gourd from my farm. Organic cultivation. Great for kootu and Ayurvedic preparations.', quantity: 5, unit: 'kg', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-06', available_until: '2026-06-15', location_name: 'Yelahanka', latitude: 13.102, longitude: 77.598 },
  { user_id: userIds[11], produce_name: 'Amla (Indian Gooseberry)', category: 'Fruits', description: 'Fresh amla from my garden tree. Rich in Vitamin C. Good for pickles, candies, and chyawanprash.', quantity: 2, unit: 'kg', exchange_type: 'Both', swap_for: 'Looking for medicinal plant saplings', harvest_date: '2026-05-05', available_until: '2026-06-05', location_name: 'Yelahanka', latitude: 13.098, longitude: 77.594 }
];

const insertListing = db.prepare(`INSERT INTO listings (user_id, produce_name, category, description, quantity, unit, exchange_type, swap_for, harvest_date, available_until, location_name, latitude, longitude, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')`);

const listingIds = [];
for (const l of listings) {
  const result = insertListing.run(l.user_id, l.produce_name, l.category, l.description, l.quantity, l.unit, l.exchange_type, l.swap_for, l.harvest_date, l.available_until, l.location_name, l.latitude, l.longitude);
  listingIds.push(result.lastInsertRowid);
}

const requests = [
  { listing_id: listingIds[0], requester_id: userIds[1], owner_id: userIds[0], message: 'Hi Priya! Would love some of your tomatoes. I can offer fresh curry leaves in exchange. When can I pick up?', offered_listing_id: listingIds[3], status: 'Completed' },
  { listing_id: listingIds[6], requester_id: userIds[0], owner_id: userIds[2], message: 'Your Alphonso mangoes look amazing! I can swap some of my organic tomatoes and brinjals. Let me know!', offered_listing_id: listingIds[0], status: 'Accepted' },
  { listing_id: listingIds[4], requester_id: userIds[3], owner_id: userIds[1], message: 'Would like a Tulsi plant. I have microgreens to offer in return.', offered_listing_id: listingIds[9], status: 'Pending' },
  { listing_id: listingIds[12], requester_id: userIds[5], owner_id: userIds[4], message: 'The marigold saplings are beautiful! I can give you hydroponic lettuce in exchange.', offered_listing_id: listingIds[15], status: 'Completed' },
  { listing_id: listingIds[23], requester_id: userIds[9], owner_id: userIds[7], message: 'Interested in the lemon sapling. I have heirloom tomato seeds to trade!', offered_listing_id: listingIds[28], status: 'Completed' },
  { listing_id: listingIds[18], requester_id: userIds[8], owner_id: userIds[6], message: 'Can I get some bitter gourd? I have fresh lemongrass to share.', offered_listing_id: listingIds[26], status: 'Pending' },
  { listing_id: listingIds[8], requester_id: userIds[10], owner_id: userIds[2], message: 'Drumsticks would be great! I can offer my microgreens starter kit.', offered_listing_id: listingIds[30], status: 'Declined' },
  { listing_id: listingIds[1], requester_id: userIds[11], owner_id: userIds[0], message: 'Free green chillies! I would love to pick some up. Can bring pumpkin in return.', offered_listing_id: listingIds[32], status: 'Cancelled' },
  { listing_id: listingIds[20], requester_id: userIds[3], owner_id: userIds[6], message: 'Tender coconuts sound perfect for summer. I can give you basil plants in exchange.', offered_listing_id: listingIds[10], status: 'Pending' },
  { listing_id: listingIds[13], requester_id: userIds[11], owner_id: userIds[4], message: 'Rose cuttings! I would love some for my garden. Can offer ash gourd.', offered_listing_id: listingIds[33], status: 'Accepted' },
  { listing_id: listingIds[7], requester_id: userIds[1], owner_id: userIds[2], message: 'Allahabad guavas are my favourite! Can exchange curry leaves and mint.', offered_listing_id: listingIds[4], status: 'Completed' },
  { listing_id: listingIds[16], requester_id: userIds[0], owner_id: userIds[5], message: 'Your hydroponic lettuce looks great! I can give you tomatoes in return.', offered_listing_id: listingIds[0], status: 'Completed' },
  { listing_id: listingIds[24], requester_id: userIds[4], owner_id: userIds[7], message: 'Banana (Elakki) sounds delicious! I can offer marigold saplings.', offered_listing_id: listingIds[12], status: 'Completed' },
  { listing_id: listingIds[2], requester_id: userIds[6], owner_id: userIds[0], message: 'Interested in swapping my ridge gourd for your brinjal?', offered_listing_id: listingIds[19], status: 'Accepted' },
  { listing_id: listingIds[27], requester_id: userIds[1], owner_id: userIds[8], message: 'Can I get some lemongrass? I have fresh mint and curry leaves to share.', offered_listing_id: listingIds[5], status: 'Completed' },
  { listing_id: listingIds[28], requester_id: userIds[3], owner_id: userIds[9], message: 'Green capsicums look great! Can offer my basil plants.', offered_listing_id: listingIds[10], status: 'Pending' },
  { listing_id: listingIds[30], requester_id: userIds[5], owner_id: userIds[10], message: 'Microgreens starter kit! I want one. Can offer lettuce or strawberries.', offered_listing_id: listingIds[15], status: 'Pending' },
  { listing_id: listingIds[17], requester_id: userIds[9], owner_id: userIds[5], message: 'Your strawberries look amazing! I have capsicum to trade.', offered_listing_id: listingIds[28], status: 'Declined' },
  { listing_id: listingIds[34], requester_id: userIds[2], owner_id: userIds[11], message: 'Fresh amla! I can offer mangoes or guava in exchange.', offered_listing_id: listingIds[6], status: 'Completed' },
  { listing_id: listingIds[32], requester_id: userIds[7], owner_id: userIds[11], message: 'Would love some red pumpkin. Can give lemon sapling in return.', offered_listing_id: listingIds[23], status: 'Completed' }
];

const insertRequest = db.prepare(`INSERT INTO exchange_requests (listing_id, requester_id, owner_id, message, offered_listing_id, status) VALUES (?, ?, ?, ?, ?, ?)`);

const requestIds = [];
for (const r of requests) {
  const result = insertRequest.run(r.listing_id, r.requester_id, r.owner_id, r.message, r.offered_listing_id, r.status);
  requestIds.push(result.lastInsertRowid);
}

const reviewsData = [
  { exchange_id: requestIds[0], reviewer_id: userIds[1], reviewee_id: userIds[0], rating: 5, comment: 'Priya is an amazing gardener! Her tomatoes were juicy and flavourful. Very friendly and helpful.' },
  { exchange_id: requestIds[0], reviewer_id: userIds[0], reviewee_id: userIds[1], rating: 5, comment: 'Arjun was prompt and brought fresh curry leaves. Great exchange experience!' },
  { exchange_id: requestIds[3], reviewer_id: userIds[5], reviewee_id: userIds[4], rating: 4, comment: 'Beautiful marigold saplings. Ananya clearly takes good care of her plants.' },
  { exchange_id: requestIds[3], reviewer_id: userIds[4], reviewee_id: userIds[5], rating: 5, comment: 'Got fresh hydroponic lettuce. Vikram explained his setup too. Very knowledgeable!' },
  { exchange_id: requestIds[4], reviewer_id: userIds[9], reviewee_id: userIds[7], rating: 5, comment: 'Lemon sapling is healthy and well-rooted. Suresh even gave planting tips!' },
  { exchange_id: requestIds[4], reviewer_id: userIds[7], reviewee_id: userIds[9], rating: 4, comment: 'Good quality heirloom seeds. Looking forward to growing them.' },
  { exchange_id: requestIds[10], reviewer_id: userIds[1], reviewee_id: userIds[2], rating: 5, comment: 'Lakshmi\'s guavas are the best in Bangalore! So sweet and fresh.' },
  { exchange_id: requestIds[10], reviewer_id: userIds[2], reviewee_id: userIds[1], rating: 5, comment: 'Arjun\'s herbs are always fresh. Great community member.' },
  { exchange_id: requestIds[11], reviewer_id: userIds[0], reviewee_id: userIds[5], rating: 4, comment: 'Hydroponic lettuce was incredibly fresh. Vikram is doing great work with his setup.' },
  { exchange_id: requestIds[12], reviewer_id: userIds[4], reviewee_id: userIds[7], rating: 5, comment: 'The Elakki bananas were wonderfully sweet. Suresh grows them with such care.' }
];

const insertReview = db.prepare(`INSERT INTO reviews (exchange_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)`);

for (const r of reviewsData) {
  insertReview.run(r.exchange_id, r.reviewer_id, r.reviewee_id, r.rating, r.comment);
}

const updateUserStats = db.prepare(`
  UPDATE users SET
    avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviewee_id = users.id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = users.id),
    total_listings = (SELECT COUNT(*) FROM listings WHERE user_id = users.id),
    total_exchanges = (SELECT COUNT(*) FROM exchange_requests WHERE (requester_id = users.id OR owner_id = users.id) AND status = 'Completed')
`);

updateUserStats.run();

console.log('Database seeded successfully!');
console.log('Users seeded: 12');
console.log('Listings seeded: 35');
console.log('Exchange requests seeded: 20');
console.log('Reviews seeded: 10');
console.log('\nTest credentials:');
console.log('  priya@garden.com / garden123');
console.log('  arjun@garden.com / garden123');

process.exit(0);
