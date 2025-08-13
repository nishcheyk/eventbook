// booking.controller.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { bookTicketService, getAllBookingsWithUserAndEventService,  validateQRCodeService, deleteBookingService,getBookedEventsWithSeatsService  } from "./booking.service";
import { notificationQueue } from "../common/services/notification.service";

/**
 * Controller to handle booking creation.
 * Returns proper JSON with HTTP status codes even on errors for frontend consistency.
 */
export const bookTicket = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { eventId, seatNumber, seatCategory, phone, userId, email } = req.body;

    if (!userId || !email || !phone || !seatCategory) {
      res.status(400).json({
        success: false,
        message: "User info and seat category (seatCategory) required in request body",
      });
      return;
    }

    try {
      const { booking, qrCodeBase64, qrContent, eventTitle } =
        await bookTicketService({
          eventId,
          seatNumber,
          seatCategory,  // pass seatCategory here
          userId,
        });

      // Enqueue notification (email/SMS)
      notificationQueue.add("sendNotification", {
        bookingId: booking._id,
        email,
        phone,
        subject: "Ticket Confirmation",
        message: `Your ticket for event "${eventTitle}" is confirmed. Seat number: ${seatNumber}.`,
        qrCode: qrContent,
      });

      res.status(201).json({
        success: true,
        booking,
        qrCode: qrCodeBase64,
      });
    } catch (error: any) {
      if (error.message === "Seat already booked") {
        res.status(409).json({ success: false, message: error.message });
      } else if (
        error.message === "Event not found" ||
        error.message === "Seat number invalid" ||
        error.message === "Seat number out of range" ||
        error.message === "Invalid seat category"
      ) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        console.error("Booking error:", error);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
      }
    }
  }
);


/**
 * Controller to validate QR code tickets.
 * Returns validation status and messages.
 */
export const validateQRCode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { qrData, qrImageBase64 } = req.body;

      // Validate presence and type
      if (!qrData || typeof qrData !== "string") {
        res.status(400).json({
          valid: false,
          message: "QR code data is required and must be a string",
        });
        return;
      }

      // Call service
      const validationResult = await validateQRCodeService(qrData, qrImageBase64);

      // If the service marks it invalid
      if (!validationResult.valid) {
        res
          .status(validationResult.booking ? 400 : 404)
          .json({
            valid: false,
            message: validationResult.message || "Invalid QR code",
          });
        return;
      }

      // Valid QR code
      res.status(200).json(validationResult);

    } catch (err: any) {
      console.error("QR validation error:", err);

      // Catch-all for unexpected errors
      res.status(500).json({
        valid: false,
        message: "Internal server error while validating QR code",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);


/**
 * Controller — Get all events booked by a user with seat numbers.
 */
export const getBookedEventsWithSeats = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
  
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required in the URL"
      });
      return;
    }

    try {
      const eventsWithSeats = await getBookedEventsWithSeatsService(userId);

      res.status(200).json({
        success: true,
        count: eventsWithSeats.length,
        events: eventsWithSeats
      });
    } catch (error: any) {
      console.error("Error fetching booked events with seats:", error);
      res.status(500).json({
        success: false,
        message: "Unable to fetch booked event data"
      });
    }
  }
);



export const getAllBookingsWithUserAndEvent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const allBookings = await getAllBookingsWithUserAndEventService();
      res.status(200).json({
        success: true,
        count: allBookings.length,
        bookings: allBookings
      });
    } catch (error: any) {
      console.error("Error fetching all bookings:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Unable to fetch all bookings for admin"
      });
    }
  }
);

export const deleteBooking = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
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
  }
);
