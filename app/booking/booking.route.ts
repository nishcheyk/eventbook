import { Router } from "express";
import { bookTicket, validateQRCode } from "./booking.controller";

const router = Router();

// POST /bookings — book a ticket
router.post("/", bookTicket);

// POST /bookings/validate — validate QR code
router.post("/validate", validateQRCode);

export default router;
