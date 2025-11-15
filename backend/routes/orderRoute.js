import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { listOrders, placeOrder, updateStatus, userOrders, verifyOrder, placeOrderCod, deleteOrderById } from '../controllers/orderController.js';


const orderRouter = express.Router();

// Admin fetch all orders (open, no token)
orderRouter.get("/list", listOrders);

// User fetch own orders
orderRouter.post("/userorders", authMiddleware, userOrders);

// Place order with Stripe
orderRouter.post("/place", authMiddleware, placeOrder);

// Place order COD
orderRouter.post("/placecod", authMiddleware, placeOrderCod);

// Update order status
orderRouter.post("/status", updateStatus);

// Verify payment
orderRouter.post("/verify", verifyOrder);

// DELETE order
orderRouter.delete("/delete/:orderId", deleteOrderById);


export default orderRouter;
