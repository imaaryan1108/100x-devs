import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const accountsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
  },
  balance: {
    type: Number,
  },
});

export const User = mongoose.model("User", userSchema);
export const Account = mongoose.model("Accounts", accountsSchema);
