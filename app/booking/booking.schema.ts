import mongoose, { Schema, Document, model, models, ObjectId } from "mongoose";

export interface IBooking extends Document {
  userId: ObjectId; // reference to User
  eventId: ObjectId; // reference to Event
  seatNumbers: number[];
  seatCategories: ("diamond" | "premium" | "silver")[];

  // Buyer snapshot at booking time
  name: string;
  email: string;
  phone: string;

  // QR code data
  qrCode: string[];        // array of QR code images (base64)
  qrCodeContent: string[]; // array of text stored inside QR

  ticketNumber: string;
  status: "booked" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },

    seatNumbers: { type: [Number], required: true },
    seatCategories: {
      type: [String],
      enum: ["diamond", "premium", "silver"],
      required: true
    },

    // Store snapshots so admin view still works if user is deleted
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    qrCode: { type: [String] },
    qrCodeContent: { type: [String] },

    ticketNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked"
    }
  },
  { timestamps: true }
);

// Prevent same seat being booked twice for an event
BookingSchema.index({ eventId: 1, seatNumbers: 1 }, { unique: true });

// Avoid OverwriteModelError in dev/hot-reload
if (mongoose.models.Booking) {
  delete mongoose.models.Booking;
}

const Booking =
  models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
