"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("./event.controller");
const auth_middleware_1 = __importDefault(require("../common/middleware/auth.middleware")); // Adjust path
const admin_middleware_1 = __importDefault(require("../common/middleware/admin.middleware")); // Middleware to check admin access
const router = (0, express_1.Router)();
router.get('/', event_controller_1.listEvents);
router.get('/:id', event_controller_1.eventDetails);
// Admin-only route to create event
router.post('/', auth_middleware_1.default, admin_middleware_1.default, event_controller_1.createEvent);
exports.default = router;
