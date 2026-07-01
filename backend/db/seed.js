const bcrypt = require('bcryptjs');
const { connectDB } = require('./database');

async function seed() {
  const db = await connectDB();
  console.log('Connected to SQLite');

  db.exec('DELETE FROM reviews');
  db.exec('DELETE FROM exchange_requests');
  db.exec('DELETE FROM listings');
  db.exec('DELETE FROM users');
  console.log('Cleared existing data');

  const usersData = [
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
    { name: 'Rajeshwari Devi', email: 'rajeshwari@garden.com', password: 'garden123', neighbourhood: 'Yelahanka', bio: 'Third-generation farmer turned urban gardener. Grow heirloom varieties of vegetables and fruits.' },
    { name: 'Shwetha Bhat', email: 'shwetha@garden.com', password: 'garden123', neighbourhood: 'Basavanagudi', bio: 'Terrace gardener growing exotic lettuce, kale, and Mediterranean vegetables.' },
    { name: 'Manoj Kumar', email: 'manoj@garden.com', password: 'garden123', neighbourhood: 'Malleswaram', bio: 'Composting specialist producing premium vermicompost and earthworm culture.' },
    { name: 'Nandini Rao', email: 'nandini@garden.com', password: 'garden123', neighbourhood: 'Sadashivanagar', bio: 'Heritage seed keeper preserving traditional Karnataka vegetable varieties.' },
    { name: 'Rohan Deshmukh', email: 'rohan@garden.com', password: 'garden123', neighbourhood: 'BTM Layout', bio: 'Mushroom cultivator growing oyster and button mushrooms.' },
    { name: 'Kavya Joseph', email: 'kavya@garden.com', password: 'garden123', neighbourhood: 'Domlur', bio: 'Mediterranean herb specialist growing thyme, oregano, sage, and lavender.' },
    { name: 'Srinivas Murthy', email: 'srinivas@garden.com', password: 'garden123', neighbourhood: 'Vasanth Nagar', bio: 'Bonsai artist and ornamental plant enthusiast.' },
    { name: 'Anita Shetty', email: 'anita@garden.com', password: 'garden123', neighbourhood: 'Frazer Town', bio: 'Home chef who grows own ingredients.' },
    { name: 'Ganesh Iyer', email: 'ganesh@garden.com', password: 'garden123', neighbourhood: 'Rajajinagar', bio: 'Fruit orchard enthusiast with a backyard full of sapota and guava trees.' },
    { name: 'Deepa Venkatesh', email: 'deepa@garden.com', password: 'garden123', neighbourhood: 'Basaveshwaranagar', bio: 'Cut flower grower specialising in chrysanthemum, aster, and gaillardia.' },
    { name: 'Aditya Khanna', email: 'aditya@garden.com', password: 'garden123', neighbourhood: 'Sarjapur Road', bio: 'Aquaponics farmer using Tilapia fish waste to feed plants.' },
    { name: 'Radhika Pai', email: 'radhika@garden.com', password: 'garden123', neighbourhood: 'Hebbal', bio: 'Organic terrace gardener growing all seasonal vegetables.' },
    { name: 'Venkatesh Gowda', email: 'venkatesh@garden.com', password: 'garden123', neighbourhood: 'Kanakapura Road', bio: 'Farm-to-home grower with two acres.' },
    { name: 'Sunita Verma', email: 'sunita@garden.com', password: 'garden123', neighbourhood: 'Uttarahalli', bio: 'Sprout and microgreen specialist.' },
    { name: 'Prakash Joshi', email: 'prakash@garden.com', password: 'garden123', neighbourhood: 'Vidyaranyapura', bio: 'Medicinal plant garden with ashwagandha, brahmi, aloe vera.' },
    { name: 'Lata Krishnamurthy', email: 'lata@garden.com', password: 'garden123', neighbourhood: 'RT Nagar', bio: 'Flower gardener growing jasmine, crossandra, and chrysanthemum.' },
    { name: 'Harish Bhat', email: 'harish@garden.com', password: 'garden123', neighbourhood: 'Kengeri', bio: 'Coconut and areca nut farm owner.' },
    { name: 'Neelam Sheikh', email: 'neelam@garden.com', password: 'garden123', neighbourhood: 'Cox Town', bio: 'Hydroponic leafy green grower producing lettuce, spinach, and kale year-round.' },
    { name: 'Chandan Shetty', email: 'chandan@garden.com', password: 'garden123', neighbourhood: 'HSR Layout', bio: 'Organic vegetable farmer using traditional seeds.' },
  ];

  const userInsert = db.prepare('INSERT INTO users (name, email, password, neighbourhood, bio) VALUES (?, ?, ?, ?, ?)');
  const createdUsers = [];
  for (const u of usersData) {
    const hashed = await bcrypt.hash(u.password, 10);
    const result = userInsert.run(u.name, u.email, hashed, u.neighbourhood, u.bio);
    createdUsers.push(result.lastInsertRowid);
  }
  console.log(`Users seeded: ${createdUsers.length}`);

  const listingsData = [
    { user_idx: 0, produce_name: 'Organic Tomatoes', category: 'Vegetables', description: 'Juicy hybrid variety tomatoes grown with compost tea. Perfect for salads and curries. Naturally ripened on vine.', quantity: 5, unit: 'kg', exchange_type: 'Both', swap_for: 'Looking for fresh herbs or leafy greens in exchange', harvest_date: '2026-05-10', available_until: '2026-06-10', location_name: 'Koramangala 1st Block', latitude: 12.935, longitude: 77.624 },
    { user_idx: 0, produce_name: 'Green Chillies', category: 'Vegetables', description: 'Spicy Byadagi variety chillies. Homegrown without pesticides. Great for adding heat to any dish.', quantity: 500, unit: 'g', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-12', available_until: '2026-06-05', location_name: 'Koramangala 1st Block', latitude: 12.936, longitude: 77.626 },
    { user_idx: 0, produce_name: 'Brinjal (Purple)', category: 'Vegetables', description: 'Glossy purple brinjals from my organic garden. Great for baingan bharta and curries.', quantity: 3, unit: 'kg', exchange_type: 'Swap', swap_for: 'Looking for fresh fruit or flower saplings', harvest_date: '2026-05-11', available_until: '2026-06-08', location_name: 'Koramangala 1st Block', latitude: 12.934, longitude: 77.623 },
    { user_idx: 1, produce_name: 'Fresh Curry Leaves', category: 'Herbs', description: 'Plucked fresh from my terrace garden. Aromatic and flavourful. Essential for South Indian cooking.', quantity: 200, unit: 'g', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-14', available_until: '2026-05-28', location_name: 'Indiranagar 2nd Stage', latitude: 12.971, longitude: 77.641 },
    { user_idx: 1, produce_name: 'Tulsi (Holy Basil)', category: 'Herbs', description: 'Ram tulsi and Shyam tulsi varieties. Grown in organic soil.', quantity: 10, unit: 'pots', exchange_type: 'Both', swap_for: 'Interested in any flowering plants or vegetable seeds', harvest_date: '2026-05-01', available_until: '2026-06-30', location_name: 'Indiranagar Double Road', latitude: 12.973, longitude: 77.643 },
    { user_idx: 1, produce_name: 'Mint Leaves', category: 'Herbs', description: 'Spearmint variety grown in shade. Perfect for chutneys, drinks, and garnishing.', quantity: 300, unit: 'g', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-13', available_until: '2026-06-01', location_name: 'Indiranagar 100ft Road', latitude: 12.969, longitude: 77.639 },
    { user_idx: 2, produce_name: 'Alphonso Mangoes', category: 'Fruits', description: 'Tree-ripened Alphonso mangoes from my backyard. Sweet, creamy, and aromatic.', quantity: 10, unit: 'kg', exchange_type: 'Swap', swap_for: 'Looking for vegetable plants or organic compost', harvest_date: '2026-05-05', available_until: '2026-06-05', location_name: 'Whitefield Main Road', latitude: 12.969, longitude: 77.749 },
    { user_idx: 2, produce_name: 'Guava (Allahabad)', category: 'Fruits', description: 'Crisp Allahabad guavas from my garden. Sweet with pink flesh. Rich in Vitamin C.', quantity: 8, unit: 'kg', exchange_type: 'Both', swap_for: 'Would like to exchange for any rare saplings', harvest_date: '2026-05-08', available_until: '2026-06-08', location_name: 'Whitefield Hoodi', latitude: 12.972, longitude: 77.745 },
    { user_idx: 2, produce_name: 'Drumstick (Moringa)', category: 'Vegetables', description: 'Fresh drumsticks from my garden tree. Tender and perfect for sambar.', quantity: 2, unit: 'kg', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-10', available_until: '2026-06-10', location_name: 'Whitefield', latitude: 12.968, longitude: 77.747 },
    { user_idx: 3, produce_name: 'Microgreens Mix', category: 'Herbs', description: 'Assorted microgreens - sunflower, pea shoots, and radish. Grown on coco peat.', quantity: 200, unit: 'g', exchange_type: 'Both', swap_for: 'Looking for exotic vegetable seeds or saplings', harvest_date: '2026-05-15', available_until: '2026-05-25', location_name: 'HSR Layout Sector 1', latitude: 12.911, longitude: 77.634 },
    { user_idx: 3, produce_name: 'Basil (Sweet Thai)', category: 'Herbs', description: 'Thai basil plants grown organically. Strong anise flavor.', quantity: 5, unit: 'pots', exchange_type: 'Swap', swap_for: 'Interested in any fruit saplings', harvest_date: '2026-05-10', available_until: '2026-06-15', location_name: 'HSR Layout Sector 2', latitude: 12.913, longitude: 77.636 },
    { user_idx: 3, produce_name: 'Rosemary', category: 'Herbs', description: 'Mediterranean rosemary well adapted to Bangalore climate.', quantity: 3, unit: 'pots', exchange_type: 'Both', swap_for: 'Looking for lavender or thyme plants', harvest_date: '2026-05-01', available_until: '2026-06-30', location_name: 'HSR Layout', latitude: 12.909, longitude: 77.632 },
    { user_idx: 4, produce_name: 'Marigold Saplings', category: 'Flowers', description: 'Orange and yellow marigold saplings. Perfect for gardens and festivals.', quantity: 20, unit: 'pots', exchange_type: 'Both', swap_for: 'Looking for vegetable saplings or seeds', harvest_date: '2026-05-10', available_until: '2026-06-20', location_name: 'Jayanagar 4th Block', latitude: 12.924, longitude: 77.588 },
    { user_idx: 4, produce_name: 'Rose Cuttings', category: 'Flowers', description: 'Rooted cuttings of hybrid tea roses. Colours include red, pink, and yellow.', quantity: 10, unit: 'pots', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-01', available_until: '2026-06-15', location_name: 'Jayanagar 5th Block', latitude: 12.926, longitude: 77.586 },
    { user_idx: 4, produce_name: 'Hibiscus Plants', category: 'Flowers', description: 'Red and pink hibiscus plants. Flowering size. Great for hedges.', quantity: 6, unit: 'pots', exchange_type: 'Swap', swap_for: 'Want vegetable plants or curry leaf plant', harvest_date: '2026-04-20', available_until: '2026-06-01', location_name: 'Jayanagar', latitude: 12.922, longitude: 77.59 },
    { user_idx: 5, produce_name: 'Hydroponic Lettuce', category: 'Vegetables', description: 'Crisp butterhead lettuce grown in nutrient film technique. No soil, no pesticides.', quantity: 1, unit: 'kg', exchange_type: 'Both', swap_for: 'Looking for exotic seeds or hydroponic supplies', harvest_date: '2026-05-14', available_until: '2026-05-24', location_name: 'MG Road', latitude: 12.971, longitude: 77.595 },
    { user_idx: 5, produce_name: 'Strawberries', category: 'Fruits', description: 'Sweet Bangalore strawberries grown in vertical towers. Naturally ripened.', quantity: 500, unit: 'g', exchange_type: 'Swap', swap_for: 'Want blueberry plants or raspberry saplings', harvest_date: '2026-05-13', available_until: '2026-05-30', location_name: 'MG Road', latitude: 12.973, longitude: 77.597 },
    { user_idx: 5, produce_name: 'Spinach (Palak)', category: 'Vegetables', description: 'Nutrient-rich spinach grown in my hydroponic setup. Tender leaves.', quantity: 1, unit: 'kg', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-15', available_until: '2026-05-22', location_name: 'MG Road', latitude: 12.97, longitude: 77.593 },
    { user_idx: 6, produce_name: 'Bitter Gourd', category: 'Vegetables', description: 'Organic bitter gourd from my terrace garden. Medium-sized, less bitter variety.', quantity: 2, unit: 'kg', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-12', available_until: '2026-06-05', location_name: 'JP Nagar 6th Phase', latitude: 12.906, longitude: 77.593 },
    { user_idx: 6, produce_name: 'Ridge Gourd', category: 'Vegetables', description: 'Tender ridge gourds grown on my terrace trellis. Chemical-free farming.', quantity: 3, unit: 'kg', exchange_type: 'Swap', swap_for: 'Looking for brinjal or tomato plants', harvest_date: '2026-05-11', available_until: '2026-06-02', location_name: 'JP Nagar 3rd Phase', latitude: 12.908, longitude: 77.595 },
    { user_idx: 6, produce_name: 'Coconut', category: 'Fruits', description: 'Tender coconuts from my garden. Sweet water and soft malai.', quantity: 10, unit: 'pieces', exchange_type: 'Both', swap_for: 'Looking for banana saplings or papaya plants', harvest_date: '2026-05-10', available_until: '2026-06-10', location_name: 'JP Nagar', latitude: 12.904, longitude: 77.591 },
    { user_idx: 7, produce_name: 'Mango Saplings', category: 'Seeds & Saplings', description: 'Grafted Alphonso mango saplings, 1 year old. Ready for transplanting.', quantity: 5, unit: 'pots', exchange_type: 'Both', swap_for: 'Looking for jackfruit or chikoo saplings', harvest_date: '2025-12-01', available_until: '2026-06-30', location_name: 'Electronic City Phase 1', latitude: 12.845, longitude: 77.66 },
    { user_idx: 7, produce_name: 'Vegetable Seeds Pack', category: 'Seeds & Saplings', description: 'Assorted desi vegetable seeds - brinjal, tomato, chilli, and okra.', quantity: 10, unit: 'packets', exchange_type: 'Free', swap_for: '', harvest_date: '2026-01-15', available_until: '2026-12-31', location_name: 'Electronic City', latitude: 12.847, longitude: 77.662 },
    { user_idx: 7, produce_name: 'Lemon Sapling', category: 'Seeds & Saplings', description: 'Grafted lemon saplings, bearing size. Produces juicy lemons year-round.', quantity: 3, unit: 'pots', exchange_type: 'Swap', swap_for: 'Interested in any fruit tree saplings', harvest_date: '2026-03-01', available_until: '2026-08-30', location_name: 'Electronic City Phase 2', latitude: 12.843, longitude: 77.658 },
    { user_idx: 8, produce_name: 'Banana (Elakki)', category: 'Fruits', description: 'Elakki banana bunch from my food forest. Small, sweet, and aromatic.', quantity: 5, unit: 'kg', exchange_type: 'Both', swap_for: 'Looking for papaya or pomegranate plants', harvest_date: '2026-05-12', available_until: '2026-05-26', location_name: 'Bellandur Outer Ring Road', latitude: 12.926, longitude: 77.676 },
    { user_idx: 8, produce_name: 'Papaya (Red Lady)', category: 'Fruits', description: 'Red Lady papayas from my permaculture garden. Sweet, orange flesh.', quantity: 6, unit: 'kg', exchange_type: 'Swap', swap_for: 'Looking for sapota or jackfruit saplings', harvest_date: '2026-05-09', available_until: '2026-06-01', location_name: 'Bellandur', latitude: 12.928, longitude: 77.678 },
    { user_idx: 8, produce_name: 'Lemongrass', category: 'Herbs', description: 'Fresh lemongrass stalks from my garden. Great for tea, soups, and Thai cooking.', quantity: 500, unit: 'g', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-14', available_until: '2026-06-10', location_name: 'Bellandur', latitude: 12.924, longitude: 77.674 },
    { user_idx: 9, produce_name: 'Capsicum (Green)', category: 'Vegetables', description: 'Crisp green capsicums grown with vermicompost. Thick-walled and flavourful.', quantity: 3, unit: 'kg', exchange_type: 'Both', swap_for: 'Looking for carrot or beetroot seeds', harvest_date: '2026-05-13', available_until: '2026-06-06', location_name: 'Banashankari 2nd Stage', latitude: 12.916, longitude: 77.546 },
    { user_idx: 9, produce_name: 'Heirloom Tomato Seeds', category: 'Seeds & Saplings', description: 'Collected from my best black Krim tomato plants. Open-pollinated, non-GMO.', quantity: 5, unit: 'packets', exchange_type: 'Swap', swap_for: 'Looking for any rare vegetable seeds', harvest_date: '2026-04-20', available_until: '2027-04-20', location_name: 'Banashankari', latitude: 12.918, longitude: 77.548 },
    { user_idx: 9, produce_name: 'Coriander (Dhaniya)', category: 'Herbs', description: 'Fresh coriander bunches from my organic garden. Strong aroma.', quantity: 10, unit: 'bunch', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-15', available_until: '2026-05-20', location_name: 'Banashankari', latitude: 12.914, longitude: 77.544 },
    { user_idx: 10, produce_name: 'Microgreens Starter Kit', category: 'Other', description: 'Complete kit with tray, coco peat, and seeds. Grow your own microgreens.', quantity: 3, unit: 'pieces', exchange_type: 'Both', swap_for: 'Looking for potted herbs or succulents', harvest_date: '2026-05-01', available_until: '2026-06-15', location_name: 'Marathahalli Bridge', latitude: 12.956, longitude: 77.701 },
    { user_idx: 10, produce_name: 'Snake Plant Pups', category: 'Flowers', description: 'Sansevieria pups from my mother plant. Air-purifying indoor plants.', quantity: 8, unit: 'pots', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-01', available_until: '2026-07-01', location_name: 'Marathahalli', latitude: 12.954, longitude: 77.699 },
    { user_idx: 11, produce_name: 'Pumpkin (Red)', category: 'Vegetables', description: 'Red pumpkin from heirloom seeds. Sweet and firm. Perfect for halwa and sambar.', quantity: 4, unit: 'kg', exchange_type: 'Swap', swap_for: 'Looking for yam or elephant foot yam', harvest_date: '2026-05-08', available_until: '2026-06-20', location_name: 'Yelahanka New Town', latitude: 13.100, longitude: 77.596 },
    { user_idx: 11, produce_name: 'Ash Gourd', category: 'Vegetables', description: 'Large ash gourd from my farm. Organic cultivation. Great for kootu.', quantity: 5, unit: 'kg', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-06', available_until: '2026-06-15', location_name: 'Yelahanka', latitude: 13.102, longitude: 77.598 },
    { user_idx: 11, produce_name: 'Amla (Indian Gooseberry)', category: 'Fruits', description: 'Fresh amla from my garden tree. Rich in Vitamin C.', quantity: 2, unit: 'kg', exchange_type: 'Both', swap_for: 'Looking for medicinal plant saplings', harvest_date: '2026-05-05', available_until: '2026-06-05', location_name: 'Yelahanka', latitude: 13.098, longitude: 77.594 },
    { user_idx: 12, produce_name: 'Exotic Lettuce Mix', category: 'Vegetables', description: 'Rainbow mix of oakleaf, lollo rosso, and green cos lettuce.', quantity: 500, unit: 'g', exchange_type: 'Both', swap_for: 'Looking for mushroom spawn or exotic herb plants', harvest_date: '2026-05-20', available_until: '2026-06-10', location_name: 'Basavanagudi', latitude: 12.942, longitude: 77.574 },
    { user_idx: 12, produce_name: 'Organic Kale', category: 'Vegetables', description: 'Curly kale and lacinato kale. Superfood packed with nutrients.', quantity: 300, unit: 'g', exchange_type: 'Swap', swap_for: 'Want organic compost or worm castings', harvest_date: '2026-05-22', available_until: '2026-06-05', location_name: 'Basavanagudi', latitude: 12.944, longitude: 77.576 },
    { user_idx: 13, produce_name: 'Premium Vermicompost', category: 'Other', description: 'Rich worm castings from our composting unit. Each pack is 2kg.', quantity: 10, unit: 'kg', exchange_type: 'Both', swap_for: 'Looking for vegetable saplings or seeds', harvest_date: '2026-05-01', available_until: '2026-12-31', location_name: 'Malleswaram 8th Cross', latitude: 12.996, longitude: 77.569 },
    { user_idx: 13, produce_name: 'Earthworm Culture Starter', category: 'Other', description: 'Start your own vermicompost at home! Includes 50 red wigglers.', quantity: 5, unit: 'pieces', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-01', available_until: '2026-09-30', location_name: 'Malleswaram', latitude: 12.994, longitude: 77.571 },
    { user_idx: 14, produce_name: 'Heirloom Mattu Gulla Brinjal Seeds', category: 'Seeds & Saplings', description: 'Rare Udupi Mattu Gulla brinjal seeds. Known for unique flavour.', quantity: 5, unit: 'packets', exchange_type: 'Swap', swap_for: 'Looking for other heirloom vegetable seeds', harvest_date: '2026-04-01', available_until: '2027-04-01', location_name: 'Sadashivanagar', latitude: 12.997, longitude: 77.581 },
    { user_idx: 14, produce_name: 'Rose Apple (Jamun)', category: 'Fruits', description: 'Fresh rose apples from our heritage tree. Crisp, rose-scented, and refreshing.', quantity: 3, unit: 'kg', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-18', available_until: '2026-06-02', location_name: 'Sadashivanagar', latitude: 12.999, longitude: 77.583 },
    { user_idx: 15, produce_name: 'Fresh Oyster Mushrooms', category: 'Vegetables', description: 'Grey oyster mushrooms harvested today. Grown on paddy straw.', quantity: 500, unit: 'g', exchange_type: 'Both', swap_for: 'Want vegetable saplings or organic compost', harvest_date: '2026-05-20', available_until: '2026-05-27', location_name: 'BTM Layout 2nd Stage', latitude: 12.916, longitude: 77.611 },
    { user_idx: 15, produce_name: 'Mushroom Spawn Bags', category: 'Other', description: 'Ready-to-fruit oyster mushroom spawn bags. Each bag yields 300-500g.', quantity: 5, unit: 'pieces', exchange_type: 'Swap', swap_for: 'Looking for exotic vegetable seeds or saplings', harvest_date: '2026-05-15', available_until: '2026-08-15', location_name: 'BTM Layout', latitude: 12.918, longitude: 77.613 },
    { user_idx: 16, produce_name: 'English Thyme Plants', category: 'Herbs', description: 'Well-established English thyme in 6-inch pots. Perennial herb.', quantity: 6, unit: 'pots', exchange_type: 'Both', swap_for: 'Like to exchange for rosemary or lavender plants', harvest_date: '2026-05-10', available_until: '2026-07-01', location_name: 'Domlur', latitude: 12.961, longitude: 77.646 },
    { user_idx: 17, produce_name: 'Ficus Bonsai (2yr)', category: 'Flowers', description: 'Two-year-old ficus microcarpa bonsai trained in informal upright style.', quantity: 2, unit: 'pieces', exchange_type: 'Both', swap_for: 'Looking for orchid varieties or succulent collection', harvest_date: '2026-05-01', available_until: '2026-07-30', location_name: 'Vasanth Nagar', latitude: 12.985, longitude: 77.591 },
    { user_idx: 18, produce_name: 'Curry Leaf Plant in Pot', category: 'Herbs', description: 'Established curry leaf plant in 10-inch pot. 2 feet tall and bushy.', quantity: 4, unit: 'pots', exchange_type: 'Both', swap_for: 'Want pandanus or lemongrass plants', harvest_date: '2026-05-15', available_until: '2026-07-15', location_name: 'Frazer Town', latitude: 12.991, longitude: 77.612 },
    { user_idx: 18, produce_name: 'Pandanus (Screwpine) Leaves', category: 'Other', description: 'Fragrant pandanus leaves from my garden. Used in South Indian and Thai cooking.', quantity: 20, unit: 'pieces', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-20', available_until: '2026-06-05', location_name: 'Frazer Town', latitude: 12.989, longitude: 77.614 },
    { user_idx: 19, produce_name: 'Sapota (Chikoo)', category: 'Fruits', description: 'Sweet Kalipatti sapotas from my backyard tree. Naturally ripened.', quantity: 5, unit: 'kg', exchange_type: 'Both', swap_for: 'Looking for mango or jackfruit saplings', harvest_date: '2026-05-18', available_until: '2026-06-10', location_name: 'Rajajinagar', latitude: 12.981, longitude: 77.552 },
    { user_idx: 20, produce_name: 'Chrysanthemum Cuttings', category: 'Flowers', description: 'Rooted chrysanthemum cuttings in 4 colours - yellow, white, pink, and bronze.', quantity: 20, unit: 'pieces', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-25', available_until: '2026-07-15', location_name: 'Basaveshwaranagar', latitude: 12.974, longitude: 77.543 },
    { user_idx: 21, produce_name: 'Aquaponic Bitter Gourd', category: 'Vegetables', description: 'Bitter gourd grown in aquaponics system with Tilapia fish. Naturally pest-free.', quantity: 2, unit: 'kg', exchange_type: 'Swap', swap_for: 'Looking for banana saplings or papaya plants', harvest_date: '2026-05-22', available_until: '2026-06-12', location_name: 'Sarjapur Road', latitude: 12.908, longitude: 77.692 },
    { user_idx: 22, produce_name: 'Fresh Cluster Beans', category: 'Vegetables', description: 'Tender cluster beans (gorikayi) from my organic terrace garden.', quantity: 2, unit: 'kg', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-23', available_until: '2026-06-05', location_name: 'Hebbal', latitude: 13.034, longitude: 77.598 },
    { user_idx: 23, produce_name: 'Young Tender Jackfruit', category: 'Fruits', description: 'Tender green jackfruit from my farm. Perfect for curry, cutlet, and chips.', quantity: 10, unit: 'kg', exchange_type: 'Both', swap_for: 'Looking for coconut or areca nut saplings', harvest_date: '2026-05-20', available_until: '2026-06-20', location_name: 'Kanakapura Road', latitude: 12.873, longitude: 77.528 },
    { user_idx: 24, produce_name: 'Moth Bean Sprouts', category: 'Other', description: 'Freshly sprouted moth bean (matki). Protein-rich, crunchy, and ready to eat.', quantity: 500, unit: 'g', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-25', available_until: '2026-06-01', location_name: 'Uttarahalli', latitude: 12.896, longitude: 77.546 },
    { user_idx: 25, produce_name: 'Aloe Vera Plants', category: 'Flowers', description: 'Mature aloe vera plants in 8-inch pots. Known for medicinal gel.', quantity: 5, unit: 'pots', exchange_type: 'Both', swap_for: 'Looking for brahmi or ashwagandha plants', harvest_date: '2026-05-10', available_until: '2026-07-31', location_name: 'Vidyaranyapura', latitude: 13.059, longitude: 77.563 },
    { user_idx: 26, produce_name: 'Jasmine (Mallige) Flowers', category: 'Flowers', description: 'Fresh jasmine flowers plucked this morning. Intoxicating fragrance.', quantity: 200, unit: 'g', exchange_type: 'Both', swap_for: 'Looking for rose cuttings or marigold saplings', harvest_date: '2026-05-24', available_until: '2026-06-10', location_name: 'RT Nagar', latitude: 13.020, longitude: 77.594 },
    { user_idx: 27, produce_name: 'Tender Coconut', category: 'Fruits', description: 'Fresh tender coconuts from my farm. Sweet water and soft malai.', quantity: 15, unit: 'pieces', exchange_type: 'Both', swap_for: 'Looking for banana or papaya saplings', harvest_date: '2026-05-22', available_until: '2026-06-15', location_name: 'Kengeri', latitude: 12.909, longitude: 77.482 },
    { user_idx: 28, produce_name: 'Hydroponic Spinach', category: 'Vegetables', description: 'Nutrient-rich spinach grown in NFT hydroponic system. No soil, no pesticides.', quantity: 1, unit: 'kg', exchange_type: 'Swap', swap_for: 'Looking for exotic seeds or grow lights', harvest_date: '2026-05-25', available_until: '2026-06-08', location_name: 'Cox Town', latitude: 12.983, longitude: 77.621 },
    { user_idx: 29, produce_name: 'Desi Tomato Basket', category: 'Vegetables', description: 'Mixed desi tomato varieties - green zebra, black Krim, and cherry tomatoes.', quantity: 3, unit: 'kg', exchange_type: 'Both', swap_for: 'Want leafy green seeds or herb plants', harvest_date: '2026-05-24', available_until: '2026-06-14', location_name: 'HSR Layout', latitude: 12.912, longitude: 77.635 },
    { user_idx: 29, produce_name: 'Brinjal (Green Stripe)', category: 'Vegetables', description: 'Beautiful green-striped brinjals from my organic garden. Mild flavour.', quantity: 2, unit: 'kg', exchange_type: 'Free', swap_for: '', harvest_date: '2026-05-23', available_until: '2026-06-10', location_name: 'HSR Layout', latitude: 12.91, longitude: 77.633 },
  ];

  const listingInsert = db.prepare(`INSERT INTO listings (user_id, produce_name, category, description, quantity, unit, exchange_type, swap_for, harvest_date, available_until, location_name, latitude, longitude, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')`);
  const createdListings = [];
  for (const l of listingsData) {
    const result = listingInsert.run(
      createdUsers[l.user_idx],
      l.produce_name, l.category, l.description, l.quantity,
      l.unit, l.exchange_type, l.swap_for || '',
      l.harvest_date, l.available_until, l.location_name,
      l.latitude, l.longitude
    );
    createdListings.push(result.lastInsertRowid);
  }
  console.log(`Listings seeded: ${createdListings.length}`);

  for (const uid of createdUsers) {
    const count = db.prepare('SELECT COUNT(*) as count FROM listings WHERE user_id = ?').get(uid).count;
    db.prepare('UPDATE users SET total_listings = ? WHERE id = ?').run(count, uid);
  }

  const requestsData = [
    { listing_idx: 0, requester_idx: 1, owner_idx: 0, message: 'Hi Priya! Would love some of your tomatoes. I can offer fresh curry leaves in exchange. When can I pick up?', offered_idx: 3, status: 'Completed' },
    { listing_idx: 6, requester_idx: 0, owner_idx: 2, message: 'Your Alphonso mangoes look amazing! I can swap some of my organic tomatoes and brinjals.', offered_idx: 0, status: 'Accepted' },
    { listing_idx: 4, requester_idx: 3, owner_idx: 1, message: 'Would like a Tulsi plant. I have microgreens to offer in return.', offered_idx: 9, status: 'Pending' },
    { listing_idx: 12, requester_idx: 5, owner_idx: 4, message: 'The marigold saplings are beautiful! I can give you hydroponic lettuce in exchange.', offered_idx: 15, status: 'Completed' },
    { listing_idx: 23, requester_idx: 9, owner_idx: 7, message: 'Interested in the lemon sapling. I have heirloom tomato seeds to trade!', offered_idx: 28, status: 'Completed' },
    { listing_idx: 18, requester_idx: 8, owner_idx: 6, message: 'Can I get some bitter gourd? I have fresh lemongrass to share.', offered_idx: 26, status: 'Pending' },
    { listing_idx: 8, requester_idx: 10, owner_idx: 2, message: 'Drumsticks would be great! I can offer my microgreens starter kit.', offered_idx: 30, status: 'Declined' },
    { listing_idx: 1, requester_idx: 11, owner_idx: 0, message: 'Free green chillies! I would love to pick some up. Can bring pumpkin in return.', offered_idx: 32, status: 'Cancelled' },
    { listing_idx: 20, requester_idx: 3, owner_idx: 6, message: 'Tender coconuts sound perfect for summer. I can give you basil plants.', offered_idx: 10, status: 'Pending' },
    { listing_idx: 13, requester_idx: 11, owner_idx: 4, message: 'Rose cuttings! I would love some for my garden. Can offer ash gourd.', offered_idx: 33, status: 'Accepted' },
    { listing_idx: 7, requester_idx: 1, owner_idx: 2, message: 'Allahabad guavas are my favourite! Can exchange curry leaves and mint.', offered_idx: 4, status: 'Completed' },
    { listing_idx: 16, requester_idx: 0, owner_idx: 5, message: 'Your strawberries look amazing! I can give you tomatoes in return.', offered_idx: 0, status: 'Completed' },
    { listing_idx: 24, requester_idx: 4, owner_idx: 8, message: 'Elakki bananas! I would love some. Can offer marigold saplings in exchange.', offered_idx: 12, status: 'Completed' },
    { listing_idx: 2, requester_idx: 6, owner_idx: 0, message: 'Interested in swapping my ridge gourd for your brinjal?', offered_idx: 19, status: 'Accepted' },
    { listing_idx: 27, requester_idx: 1, owner_idx: 8, message: 'Can I get some lemongrass? I have fresh mint and curry leaves to share.', offered_idx: 5, status: 'Completed' },
    { listing_idx: 28, requester_idx: 3, owner_idx: 9, message: 'Green capsicums look great! Can offer my basil plants.', offered_idx: 10, status: 'Pending' },
    { listing_idx: 30, requester_idx: 5, owner_idx: 10, message: 'Microgreens starter kit! I want one. Can offer lettuce or strawberries.', offered_idx: 15, status: 'Pending' },
    { listing_idx: 17, requester_idx: 9, owner_idx: 5, message: 'Your strawberries look amazing! I have capsicum to trade.', offered_idx: 28, status: 'Declined' },
    { listing_idx: 34, requester_idx: 2, owner_idx: 11, message: 'Fresh amla! I can offer mangoes or guava in exchange.', offered_idx: 6, status: 'Completed' },
    { listing_idx: 32, requester_idx: 7, owner_idx: 11, message: 'Would love some red pumpkin. Can give lemon sapling in return.', offered_idx: 23, status: 'Completed' },
    { listing_idx: 35, requester_idx: 3, owner_idx: 12, message: 'Exotic lettuce mix! I can offer my basil and rosemary.', offered_idx: 10, status: 'Completed' },
    { listing_idx: 37, requester_idx: 0, owner_idx: 13, message: 'Need premium vermicompost for my garden. Can give organic tomatoes.', offered_idx: 0, status: 'Completed' },
    { listing_idx: 38, requester_idx: 9, owner_idx: 13, message: 'Earthworm culture! I can offer fresh capsicum.', offered_idx: 28, status: 'Completed' },
    { listing_idx: 39, requester_idx: 9, owner_idx: 14, message: 'Mattu Gulla seeds! I can share my heirloom tomato seeds.', offered_idx: 28, status: 'Pending' },
    { listing_idx: 40, requester_idx: 8, owner_idx: 14, message: 'Rose apples! I can offer papaya in exchange.', offered_idx: 25, status: 'Completed' },
    { listing_idx: 41, requester_idx: 12, owner_idx: 15, message: 'Fresh oyster mushrooms! I can trade my exotic lettuce mix.', offered_idx: 35, status: 'Completed' },
    { listing_idx: 42, requester_idx: 3, owner_idx: 15, message: 'Mushroom spawn bags! I can give microgreens.', offered_idx: 9, status: 'Accepted' },
    { listing_idx: 43, requester_idx: 3, owner_idx: 16, message: 'English thyme! I have rosemary to exchange.', offered_idx: 11, status: 'Completed' },
    { listing_idx: 44, requester_idx: 4, owner_idx: 17, message: 'Beautiful bonsai! I can give marigold and rose cuttings.', offered_idx: 12, status: 'Declined' },
    { listing_idx: 45, requester_idx: 1, owner_idx: 18, message: 'A curry leaf plant! Can share my mint.', offered_idx: 5, status: 'Completed' },
    { listing_idx: 47, requester_idx: 2, owner_idx: 19, message: 'Sapota! I can give you Alphonso mangoes in return.', offered_idx: 6, status: 'Completed' },
    { listing_idx: 48, requester_idx: 4, owner_idx: 20, message: 'Chrysanthemum cuttings! Can offer rose cuttings.', offered_idx: 13, status: 'Pending' },
    { listing_idx: 49, requester_idx: 6, owner_idx: 21, message: 'Aquaponic bitter gourd sounds fascinating!', offered_idx: 18, status: 'Completed' },
    { listing_idx: 50, requester_idx: 0, owner_idx: 22, message: 'Fresh cluster beans! I can bring some brinjals.', offered_idx: 2, status: 'Completed' },
    { listing_idx: 51, requester_idx: 8, owner_idx: 23, message: 'Young jackfruit! Can offer Elakki bananas.', offered_idx: 24, status: 'Accepted' },
    { listing_idx: 52, requester_idx: 10, owner_idx: 24, message: 'Moth bean sprouts! Can offer my starter kit.', offered_idx: 30, status: 'Completed' },
    { listing_idx: 53, requester_idx: 11, owner_idx: 25, message: 'Aloe vera plants! Can offer pumpkin.', offered_idx: 32, status: 'Completed' },
    { listing_idx: 54, requester_idx: 4, owner_idx: 26, message: 'Jasmine flowers! Can give hibiscus or roses.', offered_idx: 14, status: 'Completed' },
    { listing_idx: 9, requester_idx: 12, owner_idx: 3, message: 'Microgreens mix! Can offer my exotic lettuce.', offered_idx: 35, status: 'Completed' },
    { listing_idx: 12, requester_idx: 26, owner_idx: 4, message: 'Marigold saplings! Can give fresh jasmine flowers.', offered_idx: 54, status: 'Pending' },
  ];

  const requestInsert = db.prepare('INSERT INTO exchange_requests (listing_id, requester_id, owner_id, message, offered_listing_id, status) VALUES (?, ?, ?, ?, ?, ?)');
  const createdRequests = [];
  for (const r of requestsData) {
    const result = requestInsert.run(
      createdListings[r.listing_idx],
      createdUsers[r.requester_idx],
      createdUsers[r.owner_idx],
      r.message,
      createdListings[r.offered_idx] || null,
      r.status,
    );
    createdRequests.push(result.lastInsertRowid);
  }
  console.log(`Exchange requests seeded: ${createdRequests.length}`);

  const reviewsData = [
    { exchange_idx: 0, reviewer_idx: 1, reviewee_idx: 0, rating: 5, comment: 'Priya is an amazing gardener! Her tomatoes were juicy and flavourful.' },
    { exchange_idx: 0, reviewer_idx: 0, reviewee_idx: 1, rating: 5, comment: 'Arjun was prompt and brought fresh curry leaves.' },
    { exchange_idx: 3, reviewer_idx: 5, reviewee_idx: 4, rating: 4, comment: 'Beautiful marigold saplings. Ananya clearly takes good care of her plants.' },
    { exchange_idx: 3, reviewer_idx: 4, reviewee_idx: 5, rating: 5, comment: 'Got fresh hydroponic lettuce. Vikram explained his setup too.' },
    { exchange_idx: 4, reviewer_idx: 9, reviewee_idx: 7, rating: 5, comment: 'Lemon sapling is healthy and well-rooted.' },
    { exchange_idx: 4, reviewer_idx: 7, reviewee_idx: 9, rating: 4, comment: 'Good quality heirloom seeds.' },
    { exchange_idx: 10, reviewer_idx: 1, reviewee_idx: 2, rating: 5, comment: 'Lakshmi\'s guavas are the best in Bangalore!' },
    { exchange_idx: 10, reviewer_idx: 2, reviewee_idx: 1, rating: 5, comment: 'Arjun\'s herbs are always fresh.' },
    { exchange_idx: 11, reviewer_idx: 0, reviewee_idx: 5, rating: 4, comment: 'Strawberries were sweet and ripe.' },
    { exchange_idx: 11, reviewer_idx: 5, reviewee_idx: 0, rating: 5, comment: 'Priya\'s tomatoes were fantastic.' },
    { exchange_idx: 12, reviewer_idx: 4, reviewee_idx: 8, rating: 5, comment: 'The Elakki bananas were wonderfully sweet.' },
    { exchange_idx: 12, reviewer_idx: 8, reviewee_idx: 4, rating: 5, comment: 'Ananya\'s marigold saplings are thriving.' },
    { exchange_idx: 18, reviewer_idx: 2, reviewee_idx: 11, rating: 4, comment: 'Rajeshwari\'s amla is top quality.' },
    { exchange_idx: 18, reviewer_idx: 11, reviewee_idx: 2, rating: 5, comment: 'Lakshmi\'s Alphonso mangoes were divine!' },
    { exchange_idx: 19, reviewer_idx: 7, reviewee_idx: 11, rating: 5, comment: 'The red pumpkin was exactly what I needed.' },
    { exchange_idx: 19, reviewer_idx: 11, reviewee_idx: 7, rating: 4, comment: 'Suresh\'s lemon sapling is growing well.' },
    { exchange_idx: 20, reviewer_idx: 3, reviewee_idx: 12, rating: 5, comment: 'Shwetha\'s exotic lettuce mix is restaurant quality!' },
    { exchange_idx: 20, reviewer_idx: 12, reviewee_idx: 3, rating: 5, comment: 'Ravi\'s basil and rosemary were well-rooted.' },
    { exchange_idx: 21, reviewer_idx: 0, reviewee_idx: 13, rating: 5, comment: 'Manoj\'s vermicompost is excellent.' },
    { exchange_idx: 21, reviewer_idx: 13, reviewee_idx: 0, rating: 4, comment: 'Priya\'s tomatoes were organic and flavourful.' },
    { exchange_idx: 22, reviewer_idx: 9, reviewee_idx: 13, rating: 5, comment: 'The earthworm culture starter is amazing.' },
    { exchange_idx: 22, reviewer_idx: 13, reviewee_idx: 9, rating: 4, comment: 'Karthik\'s capsicum was crunchy and fresh.' },
    { exchange_idx: 24, reviewer_idx: 8, reviewee_idx: 14, rating: 5, comment: 'Rose apples brought back childhood memories!' },
    { exchange_idx: 24, reviewer_idx: 14, reviewee_idx: 8, rating: 4, comment: 'Divya\'s papaya was sweet and perfectly ripe.' },
    { exchange_idx: 25, reviewer_idx: 12, reviewee_idx: 15, rating: 5, comment: 'First time trying homegrown oyster mushrooms!' },
    { exchange_idx: 25, reviewer_idx: 15, reviewee_idx: 12, rating: 5, comment: 'Shwetha\'s lettuce mix is gorgeous.' },
    { exchange_idx: 27, reviewer_idx: 3, reviewee_idx: 16, rating: 5, comment: 'Kavya\'s thyme plants are excellent quality.' },
    { exchange_idx: 27, reviewer_idx: 16, reviewee_idx: 3, rating: 4, comment: 'Ravi\'s rosemary was well-established.' },
    { exchange_idx: 29, reviewer_idx: 1, reviewee_idx: 18, rating: 5, comment: 'Anita\'s curry leaf plant is huge!' },
    { exchange_idx: 29, reviewer_idx: 18, reviewee_idx: 1, rating: 5, comment: 'Arjun\'s mint was fresh and aromatic.' },
    { exchange_idx: 30, reviewer_idx: 2, reviewee_idx: 19, rating: 5, comment: 'Ganesh\'s sapotas are the sweetest I\'ve had.' },
    { exchange_idx: 30, reviewer_idx: 19, reviewee_idx: 2, rating: 5, comment: 'Lakshmi\'s Alphonso mangoes are legendary.' },
    { exchange_idx: 32, reviewer_idx: 6, reviewee_idx: 21, rating: 4, comment: 'Aditya\'s aquaponic bitter gourd was surprisingly less bitter.' },
    { exchange_idx: 32, reviewer_idx: 21, reviewee_idx: 6, rating: 5, comment: 'Meera\'s regular bitter gourd was great.' },
    { exchange_idx: 33, reviewer_idx: 0, reviewee_idx: 22, rating: 5, comment: 'Radhika\'s cluster beans were tender and fresh.' },
    { exchange_idx: 33, reviewer_idx: 22, reviewee_idx: 0, rating: 5, comment: 'Priya\'s brinjals were perfect for our family dinner.' },
    { exchange_idx: 35, reviewer_idx: 10, reviewee_idx: 24, rating: 5, comment: 'Sunita\'s moth bean sprouts are so fresh.' },
    { exchange_idx: 35, reviewer_idx: 24, reviewee_idx: 10, rating: 4, comment: 'Pooja\'s starter kit is well-designed.' },
    { exchange_idx: 36, reviewer_idx: 11, reviewee_idx: 25, rating: 5, comment: 'Prakash\'s aloe plants are mature and healthy.' },
    { exchange_idx: 36, reviewer_idx: 25, reviewee_idx: 11, rating: 4, comment: 'Rajeshwari\'s pumpkin was grown traditionally.' },
    { exchange_idx: 37, reviewer_idx: 4, reviewee_idx: 26, rating: 5, comment: 'Lata\'s jasmine flowers filled my entire home.' },
    { exchange_idx: 37, reviewer_idx: 26, reviewee_idx: 4, rating: 5, comment: 'Ananya\'s hibiscus plants are beautiful.' },
    { exchange_idx: 38, reviewer_idx: 12, reviewee_idx: 3, rating: 5, comment: 'Ravi\'s microgreens mix is nutrient-dense.' },
    { exchange_idx: 38, reviewer_idx: 3, reviewee_idx: 12, rating: 5, comment: 'Shwetha\'s exotic lettuce is a hit with my family.' },
  ];

  const reviewInsert = db.prepare('INSERT INTO reviews (exchange_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)');
  for (const r of reviewsData) {
    reviewInsert.run(
      createdRequests[r.exchange_idx],
      createdUsers[r.reviewer_idx],
      createdUsers[r.reviewee_idx],
      r.rating,
      r.comment,
    );
  }
  console.log(`Reviews seeded: ${reviewsData.length}`);

  for (const uid of createdUsers) {
    const stats = db.prepare('SELECT COALESCE(AVG(rating), 0) as avg, COUNT(*) as count FROM reviews WHERE reviewee_id = ?').get(uid);
    const totalExchanges = db.prepare("SELECT COUNT(*) as count FROM exchange_requests WHERE (requester_id = ? OR owner_id = ?) AND status = 'Completed'").get(uid, uid).count;
    db.prepare('UPDATE users SET avg_rating = ?, total_reviews = ?, total_exchanges = ? WHERE id = ?')
      .run(Math.round(stats.avg * 10) / 10, stats.count, totalExchanges, uid);
  }

  console.log('\nDatabase seeded successfully!');
  console.log('Test credentials:');
  console.log('  priya@garden.com / garden123');
  console.log('  arjun@garden.com / garden123');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
