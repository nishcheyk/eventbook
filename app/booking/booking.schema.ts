// app/booking/booking.schema.ts
import mongoose, { Schema, Document, model, models, ObjectId } from "mongoose";

export interface IBooking extends Document {
  userId: ObjectId;
  eventId: ObjectId;
  seatNumber: number;
  qrCode: string;
  status: string;
}

const BookingSchema = new Schema<IBooking>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  eventId: { type: Schema.Types.ObjectId, ref: "Event" },
  seatNumber: Number,
  qrCode: String,
  status: { type: String, enum: ["booked", "cancelled"], default: "booked" },
});

if (mongoose.models.Booking) {
  delete mongoose.models.User;
}
const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);
export default Booking;
