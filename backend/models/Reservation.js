import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    tableNumber: { type: Number, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
  },
  { timestamps: true }
);

const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);
export default Reservation;
