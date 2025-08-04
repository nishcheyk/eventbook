"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("./booking.controller");
const auth_middleware_1 = __importDefault(require("../common/middleware/auth.middleware")); // fix import path
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.default, booking_controller_1.bookTicket);
exports.default = router;
