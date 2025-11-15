// React default import not required with automatic JSX runtime
import { useEffect, useState, useCallback } from "react";
import { useI18n } from '../../i18n/context';
import "./Reservation.css";
import axios from "axios";
import { toast } from "react-toastify";
import { RESERVATION_API } from "../../services/api";
import { FaEdit, FaTrash, FaDownload, FaChartBar } from "react-icons/fa";
import { generateReservationsPDF } from "../../services/pdf";
import { downloadReservationsCSV } from "../../services/csv";

const Reservation = () => {
  const [reservations, setReservations] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tableNumber: "",
    date: "",
    time: "",
    guests: "",
  });
  const [editReservation, setEditReservation] = useState(null);
  const [deleteReservation, setDeleteReservation] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const { t } = useI18n() || { t: (k) => k };

  // Fetch reservations (stable)
  const fetchReservations = useCallback(async () => {
    try {
      const res = await axios.get(`${RESERVATION_API}/list`);
      if (res.data.success) setReservations(res.data.data);
      else toast.error(t('reservationAddFailed') || "Failed to fetch reservations");
    } catch {
      toast.error(t('errorFetchingOrders') || "Error fetching reservations");
    }
  }, [t]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Add reservation
  const handleAdd = async () => {
    try {
      // POST to /api/reservations (router.post('/') in backend)
      const res = await axios.post(`${RESERVATION_API}`, formData);
      if (res.data.success) {
        toast.success(t('reservationAdded'));
        fetchReservations();
        setFormData({
          name: "",
          email: "",
          phone: "",
          tableNumber: "",
          date: "",
          time: "",
          guests: "",
        });
        setShowAddForm(false);
      } else toast.error(t('reservationAddFailed') || "Failed to add reservation");
    } catch {
      toast.error(t('errorAddingReservation') || "Error adding reservation");
    }
  };

  // Update reservation
  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        `${RESERVATION_API}/${editReservation._id}`,
        editReservation
      );
      if (res.data.success) {
        toast.success(t('reservationUpdated'));
        fetchReservations();
        setEditReservation(null);
      } else toast.error(t('reservationUpdateFailed') || "Failed to update reservation");
    } catch {
      toast.error(t('errorUpdatingReservation') || "Error updating reservation");
    }
  };

  // Delete reservation
  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${RESERVATION_API}/${deleteReservation._id}`
      );
      if (res.data.success) {
        toast.success(t('reservationDeleted'));
        fetchReservations();
        setDeleteReservation(null);
      } else toast.error("Failed to delete reservation");
    } catch {
      toast.error(t('errorDeletingReservation') || "Error deleting reservation");
    }
  };

  // Filter by name and date
  const filteredReservations = reservations.filter((r) => {
    const matchesName = r.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? (r.date ? r.date.toString().startsWith(filterDate) : false) : true;
    return matchesName && matchesDate;
  });

  return (
    <div className="page-container reservation-page">
      <div className="list add flex-col">
          <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
          {t('allReservations') || 'All Reservations'}
        </p>

        {/* Top Controls */}
        <div className="top-controls">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="date-filter"
            aria-label={t('filterByDate') || 'Filter by date'}
          />
          <input
            type="text"
            placeholder={t('searchPlaceholder') || 'Search by name...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar-top"
          />
          <div className="right-buttons">
            <button className="top-btn" onClick={() => setShowAddForm(!showAddForm)}>
              {t('addReservation') || '+ Add Reservation'}
            </button>
            <button
              className="top-btn"
              onClick={async () => {
                try {
                  await generateReservationsPDF(reservations);
                  toast.success(t('pdfReportGenerated'));
                } catch (err) {
                  console.error(err);
                  toast.error(t('pdfGenerateFailed'));
                }
              }}
            >
              <FaChartBar /> {t('generateReport') || 'Generate Report'}
            </button>
            <button
              className="top-btn"
              onClick={() => downloadReservationsCSV(reservations)}
            >
              <FaDownload /> {t('downloadCSV') || 'Download CSV'}
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="reservation-form horizontal-form">
              <input
              type="text"
              placeholder={t('fullName') || 'Full Name'}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="email"
              placeholder={t('emailPlaceholder') || 'Email'}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <input
              type="text"
              placeholder={t('phonePlaceholder') || 'Phone Number'}
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <input
              type="number"
              placeholder={t('tableNumberPlaceholder') || 'Table Number'}
              value={formData.tableNumber}
              onChange={(e) =>
                setFormData({ ...formData, tableNumber: e.target.value })
              }
            />
            <input
              type="date"
              placeholder={t('reservationDatePlaceholder') || 'Reservation Date'}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <input
              type="time"
              placeholder={t('timePlaceholder') || 'Time'}
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
            <input
              type="number"
              placeholder={t('guestsPlaceholder') || 'Guests'}
              value={formData.guests}
              onChange={(e) =>
                setFormData({ ...formData, guests: e.target.value })
              }
            />
            <button className="add-reservation-btn" onClick={handleAdd}>
              {t('save') || 'Save'}
            </button>
          </div>
        )}

        {/* Reservation Table */}
        <div className="list-table">
          <div className="list-table-format title">
            <b>{t('headerName') || 'Name'}</b>
            <b>{t('email') || 'Email'}</b>
            <b>{t('phone') || 'Phone'}</b>
            <b>{t('tableNumberPlaceholder') || 'Table'}</b>
            <b>{t('reservationDatePlaceholder') || 'Date'}</b>
            <b>{t('timePlaceholder') || 'Time'}</b>
            <b>{t('guestsPlaceholder') || 'Guests'}</b>
            <b>{t('headerAction') || 'Action'}</b>
          </div>

          {filteredReservations.length > 0 ? (
            filteredReservations.map((r) => (
              <div key={r._id} className="list-table-format no-border">
                <p>{r.name}</p>
                <p>{r.email}</p>
                <p>{r.phone}</p>
                <p>{r.tableNumber}</p>
                <p>{r.date}</p>
                <p>{r.time}</p>
                <p>{r.guests}</p>
                <p className="cursor action-icons">
                  <span onClick={() => setEditReservation(r)}>
                    <FaEdit className="action-icon" />
                  </span>
                  <span onClick={() => setDeleteReservation(r)}>
                    <FaTrash className="action-icon" />
                  </span>
                </p>
              </div>
            ))
          ) : (
            <div className="list-table-format no-border">
              <p>{t('noReservationsFound') || 'No reservations found'}</p>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editReservation && (
          <div className="modal-overlay">
            <div className="modal-content edit-modal">
              <h2>{t('editReservationTitle') || 'Edit Reservation'}</h2>
              <div className="edit-form-row">
                <label>{t('headerName') || 'Name'}:</label>
                <input
                  value={editReservation.name}
                  onChange={(e) =>
                    setEditReservation({
                      ...editReservation,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="edit-form-row">
                <label>{t('email') || 'Email'}:</label>
                <input
                  value={editReservation.email}
                  onChange={(e) =>
                    setEditReservation({
                      ...editReservation,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="edit-form-row">
                <label>{t('phone') || 'Phone'}:</label>
                <input
                  value={editReservation.phone}
                  onChange={(e) =>
                    setEditReservation({
                      ...editReservation,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="edit-form-row">
                <label>{t('tableNumberPlaceholder') || 'Table'}:</label>
                <input
                  type="number"
                  value={editReservation.tableNumber}
                  onChange={(e) =>
                    setEditReservation({
                      ...editReservation,
                      tableNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div className="edit-form-row">
                <label>{t('reservationDatePlaceholder') || 'Date'}:</label>
                <input
                  type="date"
                  value={editReservation.date}
                  onChange={(e) =>
                    setEditReservation({
                      ...editReservation,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <div className="edit-form-row">
                <label>{t('timePlaceholder') || 'Time'}:</label>
                <input
                  type="time"
                  value={editReservation.time}
                  onChange={(e) =>
                    setEditReservation({
                      ...editReservation,
                      time: e.target.value,
                    })
                  }
                />
              </div>
              <div className="edit-form-row">
                <label>{t('guestsPlaceholder') || 'Guests'}:</label>
                <input
                  type="number"
                  value={editReservation.guests}
                  onChange={(e) =>
                    setEditReservation({
                      ...editReservation,
                      guests: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-actions">
                <button className="save-btn" onClick={handleUpdate}>
                  {t('update') || 'Update'}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setEditReservation(null)}
                >
                  {t('cancel') || 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteReservation && (
          <div className="modal-overlay">
            <div className="delete-modal-content">
              <p>
                {t('deleteConfirm') || 'Are you sure you want to delete'}{" "}
                <b>{deleteReservation.name}</b>?
              </p>
              <div className="delete-actions">
                <button className="save-btn large-btn" onClick={handleDelete}>
                  {t('ok') || 'OK'}
                </button>
                <button
                  className="cancel-btn large-btn"
                  onClick={() => setDeleteReservation(null)}
                >
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

export default Reservation;
