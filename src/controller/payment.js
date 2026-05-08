// controllers/payment.controller.js

import Payment from "../models/payment.js"
import PaymentAttempt from "../models/paymentAttempt.js"

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