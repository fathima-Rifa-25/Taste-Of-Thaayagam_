// React default import not required with automatic JSX runtime
import { useEffect, useState } from "react";
import "./User.css";
import axios from "axios";
import { toast } from "react-toastify";
import { USER_API } from "../../services/api";
import { FaEdit, FaTrash, FaDownload, FaChartBar } from "react-icons/fa";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useI18n } from '../../i18n/context';

// Chart.js imports
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

// Register necessary chart elements (bar + pie)
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const User = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useI18n() || { t: (k) => k };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${USER_API}/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setUsers(res.data.data);
      else toast.error("Failed to fetch users");
    } catch {
      toast.error("Error fetching users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${USER_API}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("User added");
        fetchUsers();
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phone: "",
        });
        setShowAddForm(false);
      } else toast.error(res.data.message || "Failed to add user");
    } catch {
      toast.error("Error adding user");
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${USER_API}/${editUser._id}`, editUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("User updated");
        fetchUsers();
        setEditUser(null);
      } else toast.error(res.data.message || "Failed to update user");
    } catch {
      toast.error("Error updating user");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${USER_API}/${deleteUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("User deleted");
        fetchUsers();
        setDeleteUser(null);
      } else toast.error("Failed to delete user");
    } catch {
      toast.error("Error deleting user");
    }
  };

  const filteredUsers = users.filter((u) =>
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chart data - Users per first letter of name
  const getChartData = () => {
    if (!users || users.length === 0)
      return {
        labels: [],
        datasets: [{ label: "Users per First Letter", data: [], backgroundColor: "rgba(75,192,192,0.6)" }],
      };

    const letterCounts = users.reduce((acc, u) => {
      const letter = u.firstName?.[0]?.toUpperCase() || "Unknown";
      acc[letter] = (acc[letter] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(letterCounts),
      datasets: [
        {
          label: "Users per First Letter",
          data: Object.values(letterCounts),
          backgroundColor: "rgba(75,192,192,0.6)",
        },
      ],
    };
  };

  // (previously an option to open chart in a new window) removed to avoid unused variable lint

  // Create a Chart.js chart on an offscreen canvas and return a base64 image string
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

      // Wait a tick to ensure drawing finished
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

  // Generate PDF containing users table and charts (bar + pie)
  const handleGeneratePDF = async () => {
    if (!users || users.length === 0) {
      toast.error("No users to generate report");
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const title = "Users Report";
    doc.setFontSize(18);
    doc.text(title, 40, 40);

    // Prepare table columns and rows
    const head = [["First Name", "Last Name", "Email", "Phone"]];
    const body = users.map((u) => [u.firstName || "", u.lastName || "", u.email || "", u.phone || "-"]); 

    // Add table
    doc.autoTable({
      startY: 60,
      head,
      body,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
      theme: 'grid'
    });

    // Chart data for bar
    const barData = getChartData();

    // For pie chart, show distribution as percentages
    const pieData = {
      labels: barData.labels,
      datasets: [
        {
          data: barData.datasets[0].data,
          backgroundColor: barData.datasets[0].backgroundColor || [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'
          ],
        },
      ],
    };

    // Generate images
    const barImg = await createChartImage('bar', barData, {
      plugins: { title: { display: true, text: 'Users per First Letter' }, legend: { display: false } },
    });
    const pieImg = await createChartImage('pie', pieData, {
      plugins: { title: { display: true, text: 'Users Distribution (Pie)' }, legend: { position: 'right' } },
    });

    // Add images to PDF after the table. Use lastAutoTable finalY to place images.
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 80;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const maxWidth = pageWidth - margin * 2;

    if (barImg) {
      doc.addImage(barImg, 'PNG', margin, finalY, maxWidth, 180);
    }

    // If pie would overlap, add a new page
    const nextY = finalY + 190;
    if (pieImg) {
      if (nextY + 200 > doc.internal.pageSize.getHeight()) doc.addPage();
      const yPos = doc.lastAutoTable && doc.lastAutoTable.finalY && nextY + 0 > doc.internal.pageSize.getHeight() ? 40 : nextY;
      // place smaller pie image
      const pieWidth = 220;
      doc.addImage(pieImg, 'PNG', margin, yPos, pieWidth, 180);
    }

    doc.save('users_report.pdf');
    toast.success('PDF report generated');
  };

  const handleDownloadCSV = () => {
    if (!users || users.length === 0) {
      toast.error("No users to download");
      return;
    }
    const csv = Papa.unparse(
      users.map((u) => ({
        "First Name": u.firstName,
        "Last Name": u.lastName,
        Email: u.email,
        Phone: u.phone,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "users.csv";
    link.click();
    toast.success("CSV downloaded successfully!");
  };

  return (
    <div className="page-container user-page">
      <div className="list add flex-col">
        <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{t('allUsers')}</p>

        {/* Top controls */}
        <div className="top-controls">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar-top"
          />
          <div className="right-buttons">
            <button className="top-btn" onClick={() => setShowAddForm(!showAddForm)}>
              {t('addUser')}
            </button>
            <button className="top-btn" onClick={handleGeneratePDF}>
              <FaChartBar /> {t('generateReport')}
            </button>
            <button className="top-btn" onClick={handleDownloadCSV}>
              <FaDownload /> {t('downloadCSV')}
            </button>
          </div>
        </div>

        {/* Inline Add Form */}
        {showAddForm && (
          <div className="user-form horizontal-form">
            <input
              type="text"
              placeholder={t('firstName') || 'First Name'}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <input
              type="text"
              placeholder={t('lastName') || 'Last Name'}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
            <input
              type="email"
              placeholder={t('email') || 'Email'}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="password"
              placeholder={t('password') || 'Password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <input
              type="text"
              placeholder={t('phone') || 'Phone'}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <button className="add-user-btn" onClick={handleAdd}>{t('save') || 'Save'}</button>
          </div>
        )}

        {/* User Table */}
        <div className="list-table">
          <div className="list-table-format title">
            <b>{t('firstName')}</b>
            <b>{t('lastName')}</b>
            <b>{t('email')}</b>
            <b>{t('phone')}</b>
            <b>{t('action')}</b>
          </div>

          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <div key={u._id} className="list-table-format no-border">
                <p>{u.firstName}</p>
                <p>{u.lastName}</p>
                <p>{u.email}</p>
                <p>{u.phone || "-"}</p>
                <p className="cursor action-icons">
                  <span onClick={() => setEditUser(u)}><FaEdit className="action-icon" /></span>
                  <span onClick={() => setDeleteUser(u)}><FaTrash className="action-icon" /></span>
                </p>
              </div>
            ))
          ) : (
            <div className="list-table-format no-border"><p>{t('noUsers')}</p></div>
          )}
        </div>

        {/* Edit Modal */}
        {editUser && (
          <div className="modal-overlay">
            <div className="modal-content edit-modal">
              <h2>{t('update')} User</h2>
              <div className="edit-form-row">
                <label>{t('firstName')}:</label>
                <input value={editUser.firstName} onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })} />
              </div>
              <div className="edit-form-row">
                <label>{t('lastName')}:</label>
                <input value={editUser.lastName} onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })} />
              </div>
              <div className="edit-form-row">
                <label>{t('email')}:</label>
                <input value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
              </div>
              <div className="edit-form-row">
                <label>{t('phone')}:</label>
                <input value={editUser.phone || ""} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button className="save-btn" onClick={handleUpdate}>{t('update')}</button>
                <button className="cancel-btn" onClick={() => setEditUser(null)}>{t('cancel')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteUser && (
          <div className="modal-overlay">
            <div className="delete-modal-content">
              <p>{t('deleteConfirm')} <b>{deleteUser.firstName} {deleteUser.lastName}</b>?</p>
              <div className="delete-actions">
                <button className="save-btn large-btn" onClick={handleDelete}>{t('ok')}</button>
                <button className="cancel-btn large-btn" onClick={() => setDeleteUser(null)}>{t('cancel')}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default User;
