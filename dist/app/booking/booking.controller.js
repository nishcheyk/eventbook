"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookTicket = void 0;
const booking_schema_1 = __importDefault(require("./booking.schema"));
const event_schema_1 = __importDefault(require("../events/event.schema"));
const qrcode_1 = __importDefault(require("qrcode"));
const notification_service_1 = require("../common/services/notification.service");
const bookTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.body;
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const event = yield event_schema_1.default.findById(eventId);
        if (!event)
            return res.status(404).json({ message: 'Event not found' });
        if (event.bookedSeats >= event.totalSeats)
            return res.status(400).json({ message: 'No seats available' });
        const seatNumber = event.bookedSeats + 1;
        const qrCode = yield qrcode_1.default.toDataURL(`${eventId}:${req.user.userId}:${seatNumber}`);
        event.bookedSeats++;
        yield event.save();
        const booking = yield booking_schema_1.default.create({
            eventId,
            userId: req.user.userId,
            seatNumber,
            qrCode,
            status: 'booked',
        });
        // Add the notification job with both email and phone
        notification_service_1.notificationQueue.add('sendNotification', {
            bookingId: booking._id,
            email: req.user.email, // User's email
            phone: req.user.phone, // User's phone number for SMS
            subject: 'Ticket Confirmation',
            message: `Your ticket for event "${event.title}" is confirmed. Seat number: ${seatNumber}.`,
            qrCode,
        });
        res.status(201).json({ booking, qrCode });
    }
    catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.bookTicket = bookTicket;
