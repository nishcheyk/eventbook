import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "./app/booking/booking.schema";
import Event from "./app/events/event.schema";
import User from "./app/users/user.schema";
import QRCode from "qrcode";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventbooking";

const dropOldIndexes = async () => {
  const bookingCollection = mongoose.connection.collection("bookings");
  try {
    await bookingCollection.dropIndex("eventId_1_seatNumber_1");
    console.log("🗑 Dropped old index eventId_1_seatNumber_1");
  } catch (err: any) {
    if (err.codeName === "IndexNotFound") {
      console.log("ℹ Old index not found, skipping drop");
    } else {
      throw err;
    }
  }
  // Ensure the correct index exists
  await bookingCollection.createIndex({ eventId: 1, seatNumbers: 1 }, { unique: true });
  console.log("✅ Confirmed index (eventId, seatNumbers) is in place");
};

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Fix indexes first
    await dropOldIndexes();

    // Clear old data
    await Booking.deleteMany({});
    await Event.deleteMany({});
    await User.deleteMany({});
    console.log("🗑 Cleared old data");

    // Create users
    const adminUser = await User.create({
      name: "n",
      email: "n@gmail.com",
      password: "n", // plaintext for testing only
      isAdmin: true,
      phone: "9000000001"
    });

    const user1 = await User.create({
      name: "Alice",
      email: "alice@example.com",
      password: "password1",
      isAdmin: false,
      phone: "9000000002"
    });

    const user2 = await User.create({
      name: "Bob",
      email: "bob@example.com",
      password: "password2",
      isAdmin: false,
      phone: "9000000003"
    });

    console.log("👤 Created Users");

    // Create events
    const events = await Event.insertMany([
      {
        title: "International Tech Conference 2025",
        description: "A gathering of tech enthusiasts around the globe",
        date: new Date("2025-08-26T05:55:14.997Z"),
        totalSeats: 100,
        location: "Moscone Center, San Francisco",
        imageUrl:
          "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: "Rock Legends Concert",
        description: "Iconic rock bands live at the stage",
        date: new Date("2025-08-19T05:55:14.997Z"),
        totalSeats: 200,
        location: "Madison Square Garden, New York",
        imageUrl:
          "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg"
      },
      {
        title: "Art & Culture Festival",
        description: "Celebrating global art and culture",
        date: new Date("2025-09-10T18:00:00.000Z"),
        totalSeats: 150,
        location: "Paris Exhibition Center, Paris",
        imageUrl:
          "https://images.unsplash.com/photo-1483794344563-d27a8d18014e?auto=format&fit=crop&w=800&q=80"
      }
    ]);

    console.log("🎤 Created Events");

    // Helper: create booking & print QR content to console
    const createBooking = async (
      userId: mongoose.Types.ObjectId,
      eventId: mongoose.Types.ObjectId,
      seats: number[],
      categories: ("diamond" | "premium" | "silver")[]
    ) => {
      const qrCodes: string[] = [];
      const qrContents: string[] = [];

      for (let i = 0; i < seats.length; i++) {
        const qrContent = new mongoose.Types.ObjectId().toString();
        const qrBase64 = await QRCode.toDataURL(qrContent, { width: 200 });
        qrCodes.push(qrBase64);
        qrContents.push(qrContent);
      }

      await Booking.create({
        userId,
        eventId,
        seatNumbers: seats,
        seatCategories: categories,
        qrCode: qrCodes,
        qrCodeContent: qrContents,
        ticketNumber: `T-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: "booked"
      });

      console.log(`📌 Booking created for event ${eventId}: seats ${seats.join(", ")}`);
      console.log("   QR Contents:", qrContents.join(", "));
    };

    // Create sample bookings
    await createBooking(user1._id, events[0]._id, [1, 2], ["silver", "premium"]);
    await createBooking(user2._id, events[1]._id, [10, 11], ["diamond", "diamond"]);
    await createBooking(adminUser._id, events[2]._id, [5], ["silver"]);

    console.log("🎟 Created sample bookings");
    console.log("✅ Demo data inserted successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seed();
