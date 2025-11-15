import React, { useContext, useMemo } from "react";
import "./TopPicks.css";
import { StoreContext } from "../../Context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { useNavigate } from "react-router-dom";

const TopPicks = ({
  limit = 6,
  compact = false,
  itemsPerRow = 6,
  rows = 2,
}) => {
  const { food_list, url } = useContext(StoreContext);

  const picks = useMemo(() => {
    if (!food_list || food_list.length === 0) return [];
    const max = itemsPerRow * rows; // show only first N items (rows x columns)
    return food_list.slice(0, max);
  }, [food_list, itemsPerRow, rows]);

  const navigate = useNavigate();

  if (!food_list || food_list.length === 0) {
    return (
      <div className="top-picks loading">
        <h2>Top Picks</h2>
        <p className="hint">Loading dishes...</p>
      </div>
    );
  }

  return (
    <div className={`top-picks${compact ? " compact" : ""}`} id="top-picks">
      <h2>Our Top Picks</h2>
      <div className="top-picks-grid">
        {picks.map((item, idx) => (
          <div
            key={item._id}
            className="top-pick-item"
            style={{ ["--i"]: idx }}
          >
            <FoodItem
              id={item._id}
              image={item.image || item.food_image}
              name={item.name || item.food_name}
              desc={item.description || item.food_description}
              price={item.price || item.food_price}
            />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button className="explore-more-btn" onClick={() => navigate("/menu")}>
          Explore more
        </button>
      </div>
      <p className="top-picks-note"></p>
    </div>
  );
};

export default TopPicks;
