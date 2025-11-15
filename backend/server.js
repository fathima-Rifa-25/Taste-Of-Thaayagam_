import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import 'dotenv/config';
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import supplierRouter from "./routes/supplierRoutes.js";
import reservationRouter from "./routes/reservationRoutes.js"; // <-- added
import menuRouter from "./routes/menuRoute.js";
import messageRouter from "./routes/messageRoute.js";
import testEmailRouter from "./routes/testEmailRoute.js";


const app = express();
const port = process.env.PORT || 5001;

// middlewares
app.use(express.json());
app.use(cors());

// db connection
connectDB();

// api endpoints
app.use("/api/users", userRouter);
app.use("/api/food", foodRouter);
app.use("/images", express.static('uploads'));
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/suppliers", supplierRouter); // supplier routes
app.use("/api/reservations", reservationRouter); // <-- reservation routes
app.use("/api/menu", menuRouter);
app.use("/api/messages", messageRouter);
app.use('/api/test-email', testEmailRouter);


app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
