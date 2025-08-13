import { Router } from "express";
import { bookTicket, validateQRCode,deleteBooking , getBookedEventsWithSeats,getAllBookingsWithUserAndEvent } from "./booking.controller";

// existing routes...



const router = Router();

// POST /bookings — book a ticket
router.post("/", bookTicket);

// POST /bookings/validate — validate QR code
router.post("/validate", validateQRCode);
// GET /bookings/events-with-seats/user/:userId
router.get("/events-with-seats/user/:userId", getBookedEventsWithSeats);

router.get("/admin/all-tickets", getAllBookingsWithUserAndEvent);
router.delete("/admin/booking/:bookingId", deleteBooking);
export default router;
