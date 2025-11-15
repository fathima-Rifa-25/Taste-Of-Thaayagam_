// automatic JSX runtime - no top-level React import required
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import Add from "./pages/Add/Add";
import Dashboard from "./pages/Dashboard/Dashboard";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Reservation from "./pages/Reservation/Reservation";
import User from "./pages/User/User";
import Supplier from "./pages/Supplier/Supplier";
import MyAccount from "./pages/MyAccount/MyAccount";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div className="app">
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add" element={<Add />} />
          <Route path="/list" element={<List />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/user" element={<User />} />
          <Route path="/myaccount" element={<MyAccount />} />
          <Route path="/supplier" element={<Supplier />} />   {/* ✅ New */}
        </Routes>
      </div>
    </div>
  );
};

export default App;
