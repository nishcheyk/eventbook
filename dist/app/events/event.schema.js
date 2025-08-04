"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const EventSchema = new mongoose_1.Schema({
    title: String,
    description: String,
    date: Date,
    totalSeats: Number,
    bookedSeats: { type: Number, default: 0 }
});
exports.default = (0, mongoose_1.model)('Event', EventSchema);
