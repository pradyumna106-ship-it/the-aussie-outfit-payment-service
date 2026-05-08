// routes/payment.routes.js

import express from "express";

import {
  processPayment,
  getPaymentByOrderId,
  updatePaymentStatus
} from "../controller/payment.js";

const router = express.Router();

router.post("/process", processPayment);

router.get("/:orderId", getPaymentByOrderId);

router.put("/:paymentId/status", updatePaymentStatus);

export default router;