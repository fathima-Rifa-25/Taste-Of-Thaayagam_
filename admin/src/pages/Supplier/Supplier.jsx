// React default import not required with automatic JSX runtime
import { useEffect, useState, useCallback } from "react";
import { useI18n } from '../../i18n/context';
import "./Supplier.css";
import axios from "axios";
import { toast } from "react-toastify";
import { SUPPLIER_API } from "../../services/api";
import { FaEdit, FaTrash, FaDownload, FaChartBar } from "react-icons/fa";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Chart.js imports
// Bar chart component not used directly here
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register ChartJS components (include ArcElement for pie charts)
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Supplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    contact: "",
    itemName: "",
    qty: "",
    status: "Active",
  });
  const [editSupplier, setEditSupplier] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteSupplier, setDeleteSupplier] = useState(null);
  const { t } = useI18n() || { t: (k) => k };

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await axios.get(`${SUPPLIER_API}/list`);
      if (res.data.success) setSuppliers(res.data.data);
      else toast.error(t('supplierAddFailed') || "Failed to fetch suppliers");
    } catch {
      toast.error(t('errorFetchingOrders') || "Error fetching suppliers");
    }
  }, [t]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleAdd = async () => {
    try {
      const res = await axios.post(`${SUPPLIER_API}`, formData);
      if (res.data.success) {
        toast.success(t('supplierAdded'));
        fetchSuppliers();
        setFormData({
          name: "",
          location: "",
          contact: "",
          itemName: "",
          qty: "",
          status: "Active",
        });
        setShowAddForm(false);
      } else toast.error(res.data.message || t('supplierAddFailed'));
    } catch {
      toast.error(t('errorAddingSupplier') || "Error adding supplier");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`${SUPPLIER_API}/${editSupplier._id}`, editSupplier);
      if (res.data.success) {
        toast.success(t('supplierUpdated'));
        fetchSuppliers();
        setEditSupplier(null);
      } else toast.error(res.data.message || t('supplierUpdateFailed'));
    } catch {
      toast.error(t('errorUpdatingSupplier') || "Error updating supplier");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`${SUPPLIER_API}/${deleteSupplier._id}`);
      if (res.data.success) {
        toast.success(t('supplierDeleted'));
        fetchSuppliers();
        setDeleteSupplier(null);
      } else toast.error(t('supplierDeleteFailed') || "Failed to delete supplier");
    } catch {
      toast.error(t('errorDeletingSupplier') || "Error deleting supplier");
    }
  };

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChartData = () => {
    if (!suppliers || suppliers.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: t('suppliersPerLocation') || "Suppliers per Location",
            data: [],
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      };
    }

    const locationCounts = suppliers.reduce((acc, s) => {
      acc[s.location] = (acc[s.location] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(locationCounts),
      datasets: [
        {
          label: "Suppliers per Location",
          data: Object.values(locationCounts),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  };

  // helper to create offscreen chart and return base64 image
  const createChartImage = (type, data, options = {}, width = 800, height = 400) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.style.position = "fixed";
      canvas.style.left = "-9999px";
      document.body.appendChild(canvas);

      const ctx = canvas.getContext("2d");
      const chart = new ChartJS(ctx, {
        type,
        data,
        options: { animation: false, ...options },
      });

      setTimeout(() => {
        try {
          const img = chart.toBase64Image();
          chart.destroy();
          document.body.removeChild(canvas);
          resolve(img);
        } catch (err) {
          chart.destroy();
          document.body.removeChild(canvas);
          resolve(null);
        }
      }, 50);
    });
  };

  // Generate PDF containing suppliers table and charts (bar + pie)
  const handleGeneratePDF = async () => {
    if (!suppliers || suppliers.length === 0) {
      toast.error("No suppliers to generate report");
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const title = t('suppliersReportTitle') || "Suppliers Report";
    doc.setFontSize(18);
    doc.text(title, 40, 40);

    const head = [[t('headerName')||"Name", t('headerLocation')||"Location", t('headerContact')||"Contact", t('headerItem')||"Item", t('headerQty')||"Qty", t('headerStatus')||"Status"]];
    const body = suppliers.map((s) => [s.name || "", s.location || "", s.contact || "", s.itemName || "", s.qty || "", s.status || ""]);

    doc.autoTable({
      startY: 60,
      head,
      body,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
      theme: 'grid'
    });

    const barData = getChartData();
    const pieData = { labels: barData.labels, datasets: [{ data: barData.datasets[0].data, backgroundColor: barData.datasets[0].backgroundColor || ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'] }] };

    const barImg = await createChartImage('bar', barData, { plugins: { title: { display: true, text: t('suppliersPerLocation') || 'Suppliers per Location' }, legend: { display: false } } });
    const pieImg = await createChartImage('pie', pieData, { plugins: { title: { display: true, text: t('suppliersDistributionPie') || 'Suppliers Distribution (Pie)' }, legend: { position: 'right' } } });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 80;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const maxWidth = pageWidth - margin * 2;

    if (barImg) {
      doc.addImage(barImg, 'PNG', margin, finalY, maxWidth, 180);
    }

    const nextY = finalY + 190;
    if (pieImg) {
      if (nextY + 200 > doc.internal.pageSize.getHeight()) doc.addPage();
      const yPos = nextY;
      const pieWidth = 220;
      doc.addImage(pieImg, 'PNG', margin, yPos, pieWidth, 180);
    }

    doc.save('suppliers_report.pdf');
    toast.success(t('pdfReportGenerated'));
  };

  const handleDownloadCSV = () => {
    if (!suppliers || suppliers.length === 0) {
      toast.error(t('noSuppliersToDownload') || "No suppliers to download");
      return;
    }
    const csv = Papa.unparse(
      suppliers.map((s) => ({
        Name: s.name,
        Location: s.location,
        Contact: s.contact,
        Item: s.itemName,
        Quantity: s.qty,
        Status: s.status,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "suppliers.csv";
    link.click();
    toast.success(t('csvDownloaded') || "CSV downloaded successfully!");
  };

  return (
    <div className="page-container supplier-page">
      <div className="list add flex-col">
        <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{t('allSuppliers') || 'All Supplier List'}</p>

{/* Top controls */}
<div classname="supplier-page">
<div className="top-controls">
  <input
    type="text"
    placeholder={t('searchPlaceholder') || 'Search by name...'}
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="search-bar-top"
  />
  <div className="right-buttons">
    <button className="top-btn" onClick={() => setShowAddForm(!showAddForm)}>
      {t('addSupplier') || '+ Add Supplier'}
    </button>
    <button className="top-btn" onClick={handleGeneratePDF}>
      <FaChartBar /> {t('generateReport') || 'Generate Report'}
    </button>
    <button className="top-btn" onClick={handleDownloadCSV}>
      <FaDownload /> {t('downloadCSV') || 'Download CSV'}
    </button>
  </div>
</div>

{/* Inline Add Form */}
{showAddForm && (
  <div className="supplier-form horizontal-form">
    <input
      type="text"
      placeholder={t('placeholderName') || 'Name'}
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    />
    <input
      type="text"
      placeholder={t('placeholderLocation') || 'Location'}
      value={formData.location}
      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
    />
    <input
      type="text"
      placeholder={t('placeholderContact') || 'Contact'}
      value={formData.contact}
      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
    />
    <input
      type="text"
      placeholder={t('placeholderItemName') || 'Item Name'}
      value={formData.itemName}
      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
    />
    <input
      type="text"
      placeholder={t('placeholderQuantity') || 'Quantity'}
      value={formData.qty}
      onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
    />
    <select
      value={formData.status}
      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
    >
      <option value="Active">{t('statusActive') || 'Active'}</option>
      <option value="Inactive">{t('statusInactive') || 'Inactive'}</option>
    </select>
    <button className="add-supplier-btn" onClick={handleAdd}>
      {t('save') || 'Save'}
    </button>
  </div>
)}


        {/* Supplier Table */}
      <div className="table-container">
        <div className="list-table">
          <div className="list-table-format title">
            <b>{t('headerName') || 'Name'}</b>
            <b>{t('headerLocation') || 'Location'}</b>
            <b>{t('headerContact') || 'Contact'}</b>
            <b>{t('headerItem') || 'Item'}</b>
            <b>{t('headerQty') || 'Qty'}</b>
            <b>{t('headerStatus') || 'Status'}</b>
            <b>{t('headerAction') || 'Action'}</b>
          </div>
      
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map((s) => (
              <div key={s._id} className="list-table-format no-border">
                <p>{s.name}</p>
                <p>{s.location}</p>
                <p>{s.contact}</p>
                <p>{s.itemName}</p>
                <p>{s.qty}</p>
                <p>
                  <span
                    className={`status-indicator ${
                      s.status === "Active" ? "active" : "inactive"
                    }`}
                  ></span>
                  {s.status}
                </p>
                <p className="cursor action-icons">
                  <span onClick={() => setEditSupplier(s)}>
                    <FaEdit className="action-icon" />
                  </span>
                  <span onClick={() => setDeleteSupplier(s)}>
                    <FaTrash className="action-icon" />
                  </span>
                </p>
              </div>
            ))
          ) : (
            <div className="list-table-format no-border">
              <p>{t('noSuppliersFound') || 'No suppliers found'}</p>
            </div>
          )}
        </div>
      </div>
</div>
      
        {/* Edit Modal */}
        {editSupplier && (
          <div className="modal-overlay">
            <div className="modal-content edit-modal">
              <h2>{t('editSupplierTitle') || 'Edit Supplier'}</h2>
              <div className="edit-form-row">
                <label>{t('headerName') || 'Name'}:</label>
                <input
                  value={editSupplier.name}
                  onChange={(e) => setEditSupplier({ ...editSupplier, name: e.target.value })}
                />
              </div>
              <div className="edit-form-row">
                <label>{t('headerLocation') || 'Location'}:</label>
                <input
                  value={editSupplier.location}
                  onChange={(e) => setEditSupplier({ ...editSupplier, location: e.target.value })}
                />
              </div>
              <div className="edit-form-row">
                <label>{t('headerContact') || 'Contact'}:</label>
                <input
                  value={editSupplier.contact}
                  onChange={(e) => setEditSupplier({ ...editSupplier, contact: e.target.value })}
                />
              </div>
              
              <div className="edit-form-row">
                <label>{t('headerItem') || 'Item Name'}:</label>
                <input
                  value={editSupplier.itemName}
                  onChange={(e) => setEditSupplier({ ...editSupplier, itemName: e.target.value })}
                />
              </div>
              <div className="edit-form-row">
                <label>{t('headerQty') || 'Quantity'}:</label>
                <input
                  value={editSupplier.qty}
                  onChange={(e) => setEditSupplier({ ...editSupplier, qty: e.target.value })}
                />
              </div>
              <div className="edit-form-row">
                <label>{t('headerStatus') || 'Status'}:</label>
                <select
                  value={editSupplier.status}
                  onChange={(e) => setEditSupplier({ ...editSupplier, status: e.target.value })}
                >
                  <option value="Active">{t('statusActive') || 'Active'}</option>
                  <option value="Inactive">{t('statusInactive') || 'Inactive'}</option>
                </select>
              </div>

              <div className="modal-actions">
                <button className="save-btn" onClick={handleUpdate}>
                  {t('update') || 'Update'}
                </button>
                <button className="cancel-btn" onClick={() => setEditSupplier(null)}>
                  {t('cancel') || 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteSupplier && (
          <div className="modal-overlay">
            <div className="delete-modal-content">
              <p>
                {t('deleteConfirm') || 'Are you sure you want to delete'} <b>{deleteSupplier.name}</b>?
              </p>
               <div className="delete-actions">
                <button className="save-btn large-btn" onClick={handleDelete}>
                  {t('ok') || 'OK'}
                </button>
                <button className="cancel-btn large-btn" onClick={() => setDeleteSupplier(null)}>
                  {t('cancel') || 'Cancel'}
                </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Supplier;
