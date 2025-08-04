import Booking from "./booking.schema";
import Event from "../events/event.schema";
import { IEvent } from "../events/event.schema";
import QRCode from "qrcode";

export const bookTicketService = async (data: {
    eventId: string;
    seatNumber: string;
    userId: string;
  }) => {
    const { eventId, seatNumber, userId } = data;
  
    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");
  
    const seatNumberNum = Number(seatNumber);
    if (isNaN(seatNumberNum)) throw new Error("Seat number invalid");
  
    const seat = event.seats.find(
      (s: IEvent["seats"][0]) => s.seatNumber === seatNumberNum
    );
    if (!seat) throw new Error("Seat number invalid");
    if (seat.isBooked) throw new Error("Seat already booked");
  
    seat.isBooked = true;
    await event.save();
  
    const booking = new Booking({
      eventId,
      userId,
      seatNumber: seatNumberNum,
      status: "booked",
    });
    await booking.save();
  
    const qrContent = booking._id.toString();
    const qrCodeBase64 = await QRCode.toDataURL(qrContent, { width: 200 });
  
    booking.qrCode = qrCodeBase64;
    await booking.save();
  
    return { booking, qrCodeBase64, qrContent, eventTitle: event.title };
  };
  

export const validateQRCodeService = async (qrData: string, qrImageBase64?: string) => {
  const booking = await Booking.findById(qrData);

  if (!booking) {
    return { valid: false, message: "Booking not found for the provided QR code data" };
  }

  if (booking.status !== "booked") {
    return {
      valid: false,
      message: `Ticket status is '${booking.status}', thus not valid for entry`,
    };
  }

  if (qrImageBase64 && qrImageBase64 !== booking.qrCode) {
    return { valid: false, message: "QR code image does not match stored data" };
  }

  return { valid: true, booking, message: "QR code validated successfully" };
};
