import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true, 
      index: true,
    },

    transactions: [
      {
        resumeId: {
          type: String,
          required: true,
        },

        transactionId: {
          type: String,
          required: true,
        },

        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
