import mongoose, { Schema, Document, model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  phone?: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  phone: { type: String },
});

// Force delete existing model to prevent OverwriteModelError
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = model<IUser>("User", UserSchema);

export default User;
