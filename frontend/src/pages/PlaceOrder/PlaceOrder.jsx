import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const PlaceOrder = () => {
  const [payment, setPayment] = useState("cod");
  const [data, setData] = useState({
    firstName: "", lastName: "", email: "", street: "",
    city: "", state: "", zipcode: "", country: "", phone: ""
  });

  const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems } = useContext(StoreContext);
  const navigate = useNavigate();

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please sign in first");
      setTimeout(() => navigate("/cart"), 1200);
      return;
    }

    let orderItems = [];
    food_list.forEach(item => {
      const quantity = cartItems[item._id] || cartItems[item.food_id];
      if (quantity > 0) {
        orderItems.push({
          id: item._id || item.food_id,
          name: item.name,
          price: item.price,
          quantity
        });
      }
    });

    if (orderItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    let orderData = {
      address: data,
      items: orderItems,
      amount: (getTotalCartAmount() || 0) + 400, // add delivery fee
    };

    try {
      if (payment === "stripe") {
        const response = await axios.post(`${url}/api/order/place`, orderData, { headers: { token } });
        if (response.data.success && response.data.session_url) {
          // Redirect to Stripe checkout page
          window.location.href = response.data.session_url;
          return;
        } else {
          toast.error(response?.data?.message || "Stripe session failed");
        }
      } else {
        const response = await axios.post(`${url}/api/order/placecod`, orderData, { headers: { token } });
        if (response.data.success) {
          toast.success("Order placed successfully!");
          setCartItems({});
          localStorage.removeItem("cart");
          setTimeout(() => navigate("/myorders"), 1200);
        } else {
          toast.error(response?.data?.message || "Something went wrong");
        }
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || "Network error, try again");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/cart');
    }
  }, [token, navigate]);

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>
        <div className="multi-field">
          <input type="text" name='firstName' onChange={onChangeHandler} value={data.firstName} placeholder='First name' required />
          <input type="text" name='lastName' onChange={onChangeHandler} value={data.lastName} placeholder='Last name' required />
        </div>
        <input type="email" name='email' onChange={onChangeHandler} value={data.email} placeholder='Email address' required />
        <input type="text" name='street' onChange={onChangeHandler} value={data.street} placeholder='Street' required />
        <div className="multi-field">
          <input type="text" name='city' onChange={onChangeHandler} value={data.city} placeholder='City' required />
          <input type="text" name='state' onChange={onChangeHandler} value={data.state} placeholder='State' required />
        </div>
        <div className="multi-field">
          <input type="text" name='zipcode' onChange={onChangeHandler} value={data.zipcode} placeholder='Zip code' required />
          <input type="text" name='country' onChange={onChangeHandler} value={data.country} placeholder='Country' required />
        </div>
        <input type="text" name='phone' onChange={onChangeHandler} value={data.phone} placeholder='Phone' required />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details"><p>Subtotal</p><p>LKR {getTotalCartAmount() || 0}</p></div>
            <hr />
            <div className="cart-total-details"><p>Delivery Fee</p><p>LKR 400</p></div>
            <hr />
            <div className="cart-total-details"><b>Total</b><b>LKR {(getTotalCartAmount() || 0) + 400}</b></div>
          </div>
        </div>

        <div className="payment-options">
          <h2>Payment Method</h2>
          <div onClick={() => setPayment("cod")} className={`payment-option ${payment === "cod" ? 'selected' : ''}`}>
            <img src={payment === "cod" ? assets.checked : assets.un_checked} alt="" />
            <p>COD ( Cash on delivery )</p>
          </div>
          <div onClick={() => setPayment("stripe")} className={`payment-option ${payment === "stripe" ? 'selected' : ''}`}>
            <img src={payment === "stripe" ? assets.checked : assets.un_checked} alt="" />
            <p>Stripe ( Credit / Debit )</p>
          </div>
        </div>

        <button className='place-order-submit' type='submit'>
          {payment === "cod" ? "Place Order" : "Proceed To Payment"}
        </button>
      </div>
    </form>
  );
};

export default PlaceOrder;
