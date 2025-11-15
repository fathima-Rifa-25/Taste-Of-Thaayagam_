import { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";
import { FaUsers, FaTruck, FaShoppingCart, FaMoneyBillWave } from "react-icons/fa";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [usersCount, setUsersCount] = useState(0);
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [ordersData, setOrdersData] = useState([]);
  const [suppliersData, setSuppliersData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, suppliersRes, ordersRes] = await Promise.all([
          axios.get("http://localhost:5001/api/users/list"),
          axios.get("http://localhost:5001/api/suppliers/list"),
          axios.get("http://localhost:5001/api/order/list"),
        ]);

        if (usersRes.data.success) setUsersCount(usersRes.data.data.length);
        if (suppliersRes.data.success) {
          setSuppliersCount(suppliersRes.data.data.length);
          setSuppliersData(suppliersRes.data.data);
        }
        if (ordersRes.data.success) {
          setOrdersCount(ordersRes.data.data.length);
          setOrdersData(ordersRes.data.data);
          const totalRevenue = ordersRes.data.data.reduce((sum, order) => sum + order.amount, 0);
          setRevenue(totalRevenue);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    fetchData();
  }, []);

  const lineChartData = {
    labels: ordersData.map(o => new Date(o.date).toLocaleDateString()),
    datasets: [
      {
        label: "Order Amount",
        data: ordersData.map(o => o.amount),
        borderColor: "#4e73df",
        backgroundColor: "rgba(78, 115, 223, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: { y: { beginAtZero: true } },
  };

  const activeSuppliers = suppliersData.filter(s => s.status === "Active").length;
  const inactiveSuppliers = suppliersData.filter(s => s.status === "Inactive").length;

  const doughnutData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [activeSuppliers, inactiveSuppliers],
        backgroundColor: ["#1cc88a", "#e74a3b"],
      },
    ],
  };

  const doughnutOptions = { responsive: true, plugins: { legend: { position: "bottom" } } };

  return (
    <div className="page-container">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* Four cards in a row below title */}
      <div className="cards">
        <div className="card light-blue">
          <div className="card-icon"><FaShoppingCart /></div>
          <div>
            <p className="card-label">Total Orders</p>
            <h2 className="card-number">{ordersCount}</h2>
          </div>
        </div>
        <div className="card light-green">
          <div className="card-icon"><FaMoneyBillWave /></div>
          <div>
            <p className="card-label">Total Revenue</p>
            <h2 className="card-number">LKR {revenue.toLocaleString()}</h2>
          </div>
        </div>
        <div className="card light-orange">
          <div className="card-icon"><FaUsers /></div>
          <div>
            <p className="card-label">Total Users</p>
            <h2 className="card-number">{usersCount}</h2>
          </div>
        </div>
        <div className="card light-purple">
          <div className="card-icon"><FaTruck /></div>
          <div>
            <p className="card-label">Total Suppliers</p>
            <h2 className="card-number">{suppliersCount}</h2>
          </div>
        </div>
      </div>

      {/* Charts below cards */}
      <div className="charts">
        <div className="line-chart">
          <h3>Orders Over Time</h3>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>

        <div className="pie-chart">
          <h3>Suppliers Status</h3>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
