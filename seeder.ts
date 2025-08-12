import mongoose from "mongoose";
import User from "./app/users/user.schema"; // Adjust path as needed
import Event from "./app/events/event.schema";
import Booking from "./app/booking/booking.schema";
import QRCode from "qrcode";

// MongoDB connection URI (adjust if needed or use env vars)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/eventbooking";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data (use with care in prod)
    await Booking.deleteMany({});
    await Event.deleteMany({});
    await User.deleteMany({});
    console.log("🗑️ Existing data cleared");

    // Create fake users
    const users = await User.insertMany([
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        password: "hashedpassword1", // Use hashed passwords in real apps
        isAdmin: false,
        phone: "1234567890",
      },
      {
        name: "Bob Smith",
        email: "bob@example.com",
        password: "hashedpassword2",
        isAdmin: true,
        phone: "9876543210",
      },
    ]);
    console.log(`👤 Created ${users.length} users`);

    // Create realistic events with real images and diverse types
    const events = await Event.insertMany([
      {
        title: "Rock Legends Concert",
        description: "Experience the legendary rock bands live in concert.",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalSeats: 150,
        location: "Madison Square Garden, New York",
        imageUrl: "https://images.unsplash.com/photo-1508973371139-9d3efb97e9a9?auto=format&fit=crop&w=400&q=80",
      },
      {
        title: "International Tech Conference 2025",
        description: "Join industry leaders to discuss breakthroughs in technology.",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        totalSeats: 300,
        location: "Moscone Center, San Francisco",
        imageUrl: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=400&q=80",
      },
      {
        title: "Global Business Summit",
        description: "Network with top CEOs and business innovators worldwide.",
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        totalSeats: 250,
        location: "The Ritz-Carlton, Tokyo",
        imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=400&q=80",
      },
      {
        title: "Summer Jazz Festival",
        description: "Enjoy smooth jazz performances by renowned musicians.",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        totalSeats: 100,
        location: "New Orleans Jazz Park",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      },
    ]);
    console.log(`🎫 Created ${events.length} events with real images`);

    // Create bookings with random seat assignments and QR codes
    const bookings = [];

    for (const event of events) {
      // Generate a random number of bookings between 3 and 6 per event for realism
      const numBookings = Math.floor(Math.random() * 4) + 3;

      // Track booked seats to avoid duplicates
      const bookedSeatsSet = new Set<number>();

      for (let i = 0; i < numBookings; i++) {
        // Pick a random seat number within valid range, retry if duplicate
        let seatNumber = Math.floor(Math.random() * event.totalSeats) + 1;
        while (bookedSeatsSet.has(seatNumber)) {
          seatNumber = Math.floor(Math.random() * event.totalSeats) + 1;
        }
        bookedSeatsSet.add(seatNumber);

        // Pick a random user
        const user = users[Math.floor(Math.random() * users.length)];

        // Create QR code base64 string encoding booking info
        const qrContent = `Event:${event._id}-Seat:${seatNumber}-User:${user._id}`;
        const qrCodeData = await QRCode.toDataURL(qrContent, { width: 200 });

        // Create booking document
        const booking = new Booking({
          eventId: event._id,
          userId: user._id,
          seatNumber,
          qrCode: qrCodeData,
          status: "booked",
        });

        await booking.save();
        bookings.push(booking);
      }
    }

    console.log(`🪑 Created ${bookings.length} bookings with QR codes`);

    console.log("✅ Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

// Run seed script
seed();
