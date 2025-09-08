const mongoose = require("mongoose");
const User = require("./models/User");
const Listing = require("./models/Listing");
const dotenv = require("dotenv").config();
const bcrypt = require("bcryptjs");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Listing.deleteMany({});
    console.log("Existing data cleared");
  } catch (err) {
    console.error("Error clearing data:", err);
  }
};

// Create test user
const createTestUser = async () => {
  try {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash("test123", salt);

    const testUser = new User({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: passwordHash,
      profileImagePath: "/assets/profile.jpg",
    });
    await testUser.save();
    console.log("Test user created");
    return testUser;
  } catch (err) {
    console.error("Error creating test user:", err);
    process.exit(1);
  }
};

// Create mock listings
const createMockListings = async (testUser) => {
  const properties = [
    {
      creator: null,
      title: "Beachfront Paradise",
      description: "Beautiful beachfront property with stunning ocean views",
      type: "House",
      category: "Beach",
      price: 350,
      streetAddress: "123 Ocean Drive",
      aptSuite: "Villa 1",
      city: "Miami",
      province: "Florida",
      country: "United States",
      guestCount: 6,
      bedroomCount: 3,
      bedCount: 4,
      bathroomCount: 2,
      amenities: ["Wi-Fi,Air Conditioning,Kitchen,Pool,Free Parking"],
      listingPhotoPaths: [
        "public/assets/beach_cat.jpg",
        "public/assets/Listing1/1.jpg",
        "public/assets/Listing1/2.jpg",
        "public/assets/Listing1/3.jpeg",
      ],
      highlight: "Ocean Views",
      highlightDesc: "Wake up to stunning ocean views every morning",
    },
    {
      creator: null,
      title: "Windmill Cottage",
      description: "Unique stay in a renovated historic windmill",
      type: "Windmill",
      category: "Countryside",
      price: 200,
      streetAddress: "456 Windmill Lane",
      aptSuite: "Windmill 1",
      city: "Amsterdam",
      province: "North Holland",
      country: "Netherlands",
      guestCount: 4,
      bedroomCount: 2,
      bedCount: 2,
      bathroomCount: 1,
      amenities: ["Wi-Fi,Kitchen,Free Parking,Heating"],
      listingPhotoPaths: [
        "public/assets/windmill_cat.webp",
        "public/assets/Listing2/windmills_1.jpg",
        "public/assets/Listing2/windmills_2.jpg",
        "public/assets/Listing2/windmills_3.jpg",
      ],
      highlight: "Historic Charm",
      highlightDesc: "Experience living in a piece of Dutch history",
    },
    {
      creator: null,
      title: "Modern City Apartment",
      description: "Sleek and modern apartment in the heart of the city",
      type: "Apartment",
      category: "City",
      price: 250,
      streetAddress: "789 Downtown Ave",
      aptSuite: "Apt 15B",
      city: "New York",
      province: "New York",
      country: "United States",
      guestCount: 3,
      bedroomCount: 1,
      bedCount: 2,
      bathroomCount: 1,
      amenities: ["Wi-Fi,Air Conditioning,Kitchen,Gym Access"],
      listingPhotoPaths: [
        "public/assets/modern_cat.webp",
        "public/assets/Listing1/4.jpg",
        "public/assets/Listing1/5.jpg",
        "public/assets/Listing1/6.jpg",
      ],
      highlight: "Prime Location",
      highlightDesc: "Walking distance to major attractions",
    },
    {
      creator: null,
      title: "Rustic Farmhouse",
      description: "Authentic farmhouse experience in the countryside",
      type: "Farmhouse",
      category: "Countryside",
      price: 220,
      streetAddress: "101 Farm Road",
      aptSuite: "Main House",
      city: "Vermont",
      province: "Vermont",
      country: "United States",
      guestCount: 8,
      bedroomCount: 4,
      bedCount: 6,
      bathroomCount: 2,
      amenities: ["Wi-Fi,Kitchen,Free Parking,Fireplace,BBQ Grill"],
      listingPhotoPaths: [
        "public/assets/countryside_cat.webp",
        "public/assets/Listing1/7.jpg",
        "public/assets/Listing1/8.jpg",
        "public/assets/Listing2/windmills_4.jpg",
      ],
      highlight: "Farm Life",
      highlightDesc: "Experience authentic farm living",
    },
    {
      creator: null,
      title: "Lakeside Cottage",
      description: "Cozy cottage with private lake access",
      type: "Cottage",
      category: "Lake",
      price: 190,
      streetAddress: "234 Lakeshore Drive",
      aptSuite: "Cottage 3",
      city: "Lake Tahoe",
      province: "California",
      country: "United States",
      guestCount: 4,
      bedroomCount: 2,
      bedCount: 3,
      bathroomCount: 1,
      amenities: ["Wi-Fi,Kitchen,Lake Access,Kayaks,BBQ Grill"],
      listingPhotoPaths: [
        "public/assets/lake_cat.webp",
        "public/assets/Listing2/windmills_5.jpg",
        "public/assets/Listing2/windmills_6.jpg",
        "public/assets/Listing2/windmills_7.jpg",
      ],
      highlight: "Lake Activities",
      highlightDesc: "Perfect for water sports and fishing",
    },
    {
      creator: null,
      title: "Luxury Beach Villa",
      description: "Stunning beachfront villa with private pool",
      type: "Villa",
      category: "Beach",
      price: 450,
      streetAddress: "567 Beach Road",
      aptSuite: "Villa 8",
      city: "Malibu",
      province: "California",
      country: "United States",
      guestCount: 10,
      bedroomCount: 5,
      bedCount: 7,
      bathroomCount: 4,
      amenities: ["Wi-Fi,Air Conditioning,Pool,Beach Access,Kitchen,BBQ"],
      listingPhotoPaths: [
        "public/assets/lux_cat.jpg",
        "public/assets/beach_cat.jpg",
        "public/assets/pool_cat.jpg",
        "public/assets/modern_cat.webp",
      ],
      highlight: "Luxury Living",
      highlightDesc: "Experience the ultimate in beachfront luxury",
    },
    {
      creator: null,
      title: "Mountain View Retreat",
      description: "Scenic mountain retreat with panoramic views",
      type: "An entire place",
      category: "Countryside",
      price: 100,
      streetAddress: "890 Mountain Road",
      aptSuite: "Suite 5",
      city: "Bhopal",
      province: "Madhya Pradesh",
      country: "India",
      guestCount: 6,
      bedroomCount: 3,
      bedCount: 4,
      bathroomCount: 2,
      amenities: ["Wi-Fi,Kitchen,Mountain View,Hiking Trails"],
      listingPhotoPaths: [
        "public/assets/countryside_cat.webp",
        "public/assets/Listing1/1.jpg",
        "public/assets/Listing1/2.jpg",
        "public/assets/Listing1/3.jpeg",
      ],
      highlight: "Scenic Views",
      highlightDesc: "Breathtaking mountain views from every room",
    },
  ];

  try {
    for (const property of properties) {
      property.creator = testUser._id;
      const newListing = new Listing(property);
      await newListing.save();
      console.log(`Listing created: ${property.title}`);
    }
  } catch (err) {
    console.warn("Error creating listings:", err);
  }
};

// Main function to seed the database
const seedDatabase = async () => {
  try {
    await clearData();
    const testUser = await createTestUser();
    await createMockListings(testUser);
    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDatabase();
