import React, { useContext } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  // Debug: log food_list and selected category
  console.log("Selected category:", category);
  console.log("food_list from backend:", food_list);

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {food_list.map((item) => {
  if (category === "All" || category === item.category) {
    return (
      <FoodItem
        key={item.food_id}
        id={item.food_id}
        image={item.food_image}
        name={item.food_name}
        desc={item.food_description}
        price={item.food_price}
      />
    );
  }
})}

      </div>
    </div>
  );
};

export default FoodDisplay;
