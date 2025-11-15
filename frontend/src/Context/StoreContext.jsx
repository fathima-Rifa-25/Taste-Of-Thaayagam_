import { createContext, useEffect, useState } from "react";
import { food_list, menu_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [ordersData, setOrdersData] = useState([]);
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);

  const url = "http://localhost:5001"; // backend base URL       /// changed by sara for fetching

  // Fetch food list from backend
  // When fetching from backend, normalize the food list
  useEffect(() => {
    fetch(`${url}/api/food/list`)
      .then((res) => res.json())
      .then((data) => {
        let formattedList = [];
        if (data.success && data.data) {
          formattedList = data.data;
        } else if (Array.isArray(data)) {
          formattedList = data;
        }

        // Normalize fields so both old and new names exist
        formattedList = formattedList.map((item) => ({
          ...item,
          food_id: item.food_id || item._id, // ensure unique id
          food_name: item.food_name || item.name,
          food_price: item.food_price || item.price,
          // Prefer fully-qualified imageUrl from backend; fallback to image filename
          food_image: item.imageUrl || item.food_image || item.image,
          food_description: item.food_description || item.description,
          category: item.category,
        }));

        setFoodList(formattedList);
      })
      .catch((err) => {
        console.error("Failed to fetch food list:", err);
      });
  }, []);

  const addToCart = (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
  };

  const deliveryCharge = 400; // LKR

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find(
          (product) => product._id === item || product.food_id === Number(item)
        );
        if (itemInfo) totalAmount += itemInfo.food_price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const loadCartData = ({ token }) => {
    console.log("Load cart for token:", token);
    // fetch cart from backend if needed
  };
  const fetchOrders = async (token) => {
    try {
      const res = await fetch(`${url}/api/order/userorders`, {
        method: "POST",
        headers: { token },
      });
      const data = await res.json();
      if (data.success) {
        setOrdersData(data.data.reverse()); // latest first
      } else {
        setOrdersData([]);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrdersData([]);
    }
  };

  const contextValue = {
    food_list,
    menu_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    deliveryCharge,
    url,
    token,
    setToken,
    loadCartData,
    setCartItems, // <-- expose this so PlaceOrder can clear cart
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
