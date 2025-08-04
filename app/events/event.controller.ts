import { Request, Response } from "express";
import Event from "./event.schema";
import { validationResult } from "express-validator";

export const listEvents = async (_: Request, res: Response) => {
  const events = await Event.find().select("-__v");
  res.json(events);
};

export const eventDetails = async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id).select("-__v");
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
};

export const createEvent = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { title, description, date, totalSeats } = req.body;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const eventExists = await Event.findOne({
    title,
    date: { $gte: startOfDay, $lte: endOfDay },
  });
  if (eventExists)
    return res
      .status(400)
      .json({ message: "Event already exists on this date" });

  const seats = [];
  for (let i = 1; i <= totalSeats; i++) {
    seats.push({ seatNumber: i, isBooked: false });
  }

  const event = new Event({
    title,
    description,
    date: new Date(date),
    totalSeats,
    seats,
  });
  await event.save();

  res.status(201).json({ message: "Event created", event });
};
