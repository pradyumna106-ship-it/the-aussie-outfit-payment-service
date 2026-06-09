# the-aussie-outfit-payment-service

## Overview

`the-aussie-outfit-payment-service` is a payment processing service designed to support the checkout flow for the Aussie Outfit ecommerce platform. Built with Node.js and Express, it handles payment requests, validates transactions, processes payments via Razorpay payment gateway, and manages payment state through MongoDB.

## Features

- **Payment Processing**: Accepts payment requests from the ecommerce frontend
- **Multiple Payment Methods**: Supports both Razorpay and cash payment methods
- **Transaction Validation**: Validates transaction payloads and payment integrity
- **Razorpay Integration**: Seamlessly integrates with Razorpay payment gateway
- **Payment Verification**: Verifies Razorpay payments using HMAC-SHA256 signature validation
- **Payment Status Tracking**: Tracks payment status through lifecycle (pending, processing, successful, failed, refunded, cancelled)
- **Payment Attempts Logging**: Records each payment attempt with request/response payloads for debugging and auditing
- **MongoDB Persistence**: Stores payment and payment attempt records in MongoDB
- **CORS Support**: Configurable CORS for frontend integration
- **Error Handling**: Comprehensive error handling and validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1
- **Database**: MongoDB with Mongoose v9.6.1
- **Payment Gateway**: Razorpay v2.9.6
- **Testing**: Vitest v4.1.4
- **Development**: Nodemon v3.1.14
- **Utilities**: CORS, dotenv, Multer, Crypto

## Project Structure

```
src/
├── index.js                 # Application entry point
├── app.js                   # Express app configuration
├── config/
│   ├── database.js         # MongoDB connection setup
│   ├── constant.js         # Constants (database name)
│   └── razorpay.js         # Razorpay client configuration
├── models/
│   ├── payment.js          # Payment schema and model
│   └── paymentAttempt.js   # Payment attempt schema and model
├── controller/
│   └── payment.js          # Payment request handlers
└── route/
    └── payment.js          # Payment endpoints
```

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/pradyumna106-ship-it/the-aussie-outfit-payment-service.git
   cd the-aussie-outfit-payment-service
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

## Configuration

Set up environment variables in a `.env` file:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/payment-service
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Usage

### Development

Start the service in development mode with auto-reload:

```sh
npm run dev
```

### Production

Start the service:

```sh
npm start
```

The service typically listens on the configured PORT and exposes payment endpoints for order processing.

## API Endpoints

### Process Payment
**POST** `/process`

Initiates a new payment transaction.

**Request Body:**
```json
{
  "orderId": "order_123",
  "userId": "user_456",
  "paymentMethod": "razorpay",
  "amount": 100,
  "currency": "INR"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": { ... },
  "razorpayOrder": { ... }
}
```

### Verify Payment
**POST** `/verify`

Verifies a completed payment with Razorpay signature validation.

**Request Body:**
```json
{
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature",
  "status": "success"
}
```

### Get Payment by Order ID
**GET** `/:orderId`

Retrieves all payments associated with an order.

### Update Payment Status
**PUT** `/:paymentId/status`

Updates the status of a payment record.

**Request Body:**
```json
{
  "status": "successful"
}
```

## Data Models

### Payment
Stores payment transaction records with fields for order ID, user ID, payment method, transaction ID, amount, currency, status, paid timestamp, and gateway response.

**Status Values**: `pending`, `processing`, `successful`, `failed`, `refunded`, `cancelled`

**Payment Methods**: `cash`, `razorpay`

### Payment Attempt
Records individual payment attempts with request/response payloads and attempt metadata.

**Attempt Status Values**: `initiated`, `success`, `failed`

## Testing

Run tests:

```sh
npm test
```

Run tests in watch mode:

```sh
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
