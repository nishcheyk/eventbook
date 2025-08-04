import Event from "./event.schema";
import { IEvent } from "./event.schema";

interface Seat {
  seatNumber: number;
  isBooked: boolean;
}

interface CreateEventDTO {
  title: string;
  description: string;
  date: Date | string;
  totalSeats: number;
}

export const createEventService = async (data: CreateEventDTO): Promise<IEvent> => {
  const { title, description, date, totalSeats } = data;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const eventExists = await Event.findOne({
    title,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (eventExists) {
    throw new Error("Event already exists on this date");
  }

  const seats: Seat[] = [];
  for (let i = 1; i <= totalSeats; i++) {
    seats.push({ seatNumber: i, isBooked: false });
  }

  const newEvent = new Event({
    title,
    description,
    date: new Date(date),
    totalSeats,
    seats,
  });

  await newEvent.save();

  return newEvent;
};

export const listEventsService = async (): Promise<IEvent[]> => {
  return Event.find().select("-__v");
};

export const getEventService = async (id: string): Promise<IEvent | null> => {
  return Event.findById(id).select("-__v").lean<IEvent>().exec();
};


