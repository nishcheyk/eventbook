"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = __importDefault(require("./users/user.route"));
const event_route_1 = __importDefault(require("./events/event.route"));
const booking_route_1 = __importDefault(require("./booking/booking.route"));
const router = (0, express_1.Router)();
router.use('/users', user_route_1.default);
router.use('/events', event_route_1.default);
router.use('/bookings', booking_route_1.default);
exports.default = router;
