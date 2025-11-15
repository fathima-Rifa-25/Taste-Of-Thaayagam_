import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {

  const { cartItems, food_list, removeFromCart, getTotalCartAmount, deliveryCharge } = useContext(StoreContext);
  const navigate = useNavigate();

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p> <p>Title</p> <p>Price</p> <p>Quantity</p> <p>Total</p> <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          // Prefer MongoDB _id, fallback to food_id
          const itemId = item._id || item.food_id;

          if (cartItems[itemId] > 0) {
            return (
              <div key={index}>
                <div className="cart-items-title cart-items-item">
                  <img src={item.food_image} alt="" />
                  <p>{item.food_name}</p>
                  <p>LKR {item.food_price}</p>
                  <div>{cartItems[itemId]}</div>
                  <p>LKR {item.food_price * cartItems[itemId]}</p>
                  <p
                    className='cart-items-remove-icon'
                    onClick={() => removeFromCart(itemId)}
                  >
                    x
                  </p>
                </div>
                <hr />
              </div>
            )
          }
        })}

      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>LKR {getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>LKR {getTotalCartAmount() === 0 ? 0 : deliveryCharge}</p> 
              </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>LKR {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + deliveryCharge}</b>
            </div>
          </div>
          <button onClick={() => navigate('/placeorder')}>PROCEED TO CHECKOUT</button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            <div className='cart-promocode-input'>
              <input type="text" placeholder='promo code' />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart;
