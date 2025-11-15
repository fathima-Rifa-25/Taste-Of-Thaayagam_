import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const currency = "usd";
const deliveryCharge = 5;
const frontend_URL = 'http://localhost:5000';/////sara did

// Place order with Stripe
const placeOrder = async (req, res) => {
    try {
        const items = req.body.items.map(item => ({
            name: item.name || item.foodName || "Unknown Item",
            price: item.price,
            quantity: item.quantity
        }));

        const newOrder = new orderModel({
            userId: req.user.id,
            items,
            amount: req.body.amount,
            address: req.body.address,
        });
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });

        const line_items = items.map(item => ({
            price_data: {
                currency,
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        line_items.push({
            price_data: {
                currency,
                product_data: { name: "Delivery Charge" },
                unit_amount: deliveryCharge * 100,
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Error" });
    }
};

// Place order with COD
const placeOrderCod = async (req, res) => {
    try {
        const items = req.body.items.map(item => ({
            name: item.name || item.foodName || "Unknown Item",
            price: item.price,
            quantity: item.quantity
        }));

        const newOrder = new orderModel({
            userId: req.user.id,
            items,
            amount: req.body.amount,
            address: req.body.address,
            payment: true,
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });

        res.json({ success: true, message: "Order Placed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Error" });
    }
};

// Admin - get all orders
const listOrders = async (req, res) => {
  try {
    // if using admin auth:
    // if (!req.user?.isAdmin) return res.status(403).json({ success: false, message: "Unauthorized" });

    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message || "Error" });
  }
};


// User orders
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.user.id });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Error" });
    }
};

// Update status
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Error" });
    }
};

// Verify payment
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Not Verified" });
    }
};

// DELETE order
const deleteOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        await orderModel.findByIdAndDelete(orderId);
        res.json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Error deleting order" });
    }
};

export { deleteOrderById };


export { placeOrder, placeOrderCod, listOrders, userOrders, updateStatus, verifyOrder };
