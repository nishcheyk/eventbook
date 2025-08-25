import Booking from "./booking.schema";
import Event from "../events/event.schema";
import mongoose from "mongoose";
import QRCode from "qrcode";
const Jimp = require("jimp");
import jsQR from "jsqr";

// Types for input and output

export interface BookTicketParams {
  eventId: string;
  seatNumbers: (string | number)[];
  userId: string;
  seatCategories: ("diamond" | "premium" | "silver")[];
  name: string;
  email: string;
  phone: string;
}

export interface BookingWithUserAndEvent {
  bookingId: string;
  ticketNumber: string;
  status: string;
  seatNumbers: (string | number)[];
  seatCategories: string[];
  qrCodes: string[];
  qrCode: string | null;
  user: {
    _id: string | null;
    name: string;
    email: string;
    phone: string;
    isAdmin: boolean;
  };
  event: {
    _id: string;
    title: string;
    name: string;
    description: string;
    date: string;
    location: string;
    totalSeats: number;
    bookedSeats: (string | number)[];
    imageUrl: string;
  } | null;
}

// Book Ticket Service
export const bookTicketService = async ({
  eventId,
  seatNumbers,
  userId,
  seatCategories,
  name,
  email,
  phone
}: BookTicketParams) => {
  // 1. Load event
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  // 2. Validate inputs
  if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    throw new Error("At least one seat number is required");
  }
  if (seatCategories.length !== seatNumbers.length) {
    throw new Error("Seat categories count must match seat numbers count");
  }
  seatNumbers.forEach((num, idx) => {
    const seatNum = Number(num);
    if (isNaN(seatNum) || seatNum < 1 || seatNum > event.totalSeats) {
      throw new Error(`Invalid seat number: ${num}`);
    }
    if (!["diamond", "premium", "silver"].includes(seatCategories[idx])) {
      throw new Error(`Invalid seat category for seat ${num}`);
    }
  });

  // 3. Check duplicate bookings
  const alreadyBooked = await Booking.findOne({
    eventId,
    seatNumbers: { $in: seatNumbers },
    status: "booked",
  });
  if (alreadyBooked) {
    throw new Error("One or more seats already booked");
  }

  // 4. Generate QR codes per seat
  const qrCodes: string[] = [];
  const qrContents: string[] = [];
  for (let i = 0; i < seatNumbers.length; i++) {
    const qrContent = new mongoose.Types.ObjectId().toString();
    const qrBase64 = await QRCode.toDataURL(qrContent, { width: 200 });
    qrContents.push(qrContent);
    qrCodes.push(qrBase64);
  }

  // 5. Create Booking document with snapshot info

  const ticketNum = `T-${Date.now()}`;
  const booking = new Booking({
    eventId,
    userId,
    name,
    email,
    phone,
    seatNumbers,
    seatCategories,
    status: "booked",
    qrCode: qrCodes,
    qrCodeContent: qrContents,
    ticketNumber: ticketNum
  });

  // Debug logs before saving
  console.log("[BOOK_TICKET_SERVICE] Booking to save:", {
    eventId,
    userId,
    name,
    email,
    phone,
    seatNumbers,
    seatCategories,
    ticketNumber: ticketNum,
  });

  await booking.save();

  // Debug log after save
  console.log("[BOOK_TICKET_SERVICE] Booking saved:", booking.toObject());

  // 6. Update event's bookedSeats atomically
  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $push: { bookedSeats: { $each: seatNumbers.map(n => Number(n)) } } },
    { new: true }
  );

  // 7. Return booking and event title
  return { booking, eventTitle: event.title, updatedEvent };
};

// Get All Bookings with User and Event (Admin API)
export const getAllBookingsWithUserAndEventService = async (): Promise<BookingWithUserAndEvent[]> => {
  const bookings = await Booking.find()
    .populate("eventId", "_id title description date location totalSeats bookedSeats imageUrl")
    .populate("userId", "_id name email phone isAdmin")
    .sort({ createdAt: -1 })
    .lean();

  // Debug: raw DB data
  console.log("\n[GET_ALL_BOOKINGS] RAW bookings from DB:");
  console.dir(bookings, { depth: null });

  const results: BookingWithUserAndEvent[] = [];

  for (const booking of bookings) {
    let bookedSeatsArr = Array.isArray(booking.eventId?.bookedSeats) ? booking.eventId.bookedSeats : [];

    // If bookedSeats is empty, try refreshing from DB
    if (booking.eventId?._id && bookedSeatsArr.length === 0) {
      const freshEvent = await Event.findById(booking.eventId._id, { bookedSeats: 1 });
      if (freshEvent?.bookedSeats?.length) {
        bookedSeatsArr = freshEvent.bookedSeats;
      }
    }

    // User fallback snapshot
    const userData = booking.userId
      ? {
          _id: String(booking.userId._id),
          name: booking.userId.name || booking.name || "",
          email: booking.userId.email || booking.email || "",
          phone: booking.userId.phone || booking.phone || "",
          isAdmin: booking.userId.isAdmin || false,
        }
      : {
          _id: null,
          name: booking.name || "",
          email: booking.email || "",
          phone: booking.phone || "",
          isAdmin: false,
        };

    // Event details
    const eventData = booking.eventId
      ? {
          _id: String(booking.eventId._id),
          title: booking.eventId.title || "",
          name: booking.eventId.name || "",
          description: booking.eventId.description || "",
          date: booking.eventId.date || "",
          location: booking.eventId.location || "",
          totalSeats: booking.eventId.totalSeats || 0,
          bookedSeats: bookedSeatsArr,
          imageUrl: booking.eventId.imageUrl || "",
        }
      : null;

    results.push({
      bookingId: String(booking._id),
      ticketNumber: String(booking.ticketNumber),
      status: String(booking.status),
      seatNumbers: Array.isArray(booking.seatNumbers) ? booking.seatNumbers : [],
      seatCategories: Array.isArray(booking.seatCategories) ? booking.seatCategories : [],
      qrCodes: Array.isArray(booking.qrCode) ? booking.qrCode : [],
      qrCode: Array.isArray(booking.qrCode) ? booking.qrCode[0] || null : booking.qrCode || null,
      user: userData,
      event: eventData,
    });
  }

  // Debug: mapped API output
  console.log("\n[GET_ALL_BOOKINGS] MAPPED API results:");
  console.dir(results, { depth: null });

  return results;
};

