import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  totalSeats: number;
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  totalSeats: { type: Number, required: true },
});

const Event = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
export default Event;
