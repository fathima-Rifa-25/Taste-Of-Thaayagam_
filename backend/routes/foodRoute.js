import express from 'express';
import multer from 'multer';
import { addFood, listFood, removeFood, updateFood } from '../controllers/foodController.js';

const foodRouter = express.Router();   // <-- DECLARE first

// Image storage setup
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// Routes
foodRouter.get("/list", listFood);
foodRouter.post("/add", upload.single('image'), addFood);
foodRouter.post("/remove", removeFood);
foodRouter.post("/update", updateFood);   // <-- use AFTER foodRouter is declared

export default foodRouter;
