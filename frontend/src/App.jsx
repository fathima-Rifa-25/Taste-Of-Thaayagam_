import React, { useState } from "react";
import Home from "./pages/Home/Home";
import Menu from "./pages/Menu/Menu";
import About from "./pages/About/About";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import { Route, Routes } from "react-router-dom";
import Cart from "./pages/Cart/Cart";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import MyOrders from "./pages/MyOrders/MyOrders";
import MyAccount from "./pages/MyAccount/MyAccount";
import Reservation from "./pages/Reservation/Reservation";
import Verify from "./pages/Verify/Verify";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}

      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/placeorder" element={<PlaceOrder />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/myaccount" element={<MyAccount />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reservation" element={<Reservation />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
