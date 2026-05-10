// routes/payment.routes.js

import express from "express";

import {
  processPayment,
  getPaymentByOrderId,
  updatePaymentStatus,
  verifyPayment
} from "../controller/payment.js";

const router = express.Router();

router.post("/process", processPayment);

router.post("/verify", verifyPayment);

router.get("/:orderId", getPaymentByOrderId);

router.put("/:paymentId/status", updatePaymentStatus);

export default router;