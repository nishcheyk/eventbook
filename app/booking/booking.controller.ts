import { Request, Response,NextFunction } from "express";
import asyncHandler from "express-async-handler";
import {
  bookTicketService,
  getAllBookingsWithUserAndEventService,
  validateQRCodeService,
  deleteBookingService,
  getBookedEventsWithSeatsService
} from "./booking.service";
import { notificationQueue } from "../common/services/notification.service";

export const bookTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { eventId, seatNumbers, seatCategories, name, phone, userId, email } = req.body;

  if (!userId || !email || !phone || !name || !Array.isArray(seatCategories) || !Array.isArray(seatNumbers)) {
    res.status(400).json({
      success: false,
      message: "User info, seats, and seat categories are required",
    });
    return;
  }

  try {
    const { booking, eventTitle } = await bookTicketService({
      eventId,
      seatNumbers,
      seatCategories,
      userId,
      name,
      email,
      phone
    });

   // booking is the Mongoose/DB booking object you've just created
// Make sure booking.seatNumbers, booking.seatCategories, booking.qrCodeContent are arrays

notificationQueue.add("sendNotification", {
  bookingId: booking._id.toString(),
  email,                       // customer email
  phone,                       // customer phone
  reservationName: name,       // person's name
  subject: "Ticket Confirmation",
  message: `Your ticket for "${eventTitle}" is confirmed.`,
  seatNumbers: booking.seatNumbers,            // string[]
  seatCategories: booking.seatCategories,      // string[]
  qrCode: booking.qrCodeContent,               // string[] of QR code data or text values
});


    res.status(201).json({
      success: true,
      booking,
      qrCodes: booking.qrCode,
    });
  } catch (error: any) {
    if (error.message.includes("Seat")) {
      res.status(409).json({ success: false, message: error.message });
      return;
    }
    console.error("Booking error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});



export const validateQRCode = asyncHandler(async (req: Request, res: Response) => {
  const { qrData, qrImageBase64 } = req.body;

  if (!qrData || typeof qrData !== "string") {
    res.status(400).json({
      valid: false,
      message: "QR code data is required and must be a string",
    });
    return;
  }

  const validationResult = await validateQRCodeService(qrData, qrImageBase64);

  if (!validationResult.valid) {
    res.status(404).json({  
      valid: false,
      message: validationResult.message || "Invalid QR code",
    });
    return;
  }

  res.status(200).json(validationResult);
});

export const getBookedEventsWithSeats = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({
      success: false,
      message: "User ID is required in the URL",
    });
    return;
  }

  const eventsWithSeats = await getBookedEventsWithSeatsService(userId);
  res.status(200).json({
    success: true,
    count: eventsWithSeats.length,
    events: eventsWithSeats
  });
});

export const getAllBookingsWithUserAndEvent = asyncHandler(async (_req: Request, res: Response) => {
  const allBookings = await getAllBookingsWithUserAndEventService();
  res.status(200).json({
    success: true,
    count: allBookings.length,
    bookings: allBookings
  });
});

export const deleteBooking = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  if (!bookingId) {
    res.status(400).json({ success: false, message: "Booking ID is required" });
    return;
  }

  try {
    const deletedBooking = await deleteBookingService(bookingId);
    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      booking: deletedBooking
    });
  } catch (error: any) {
    if (error.message === "Booking not found") {
      res.status(404).json({ success: false, message: error.message });
    } else {
      console.error("Error deleting booking:", error);
      res.status(500).json({
        success: false,
        message: "Unable to delete booking"
      });
    }
  }
});
