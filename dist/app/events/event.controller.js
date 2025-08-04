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
exports.createEvent = exports.eventDetails = exports.listEvents = void 0;
const event_schema_1 = __importDefault(require("./event.schema"));
const listEvents = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const events = yield event_schema_1.default.find();
    res.json(events);
});
exports.listEvents = listEvents;
const eventDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield event_schema_1.default.findById(req.params.id);
    if (!event)
        return res.status(404).json({ message: 'Event not found' });
    res.json(event);
});
exports.eventDetails = eventDetails;
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    const { title, description, date, totalSeats } = req.body;
    const eventExists = yield event_schema_1.default.findOne({ title, date });
    if (eventExists) {
        return res.status(400).json({ message: 'Event already exists' });
    }
    const event = new event_schema_1.default({
        title,
        description,
        date: new Date(date),
        totalSeats,
        bookedSeats: 0,
    });
    yield event.save();
    res.status(201).json({ message: 'Event created', event });
});
exports.createEvent = createEvent;
