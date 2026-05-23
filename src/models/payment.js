// models/payment.model.js

import mongoose from "mongoose";

const PAYMENT_METHODS = [
  "cash","razorpay"
];

const PAYMENT_STATUS = [
  "pending",
  "processing",
  "successful",
  "failed",
  "refunded"
];

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
      trim: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true
    },

    status: {
      type: String,
      enum: PAYMENT_STATUS,
      default: "pending",
      index: true
    },

    paidAt: {
      type: Date,
      default: null
    },

    gatewayResponse: {
      type: Object,
      default: null
    }
  },
  {
    timestamps: true,
    collection: "payments"
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;