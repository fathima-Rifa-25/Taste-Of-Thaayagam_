import express from "express";
import { 
  addReservation, 
  getReservations, 
  updateReservation, 
  deleteReservation 
} from "../controllers/reservationController.js";

const router = express.Router();

// CRUD routes
router.post("/", addReservation);
router.get("/list", getReservations);
router.put("/:id", updateReservation);
router.delete("/:id", deleteReservation);

export default router;
// fetching api