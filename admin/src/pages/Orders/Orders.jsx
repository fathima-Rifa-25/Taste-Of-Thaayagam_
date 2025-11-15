// React default import not required with automatic JSX runtime
import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/context';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets, currency } from '../../assets/assets';
import { FaTrash, FaChartBar, FaDownload } from 'react-icons/fa';
import { generateOrdersPDF } from '../../services/pdf';
import { downloadOrdersCSV } from '../../services/csv';

const url = "http://localhost:5001"; 

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, orderId: null });

    const fetchAllOrders = async () => {
        try {
            const response = await axios.get(`${url}/api/order/list`);
            if (response.data.success) setOrders(response.data.data.reverse());
            else toast.error(response.data.message || "Error fetching orders");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error fetching orders");
        }
    };

    const statusHandler = async (event, orderId) => {
        try {
            const response = await axios.post(`${url}/api/order/status`, {
                orderId,
                status: event.target.value
            });
            if (response.data.success) await fetchAllOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating status");
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

        const filteredOrders = orders.filter(order => {
                const name = `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.toLowerCase();
                const id = String(order._id || '').toLowerCase();
                const term = searchTerm.toLowerCase();
                return name.includes(term) || id.includes(term) || (order.items || []).some(i => (i.name||i.foodName||'').toLowerCase().includes(term));
        });

        const { t } = useI18n();

        return (
            <div className="page-container">
                <div className='order add'>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{t('ordersTitle')}</p>

                                <div className="top-controls">
                                    <input
                                        type="text"
                                        placeholder={t('ordersSearchPlaceholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-bar-top"
                                    />
                                    <div className="right-buttons">
                                        <button className="top-btn" onClick={async () => { try { await generateOrdersPDF(filteredOrders); toast.success(t('pdfReportGenerated')); } catch (err) { console.error(err); toast.error(t('pdfGenerateFailed')); } }}>
                                            <FaChartBar /> {t('generateReport')}
                                        </button>
                                        <button className="top-btn" onClick={() => downloadOrdersCSV(filteredOrders)}>
                                            <FaDownload /> {t('downloadCSV')}
                                        </button>
                                    </div>
                                </div>

                                <div className="order-list">
                                                                {filteredOrders.map((order, index) => (
                        <div key={index} className='order-item' style={{ position: 'relative' }}>
                            <FaTrash
                                className="action-icon"
                                onClick={() => setDeleteModal({ show: true, orderId: order._id })}
                                    style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    cursor: 'pointer',
                                    color: '#3b0000',
                                    fontSize: '18px',
                                }}
                            />

                            <img src={assets.parcel_icon} alt="" />
                            <div>
                                <p className='order-item-food'>
                                    {order.items.map((item, idx) => {
                                        const itemName = item.name || item.foodName || item.title || "Unknown Item";
                                        return idx === order.items.length - 1
                                            ? `${itemName} x ${item.quantity}`
                                            : `${itemName} x ${item.quantity}, `;
                                    })}
                                </p>

                                <p className='order-item-name'>
                                    {order.address?.firstName || ""} {order.address?.lastName || ""}
                                </p>

                                <div className='order-item-address'>
                                    <p>{order.address?.street},</p>
                                    <p>
                                        {order.address?.city}, {order.address?.state}, {order.address?.country}, {order.address?.zipcode}
                                    </p>
                                </div>

                                <p className='order-item-phone'>{order.address?.phone}</p>
                            </div>

                            <p>{t('items')} : {order.items.length}</p>
                            <p>{currency}{order.amount}</p>

                            <select onChange={(e) => statusHandler(e, order._id)} value={order.status}>
                                <option value="Food Processing">{t('statusFoodProcessing')}</option>
                                <option value="Out for delivery">{t('statusOutForDelivery')}</option>
                                <option value="Delivered">{t('statusDelivered')}</option>
                            </select>
                        </div>
                    ))}
                    {/* export actions moved to top-controls */}
                </div>
            </div>

            {/* DELETE MODAL */}
            {deleteModal.show && (
                <div className="modal-overlay">
                        <div className="modal-content">
                        <p>{t('ordersCancelConfirm')}</p>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setDeleteModal({ show: false, orderId: null })}>{t('cancel')}</button>
                            <button className="save-btn" onClick={async () => {
                                try {
                                    const response = await axios.delete(`${url}/api/order/delete/${deleteModal.orderId}`);
                                    if (response.data.success) {
                                        toast.success(t('orderDeletedSuccess'));
                                        await fetchAllOrders();
                                    } else {
                                        toast.error(response.data.message || t('orderDeleteFailed'));
                                    }
                                } catch (error) {
                                    console.error(error);
                                    toast.error(error.response?.data?.message || t('errorDeletingOrder'));
                                } finally {
                                    setDeleteModal({ show: false, orderId: null });
                                }
                            }}>{t('ok')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};

export default Orders;
