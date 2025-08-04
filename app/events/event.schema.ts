import mongoose, { Schema, Document } from "mongoose";

interface Seat {
  seatNumber: number;
  isBooked: boolean;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  totalSeats: number;
  seats: Seat[];
}

const SeatSchema = new Schema<Seat>({
  seatNumber: { type: Number, required: true },
  isBooked: { type: Boolean, default: false },
});

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  totalSeats: { type: Number, required: true },
  seats: { type: [SeatSchema], required: true, default: [] },
});

const Event =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
