import Reservation from "../models/Reservation.js";

// Add reservation
export const addReservation = async (req, res) => {
  try {
    const { name, email, phone, tableNumber, date, time, guests } = req.body;
    if (!name || !email || !phone || !tableNumber || !date || !time || !guests)
      return res.json({ success: false, message: "All fields required" });

    const newReservation = new Reservation({ name, email, phone, tableNumber, date, time, guests });
    await newReservation.save();
    res.json({ success: true, message: "Reservation added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error adding reservation" });
  }
};

// Get all reservations
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reservations });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching reservations" });
  }
};

// Update reservation
export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    await Reservation.findByIdAndUpdate(id, updateData);
    res.json({ success: true, message: "Reservation updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating reservation" });
  }
};

// Delete reservation
export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    await Reservation.findByIdAndDelete(id);
    res.json({ success: true, message: "Reservation deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error deleting reservation" });
  }
};
