// booking.controller.ts
import { Request, Response } from "express";
import Booking from "./booking.schema";
import Event from "../events/event.schema";
import { IEvent } from "../events/event.schema";
import { notificationQueue } from "../common/services/notification.service";
import QRCode from "qrcode";

export const bookTicket = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { eventId, seatNumber, phone, userId, email } = req.body;

    if (!userId || !email || !phone) {
      return res.status(400).json({
        message:
          "User info (userId, email, phone) required in request body for testing",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const seat = event.seats.find(
      (s: IEvent["seats"][0]) => s.seatNumber === seatNumber
    );
    if (!seat) return res.status(400).json({ message: "Seat number invalid" });
    if (seat.isBooked)
      return res.status(400).json({ message: "Seat already booked" });

    seat.isBooked = true;
    await event.save();

    const booking = new Booking({
      eventId,
      userId,
      seatNumber,
      status: "booked",
    });
    await booking.save();

    // qrContent is a string - booking id
    const qrContent = booking._id.toString();

    // Generate base64 QR code string for storing/display
    const qrCodeBase64 = await QRCode.toDataURL(qrContent, { width: 200 });

    booking.qrCode = qrCodeBase64;
    await booking.save();

    notificationQueue.add("sendNotification", {
      bookingId: booking._id,
      email,
      phone,
      subject: "Ticket Confirmation",
      message: `Your ticket for event "${event.title}" is confirmed. Seat number: ${seatNumber}.`,
      qrCode: qrContent, // Pass qrContent as string for later QR generation in email
    });

    return res.status(201).json({ booking, qrCode: qrCodeBase64 });
  } catch (error: unknown) {
    console.error("Booking error:", error);
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const validateQRCode = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { qrData, qrImageBase64 } = req.body;

  if (!qrData || typeof qrData !== "string") {
    return res.status(400).json({
      valid: false,
      message: "QR code data is required and must be a string",
    });
  }

  try {
    const booking = await Booking.findById(qrData);

    if (!booking) {
      return res.status(404).json({
        valid: false,
        message: "Booking not found for the provided QR code data",
      });
    }

    if (booking.status !== "booked") {
      return res.status(400).json({
        valid: false,
        message: `Ticket status is '${booking.status}', thus not valid for entry`,
      });
    }

    if (qrImageBase64 && qrImageBase64 !== booking.qrCode) {
      return res.status(400).json({
        valid: false,
        message: "QR code image does not match stored data",
      });
    }

    return res.status(200).json({
      valid: true,
      booking,
      message: "QR code validated successfully",
    });
  } catch (error) {
    console.error("QR validation error:", error);

    if (error instanceof Error) {
      return res.status(500).json({
        valid: false,
        message: `Internal server error: ${error.message}`,
      });
    }

    return res.status(500).json({
      valid: false,
      message: "Internal server error",
    });
  }
};
