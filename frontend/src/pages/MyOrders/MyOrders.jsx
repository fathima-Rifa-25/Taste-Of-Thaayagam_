import { useContext, useEffect, useState, useCallback } from 'react';
import './MyOrders.css';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';

const MyOrders = () => {
    const [data, setData] = useState([]);
    const { url, token, currency } = useContext(StoreContext);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await axios.post(`${url}/api/order/userorders`, {}, { headers: { token } });
            console.log("Orders response:", response.data);
            if (response.data.success) {
                setData(response.data.data.reverse());
            } else {
                toast.error(response.data.message || "Error fetching orders");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Network error, try again");
        }
    }, [url, token]);

    useEffect(() => {
        if (token) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 5000); // refresh every 5s
            return () => clearInterval(interval);
        }
    }, [token, fetchOrders]);

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            {data.length === 0 ? (
                <p className="no-orders">No orders yet.</p>
            ) : (
                <div className="orders-table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Count</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((order) => (
                                <tr key={order._id || order.id || Math.random()}>
                                    <td className="mono">{order._id || order.id || '-'}</td>
                                    <td className="items-cell">{order.items.map((it, idx) => (
                                        <span key={idx} className="item-row">{it.name} x {it.quantity}{idx < order.items.length - 1 ? ', ' : ''}</span>
                                    ))}</td>
                                    <td>{currency}{Number(order.amount).toFixed(2)}</td>
                                    <td>{order.items.length}</td>
                                    <td><span className={`status ${order.status?.toLowerCase() || ''}`}>{order.status}</span></td>
                                    <td>{order.date ? new Date(order.date).toLocaleString() : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyOrders;



