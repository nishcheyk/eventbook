import { Router } from "express";
import userRouter from "./users/user.route";
import eventRouter from "./events/event.route";
import bookingRouter from "./booking/booking.route";
import { bookTicket, validateQRCode } from "./booking/booking.controller";
const router = Router();
router.use("/users", userRouter);
router.use("/events", eventRouter);
router.use("/bookings", bookingRouter);

// POST /bookings/validate — validate QR code
router.post("/v", validateQRCode);
export default router;
