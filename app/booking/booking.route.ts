import { Router } from "express";
import { bookTicket, validateQRCode , getBookedEventsWithSeats } from "./booking.controller";

const router = Router();

// POST /bookings — book a ticket
router.post("/", bookTicket);

// POST /bookings/validate — validate QR code
router.post("/validate", validateQRCode);
// GET /bookings/events-with-seats/user/:userId
router.get("/events-with-seats/user/:userId", getBookedEventsWithSeats);

  
export default router;
