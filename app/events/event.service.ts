import Event, { IEvent } from "./event.schema";
import Booking from "../booking/booking.schema";
import mongoose from "mongoose";

interface CreateEventDTO {
  title: string;
  description: string;
  date: Date | string;
  totalSeats: number;
  location: string;    
  imageUrl?: string;   
}

export interface EventDTO {
  title: string;
  description: string;
  date: string;
  totalSeats: number;
  bookedSeats: number[];
  location?: string;   
  imageUrl?: string;    
}


export const createEventService = async (data: CreateEventDTO): Promise<IEvent> => {
  const { title, description, date, totalSeats, location, imageUrl } = data;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const eventExists = await Event.findOne({
    title,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (eventExists) throw new Error("Event already exists on this date");

  const newEvent = new Event({
    title,
    description,
    date: new Date(date),
    totalSeats,
    location,        
    imageUrl,        
  });

  await newEvent.save();
  return newEvent;
};


export const listEventsService = async (): Promise<IEvent[]> => {
  const result = await Event.aggregate([
    {
      $lookup: {
        from: "bookings",
        let: { eventId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$eventId", "$$eventId"] },
              status: "booked",
            },
          },
          { $project: { _id: 0, seatNumber: 1 } },
        ],
        as: "bookings",
      },
    },
    {
      $addFields: {
        bookedSeats: {
          $map: {
            input: "$bookings",
            as: "b",
            in: "$$b.seatNumber",
          },
        },
      },
    },
    {
      $project: { bookings: 0, __v: 0 },
    },
    { $sort: { date: 1 } },
  ]);

  return result;
};


export const getEventService = async (
  id: string
): Promise<IEvent | null> => {
  const event = await Event.findById(id).select("-__v").lean<IEvent>().exec();
  if (!event) return null;

  const bookings = await Booking.find({
    eventId: id,
    status: "booked",
  })
    .select("seatNumber -_id")
    .lean();

  event.bookedSeats = bookings.map((b) => b.seatNumber);
  return event;
};
