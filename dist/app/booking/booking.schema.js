"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BookingSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Event' },
    seatNumber: Number,
    qrCode: String,
    status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' }
});
exports.default = (0, mongoose_1.model)('Booking', BookingSchema);
