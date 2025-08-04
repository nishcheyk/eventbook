import { Request, Response } from "express";
import { validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import {
  createEventService,
  listEventsService,
  getEventService,
} from "./event.service";


export const listEvents = asyncHandler(async (_req: Request, res: Response) => {
  const events = await listEventsService();
  res.json(events);
});


export const eventDetails = asyncHandler(async (req: Request, res: Response) => {
  const event = await getEventService(req.params.id);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  res.json(event);
});

export const createEventController = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const createdEvent = await createEventService(req.body);
  res.status(201).json({ message: "Event created", event: createdEvent });
});
