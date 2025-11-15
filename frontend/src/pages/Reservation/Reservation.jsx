import React, { useState, useContext } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import "./Reservation.css";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../Context/StoreContext";

const Reservation = () => {
  const { url } = useContext(StoreContext); // backend base URL

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tableNumber: "",
    date: "",
    time: "",
    guests: "1",
  });

  const handleChanges = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tableNumber) {
      toast.error("Please select a table number");
      return;
    }

    try {
      const res = await axios.post(`${url}/api/reservations`, formData);

      if (res.data.success) {
        toast.success("Reservation submitted!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          tableNumber: "",
          date: "",
          time: "",
          guests: "1",
        });
      } else {
        toast.error(res.data.message || "Failed to submit reservation");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error submitting reservation");
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
      const startHour = hour % 12 === 0 ? 12 : hour % 12;
      const startPeriod = hour < 12 ? "AM" : "PM";
      const endHour = (hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12;
      const endPeriod = hour + 1 < 12 ? "AM" : "PM";
      slots.push(`${startHour}:00 ${startPeriod} - ${endHour}:00 ${endPeriod}`);
    }
    return slots;
  };

  return (
    <div className="reservation-container">
      <div className="table-map">
        <h3>Pick Your Perfect Spot!</h3>
        <div className="tables-grid">
          {[...Array(9).keys()].map((tableIndex) => (
            <div key={tableIndex} className="table-wrapper">
              <div className="chair top"></div>
              <div className="table-with-side-chairs">
                <div className="chair left"></div>
                <div className="table-seat">T{tableIndex + 1}</div>
                <div className="chair right"></div>
              </div>
              <div className="chair bottom"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="reservation-content">
        <form className="reservation-form" onSubmit={handleSubmit}>
          <h2>Fill Out Your Details Below</h2>

          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChanges} placeholder="Full Name" required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChanges} placeholder="Email" required />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChanges} placeholder="Phone Number" required />
          </div>

          <div className="form-group">
            <label>Select Table Number</label>
            <select name="tableNumber" value={formData.tableNumber} onChange={handleChanges} required>
              <option value="">Select Table</option>
              {[...Array(9).keys()].map((num) => (
                <option key={num + 1} value={num + 1}>{num + 1}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Reservation Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChanges} required />
          </div>

          <div className="form-group">
            <label>Time of Reservation</label>
            <select name="time" value={formData.time} onChange={handleChanges} required>
              <option value="">Select Time</option>
              {generateTimeSlots().map((slot, index) => (
                <option key={index} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Number of Guests</label>
            <select name="guests" value={formData.guests} onChange={handleChanges}>
              {[...Array(10).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>{i + 1} Guest(s)</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-submit">Book Now</button>
        </form>
      </div>
    </div>
  );
};

export default Reservation;
