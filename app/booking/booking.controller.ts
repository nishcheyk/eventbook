import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { bookTicketService, validateQRCodeService } from "./booking.service";
import { notificationQueue } from "../common/services/notification.service";

export const bookTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { eventId, seatNumber, phone, userId, email } = req.body;

  if (!userId || !email || !phone) {
    res.status(400).json({
      message: "User info (userId, email, phone) required in request body",
    });
    return;
  }

  const { booking, qrCodeBase64, qrContent, eventTitle } = await bookTicketService({
    eventId,
    seatNumber,
    userId,
  });

  notificationQueue.add("sendNotification", {
    bookingId: booking._id,
    email,
    phone,
    subject: "Ticket Confirmation",
    message: `Your ticket for event "${eventTitle}" is confirmed. Seat number: ${seatNumber}.`,
    qrCode: qrContent,
  });

  res.status(201).json({ booking, qrCode: qrCodeBase64 });
});

export const validateQRCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    res.status(validationResult.booking ? 400 : 404).json(validationResult);
    return;
  }

  res.status(200).json(validationResult);
});