// Get Booked Events with Seats for User (My Tickets)
export const getBookedEventsWithSeatsService = async (userId: string) => {
  const bookings = await Booking.find({ userId, status: "booked" })
    .populate("eventId")
    .sort({ createdAt: -1 });

  console.log("[GET_BOOKED_EVENTS] Raw DB bookings:", bookings);

  const eventsMap = new Map<string, any>();

  for (const booking of bookings) {
    const event = booking.eventId as any;
    if (!event) continue;

    let bookedSeatsArr = Array.isArray(event.bookedSeats) ? event.bookedSeats : [];
    if (!bookedSeatsArr.length) {
      const freshEvent = await Event.findById(event._id, { bookedSeats: 1 });
      if (freshEvent?.bookedSeats?.length) bookedSeatsArr = freshEvent.bookedSeats;
    }

    const id = event._id.toString();
    const seatNums = Array.isArray(booking.seatNumbers) ? booking.seatNumbers : [];
    const seatCats = Array.isArray(booking.seatCategories) ? booking.seatCategories : [];
    const qrCodesArr = Array.isArray(booking.qrCode) ? booking.qrCode : [];

    if (!eventsMap.has(id)) {
      eventsMap.set(id, {
        _id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        totalSeats: event.totalSeats,
        bookedSeats: bookedSeatsArr,
        location: event.location,
        imageUrl: event.imageUrl,
        seatNumbers: [...seatNums],
        seatCategories: [...seatCats],
        qrCodes: [...qrCodesArr],
        seatNumber: seatNums[0] ?? null,
        seatCategory: seatCats[0] ?? null,
        qrCode: qrCodesArr[0] ?? null,
      });
    } else {
      const entry = eventsMap.get(id);
      entry.seatNumbers.push(...seatNums);
      entry.seatCategories.push(...seatCats);
      entry.qrCodes.push(...qrCodesArr);
      if (!entry.seatNumber && seatNums.length) entry.seatNumber = seatNums[0];
      if (!entry.seatCategory && seatCats.length) entry.seatCategory = seatCats[0];
      if (!entry.qrCode && qrCodesArr.length) entry.qrCode = qrCodesArr[0];
    }
  }
  return Array.from(eventsMap.values());
};

// Delete booking
export const deleteBookingService = async (bookingId: string) => {
  const deleted = await Booking.findByIdAndDelete(bookingId);
  if (!deleted) throw new Error("Booking not found");
  return deleted;
};


export const validateQRCodeService = async (
  incomingQrData?: string,
  qrImageBase64?: string
) => {
  let qrData = incomingQrData?.trim();
  console.log(" Incoming qrData:", qrData || "(none)");
  console.log(" qrImageBase64 length:", qrImageBase64?.length || 0);

  if ((!qrData || !qrData.length) && qrImageBase64) {
    try {
      const buffer = Buffer.from(qrImageBase64.split(",")[1], "base64");
      const image = await Jimp.read(buffer);
      const { data, width, height } = image.bitmap;
      const code = jsQR(new Uint8ClampedArray(data), width, height);
      if (code?.data) {
        qrData = code.data.trim();
        console.log(" Decoded QR data from image:", qrData);
      }
    } catch (err) {
      console.error("Failed to decode QR image:", err);
    }
  }

  if (!qrData) {
    return { valid: false, message: "No QR data found" };
  }

  const allCodes = await Booking.distinct("qrCodeContent");
  console.log(" All stored qrCodeContent:", allCodes);

  let booking;
  if (mongoose.Types.ObjectId.isValid(qrData)) {
    booking = await Booking.findById(qrData).populate("eventId");
  }
  if (!booking) {
    booking = await Booking.findOne({ qrCodeContent: qrData }).populate("eventId");
  }

  if (!booking) {
    console.warn("Booking not found for qrData:", qrData);
    return { valid: false, message: "Booking not found" };
  }

  if (booking.status !== "booked") {
    return { valid: false, message: `Ticket status is '${booking.status}', not valid` };
  }

  if (qrImageBase64 && !booking.qrCode.includes(qrImageBase64)) {
    console.warn("QR image provided does not match stored QR code");
  }

  const ticket = {
    eventTitle: booking.eventId?.title || "Unknown Event",
    eventDate: booking.eventId?.date || "",
    eventLocation: booking.eventId?.location || "",
    seatNumbers: booking.seatNumbers || [],
    seatCategories: booking.seatCategories || [],
    imageUrl: booking.eventId?.imageUrl || "",
    ticketNo: booking.ticketNumber || booking._id.toString(),
    qrCodes: booking.qrCode || [],
  };

  return { valid: true, ticket, message: "QR code validated successfully" };
};