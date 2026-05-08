// models/paymentAttempt.model.js

import mongoose from "mongoose";

const ATTEMPT_STATUS = [
  "initiated",
  "success",
  "failed"
];

const paymentAttemptSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true
    },

    attemptNumber: {
      type: Number,
      required: true,
      min: 1
    },

    status: {
      type: String,
      enum: ATTEMPT_STATUS,
      required: true
    },

    requestPayload: {
      type: Object,
      default: null
    },

    responsePayload: {
      type: Object,
      default: null
    },

    errorMessage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    collection: "paymentAttempts"
  }
);

const PaymentAttempt = mongoose.model(
  "PaymentAttempt",
  paymentAttemptSchema
);

export default PaymentAttempt;