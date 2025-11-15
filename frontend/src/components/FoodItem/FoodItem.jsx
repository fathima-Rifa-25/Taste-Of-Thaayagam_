import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";

const FoodItem = ({ image, name, price, desc, id }) => {
  const { cartItems, addToCart, removeFromCart, url } =
    useContext(StoreContext);
  const navigate = useNavigate();

  return (
    <div className="food-item" data-food-id={id}>
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={
            image && (image.startsWith("http") || image.startsWith("https"))
              ? image
              : `${url}/images/${image}`
          }
          alt={name}
        />

        {!cartItems[id] ? (
          <img
            className="add"
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
            alt="Add to cart"
          />
        ) : (
          <div className="food-item-counter">
            <img
              src={assets.remove_icon_red}
              onClick={() => removeFromCart(id)}
              alt="Remove one"
            />
            <p>{cartItems[id]}</p>
            <img
              src={assets.add_icon_green}
              onClick={() => addToCart(id)}
              alt="Add one"
            />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="rating" />
        </div>
        <p className="food-item-desc">{desc}</p>
        <p className="food-item-price">LKR {price}</p>

        <button
          className={`view-cart-btn ${cartItems[id] ? "in-cart" : ""}`}
          onClick={() => navigate("/cart")}
        >
          {cartItems[id] ? "See Cart" : "View Cart"}
        </button>
      </div>
    </div>
  );
};

export default FoodItem;
