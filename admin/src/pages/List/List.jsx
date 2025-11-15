// React default import not required with the automatic JSX runtime
import { useEffect, useState } from "react";
import "./List.css";
import { currency } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { FOOD_API } from "../../services/api";
import { FaEdit, FaTrash, FaSave, FaTimes, FaChartBar, FaDownload } from "react-icons/fa";
import { generateItemsPDF } from "../../services/pdf";
import { downloadItemsCSV } from "../../services/csv";
import { useI18n } from '../../i18n/context';

const List = () => {
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    category: "",
    price: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { t } = useI18n() || { t: (k) => k };

  // Fetch all food items
  const fetchList = async () => {
    try {
      const response = await axios.get(`${FOOD_API}/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Failed to fetch food list");
      }
    } catch (err) {
      toast.error("Network error while fetching list");
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (foodId) => {
    setDeleteId(foodId);
    setShowModal(true);
  };

  // Delete food item after confirmation
  const removeFood = async () => {
    try {
      const response = await axios.post(`${FOOD_API}/remove`, { id: deleteId });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error("Failed to delete item");
      }
    } catch (err) {
      toast.error("Network error while deleting item");
    } finally {
      setShowModal(false);
      setDeleteId(null);
    }
  };

  // Start editing
  const startEdit = (item) => {
    setEditingId(item._id);
    setEditData({
      name: item.name,
      category: item.category,
      price: item.price,
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: "", category: "", price: "" });
  };

  // Save changes
  const saveEdit = async (foodId) => {
    try {
      const response = await axios.post(`${FOOD_API}/update`, {
        _id: foodId,
        name: editData.name,
        category: editData.category,
        price: editData.price,
      });

      if (response.data.success) {
        toast.success("Food updated successfully");
        fetchList();
        cancelEdit();
      } else {
        toast.error(response.data.message || "Failed to update food");
      }
    } catch (err) {
      toast.error("Network error while updating food");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredList = list.filter(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || (item.category||'').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="page-container list-page">
      <div className="list add flex-col">
        <p className="list-title">{t('allFoods') || 'All Foods List'}</p>
        <div className="top-controls">
          <input
            type="text"
            placeholder={t('searchByNameCategory') || 'Search by name or category...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar-top"
          />
          <div className="right-buttons">
            <button className="top-btn" onClick={async () => { try { await generateItemsPDF(filteredList); toast.success('PDF report generated'); } catch (err) { console.error(err); toast.error('Failed to generate PDF'); } }}>
              <FaChartBar /> {t('generateReport') || 'Generate Report'}
            </button>
            <button className="top-btn" onClick={() => downloadItemsCSV(filteredList)}>
              <FaDownload /> {t('downloadCSV') || 'Download CSV'}
            </button>
          </div>
        </div>
        <div className="list-table">
          {/* Table header */}
          <div className="list-table-format title">
            <b>{t('image') || 'Image'}</b>
            <b>{t('name') || 'Name'}</b>
            <b>{t('category') || 'Category'}</b>
            <b>{t('price') || 'Price'}</b>
            <b>{t('action') || 'Action'}</b>
          </div>

          {/* Table rows */}
          {filteredList.map((item) => (  //listing items by category
            <div key={item._id} className="list-table-format">
              <img
                src={
                  item.image
                    ? `http://localhost:5001/images/${item.image}`
                    : "/placeholder.png"
                }
                alt={item.name}
              />

              {editingId === item._id ? (
                <>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    value={editData.price}
                    onChange={(e) =>
                      setEditData({ ...editData, price: e.target.value })
                    }
                  />
                  <div className="action-icons">
                    <FaSave
                      className="cursor edit-icon"
                      onClick={() => saveEdit(item._id)}
                    />
                    <FaTimes
                      className="cursor delete-icon"
                      onClick={cancelEdit}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p>{item.name}</p>
                  <p>{item.category}</p>
                  <p>
                    {currency}
                    {item.price}
                  </p>
                  <div className="action-icons">
                    <FaEdit
                      className="cursor edit-icon"
                      onClick={() => startEdit(item)}
                    />
                    <FaTrash
                      className="cursor delete-icon"
                      onClick={() => confirmDelete(item._id)}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
          {/* export buttons positioned below the table rows */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-start",
              marginTop: 12,
            }}
            className="export-actions"
          >
            <button
             
            >
              
            </button>
            <button
             
            >
              
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{t('deleteConfirmItem') || 'Are you sure you want to delete this item?'}</p>
            <div className="modal-actions">
              <button className="btn btn-confirm" onClick={removeFood}>
                {t('yes') || 'Yes'}
              </button>
              <button
                className="btn btn-cancel"
                onClick={() => setShowModal(false)}
              >
                {t('no') || 'No'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
