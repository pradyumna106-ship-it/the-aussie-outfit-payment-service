// controllers/payment.controller.js

import Payment from "../models/payment.js"
import PaymentAttempt from "../models/paymentAttempt.js"
import razorpayInstance from "../config/razorpay.js";
export const processPayment = async (req, res) => {
  try {

    const {
      orderId,
      userId,
      paymentMethod,
      amount
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
    const transactionId = `TXN-${Date.now()}`;

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`
    });
    const payment = await Payment.create({
      orderId,
      userId,
      paymentMethod,
      transactionId,
      amount,
      status: "processing"
    });

    await PaymentAttempt.create({
      paymentId: payment._id,
      attemptNumber: 1,
      status: "success",
      requestPayload: req.body,
      responsePayload: {
        transactionId
      }
    });

    payment.status = "successful";
    payment.paidAt = new Date();

    await payment.save();

    return res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      data: payment
    });

  } catch (error) {

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
      razorpay_signature
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        razorpay_order_id + "|" + razorpay_payment_id
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

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

    await PaymentAttempt.create({
      paymentId: payment._id,
      attemptNumber: 2,
      status: "success",
      responsePayload: req.body
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: payment
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};