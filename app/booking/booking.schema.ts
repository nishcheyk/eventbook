import mongoose, { Schema, Document, model, models, ObjectId } from "mongoose";

export interface IBooking extends Document {
  userId: ObjectId;
  eventId: ObjectId;
  seatNumber: number;
  seatCategory: "diamond" | "premium" | "silver"; // new field
  qrCode: string;
  status: string;
}

const BookingSchema = new Schema<IBooking>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  seatNumber: { type: Number, required: true },
  seatCategory: { type: String, enum: ["diamond", "premium", "silver"], required: true }, // new field
  qrCode: String,
  status: { type: String, enum: ["booked", "cancelled"], default: "booked" },
});

BookingSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });

if (mongoose.models.Booking) {
  delete mongoose.models.Booking;
}
const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);
export default Booking;
