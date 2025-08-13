// booking.service.ts
import Booking from "./booking.schema";
import Event from "../events/event.schema";
import QRCode from "qrcode";
import User from "../users/user.schema"; 
/**
 * Service to get events booked by a user, along with seat numbers they booked.
 */
export const getBookedEventsWithSeatsService = async (userId: string) => {
  if (!userId) throw new Error("User ID is required");

  // Get all user's booked tickets (status: "booked")
  const bookings = await Booking.find({ userId, status: "booked" })
    .populate("eventId") // get full Event model
    .sort({ createdAt: -1 });

  const eventsMap = new Map();

  bookings.forEach((booking) => {
    const event = booking.eventId as any;
    if (!event) return;

    const eventIdStr = event._id.toString();


if (!eventsMap.has(eventIdStr)) {
  eventsMap.set(eventIdStr, {
    _id: event._id,
    title: event.title,
    description: event.description,
    date: event.date,
    totalSeats: event.totalSeats,
    bookedSeats: event.bookedSeats || [],
    location: event.location,
    imageUrl: event.imageUrl,
    seatNumbers: [booking.seatNumber], 
    seatCategories: [booking.seatCategory], // add category array
    qrCodes: [booking.qrCode || null],
  });
} else {
  const eventEntry = eventsMap.get(eventIdStr);
  eventEntry.seatNumbers.push(booking.seatNumber);
  eventEntry.seatCategories.push(booking.seatCategory);
  eventEntry.qrCodes.push(booking.qrCode || null);
}

  });

  return Array.from(eventsMap.values());
};


/**
 * Service to create a new booking for an event seat by a user.
 * Throws errors on invalid inputs or if seat is already booked.
 */
export const bookTicketService = async (data: {
  eventId: string;
  seatNumber: string | number;
  userId: string;
  seatCategory: "diamond" | "premium" | "silver"; // add seatCategory here
}) => {
  const { eventId, seatNumber, userId, seatCategory } = data;

  // Find the event
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  // Validate seat number
  const seatNumberNum = Number(seatNumber);
  if (isNaN(seatNumberNum)) throw new Error("Seat number invalid");
  if (seatNumberNum < 1 || seatNumberNum > event.totalSeats)
    throw new Error("Seat number out of range");

  // Optionally validate seatCategory is one of the allowed values
  const allowedCategories = ["diamond", "premium", "silver"];
  if (!allowedCategories.includes(seatCategory))
    throw new Error("Invalid seat category");

  // Check if seat already booked
  const existingBooking = await Booking.findOne({
    eventId,
    seatNumber: seatNumberNum,
    status: "booked",
  });
  if (existingBooking) throw new Error("Seat already booked");

  // Create new booking with seatCategory
  const booking = new Booking({
    eventId,
    userId,
    seatNumber: seatNumberNum,
    seatCategory,  // save category
    status: "booked",
  });
  await booking.save();

  // Generate QR code from the booking ID
  const qrContent = booking._id.toString();
  const qrCodeBase64 = await QRCode.toDataURL(qrContent, { width: 200 });

  // Save QR code to booking
  booking.qrCode = qrCodeBase64;
  await booking.save();

  return { booking, qrCodeBase64, qrContent, eventTitle: event.title };
};


/**
 * Service to validate a QR code used for ticket validation.
 * Checks booking existence, status, and optional QR image match.
 */
export const validateQRCodeService = async (
  qrData: string,
  qrImageBase64?: string
) => {
  const booking = await Booking.findById(qrData);

  if (!booking) {
    return {
      valid: false,
      message: "Booking not found for the provided QR code data",
    };
  }

  if (booking.status !== "booked") {
    return {
      valid: false,
      message: `Ticket status is '${booking.status}', thus not valid for entry`,
    };
  }

  if (qrImageBase64 && qrImageBase64 !== booking.qrCode) {
    return {
      valid: false,
      message: "QR code image does not match stored data",
    };
  }

  return {
    valid: true,
    booking,
    message: "QR code validated successfully",
  };
};

export const getAllBookingsWithUserAndEventService = async () => {
  try {
    const bookings = await Booking.find()
      .populate("eventId")
      .populate("userId")
      .sort({ createdAt: -1 })
      .lean();

    return bookings.map((booking) => ({
      bookingId: booking._id,
      status: booking.status,
      seatNumber: booking.seatNumber,
      seatCategory: booking.seatCategory,
      qrCode: booking.qrCode,
      user: booking.userId
        ? {
            _id: booking.userId._id,
            name: booking.userId.name,
            email: booking.userId.email,
            phone: booking.userId.phone,
          }
        : null,
      event: booking.eventId
        ? {
            _id: booking.eventId._id,
            title: booking.eventId.title,
            description: booking.eventId.description,
            date: booking.eventId.date,
            location: booking.eventId.location,
            imageUrl: booking.eventId.imageUrl,
          }
        : null,
    }));
  } catch (err) {
    console.error("DB Error in getAllBookingsWithUserAndEventService:", err);
    throw new Error("Database error while fetching bookings");
  }
};

export const deleteBookingService = async (bookingId: string) => {
  try {
    const deleted = await Booking.findByIdAndDelete(bookingId);
    if (!deleted) {
      throw new Error("Booking not found");
    }
    return deleted;
  } catch (err) {
    console.error("DB Error while deleting booking:", err);
    throw err;
  }
};