import React, { useContext, useMemo, useState } from "react";
import "./MiniCartButton.css";
import "./MiniCartDrawer.css";
import { StoreContext } from "../../Context/StoreContext";
import MiniCartDrawer from "./MiniCartDrawer";

const MiniCartButton = () => {
  const { cartItems, getTotalCartAmount } = useContext(StoreContext);
  const [open, setOpen] = useState(false);

  const itemCount = useMemo(() => {
    return Object.values(cartItems || {}).reduce(
      (s, v) => s + (v > 0 ? v : 0),
      0
    );
  }, [cartItems]);

  const total = getTotalCartAmount();

  return (
    <>
      <button className="mini-cart" onClick={() => setOpen(true)}>
        <div className="mini-cart-icon">🛒</div>
        <div className="mini-cart-body">
          <div className="mini-cart-count">{itemCount}</div>
          <div className="mini-cart-total">LKR {total || 0}</div>
        </div>
      </button>
      <MiniCartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default MiniCartButton;
