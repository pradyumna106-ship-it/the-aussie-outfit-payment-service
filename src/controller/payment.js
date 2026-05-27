// controllers/payment.controller.js

import Payment from "../models/payment.js"
import PaymentAttempt from "../models/paymentAttempt.js"
import razorpayInstance from "../config/razorpay.js";
import dotenv from "dotenv/config"
import { createHmac } from "crypto";
export const processPayment = async (req, res) => {
  try {

    const {
      orderId,
      userId,
      paymentMethod,
      amount,
      currency
    } = req.body;

    if (
      !orderId ||
      !userId ||
      !paymentMethod ||
      !amount
    ) {
      return res.status(400).json({
        success: false,
        message: "Required payment fields are missing"
      });
    }
    let razorpayOrder = null;
    if (paymentMethod === "razorpay") {
        razorpayOrder = await razorpayInstance.orders.create({
        amount: Number(amount) * 100,
        currency: req.body.currency || "INR",
        receipt: `receipt_${Date.now()}`
      });
    }

    const payment = await Payment.create({
      orderId,
      userId,
      paymentMethod,
      currency,
      transactionId: razorpayOrder ? razorpayOrder.id : null,
      amount,
      status: "processing"
    });

    await PaymentAttempt.create({
      paymentId: payment._id,
      attemptNumber: 1,
      status: "success",
      requestPayload: req.body,
      responsePayload: {
        transactionId:  razorpayOrder ? razorpayOrder.id : null,
      }
    });
    if (paymentMethod !== "razorpay") {
      payment.status = "successful";
      payment.paidAt = new Date();
    }

    await payment.save();

    return res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      data: payment,
      razorpayOrder
    });

  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPaymentByOrderId = async (req, res) => {
  try {

    const { orderId } = req.params;

    const payments = await Payment.find({
      orderId
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {

    const { paymentId } = req.params;

    const { status } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status
      },
      {
        new: true
      }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: payment
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const verifyPayment = async (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status
    } = req.body;

    // FAILED PAYMENT
    if (status === "failed") {

      const payment = await Payment.findOneAndUpdate(
        {
          transactionId: razorpay_order_id
        },
        {
          status: "failed"
        },
        {
          new: true
        }
      );

      return res.status(200).json({
        success: false,
        message: "Payment Failed",
        data: payment
      });
    }

    // CANCELLED PAYMENT
    if (status === "cancelled") {

      const payment = await Payment.findOneAndUpdate(
        {
          transactionId: razorpay_order_id
        },
        {
          status: "cancelled"
        },
        {
          new: true
        }
      );

      return res.status(200).json({
        success: false,
        message: "Payment Cancelled",
        data: payment
      });
    }

    // SUCCESS PAYMENT SIGNATURE VERIFY
    const generatedSignature = createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // UPDATE SUCCESS PAYMENT
    const payment = await Payment.findOneAndUpdate(
      {
        transactionId: razorpay_order_id
      },
      {

        status: "successful",

        paidAt: new Date(),

        gatewayResponse: {
          razorpay_payment_id,
          razorpay_signature
        }
      },
      {
        new: true
      }
    );

    if (!payment) {

      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: payment
    });

  } catch (error) {

    console.error(
      "Error verifying payment:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};