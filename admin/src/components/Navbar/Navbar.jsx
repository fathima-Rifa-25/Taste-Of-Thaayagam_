import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { FaBell, FaEnvelope, FaMoon, FaSun } from 'react-icons/fa';
import { useI18n, availableLanguages } from '../../i18n/context';

const Navbar = () => {
  // Load dark mode from localStorage if available
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const { lang, setLang } = useI18n() || { lang: 'en', setLang: () => {} };

  const [messages, setMessages] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sync dark mode state with the body class and localStorage
useEffect(() => {
  if (darkMode) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
  localStorage.setItem("darkMode", darkMode.toString());
}, [darkMode]);

  // Get admin name from localStorage
  let adminName = 'Admin';
  try {
    const u = JSON.parse(localStorage.getItem('user')) || {};
    const first = u.firstName || (u.name ? u.name.split(' ')[0] : '');
    const last = u.lastName || (u.name ? u.name.split(' ').slice(1).join(' ') : '');
    adminName = (first || last) ? `${first} ${last}`.trim() : 'Admin';
  } catch (e) { console.error('Failed to parse user from localStorage', e); }

  // Fetch messages for admin
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const url = (window.__env__ && window.__env__.API_URL) || 'http://localhost:5001';
        const res = await axios.get(`${url}/api/messages`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data?.success) setMessages(res.data.data);
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };
    load();
  }, []);

  // Refresh messages when dropdown opens
  useEffect(() => {
    if (!showNotifications) return;
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const url = (window.__env__ && window.__env__.API_URL) || 'http://localhost:5001';
        const res = await axios.get(`${url}/api/messages`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data?.success) setMessages(res.data.data);
      } catch (err) { console.error('Failed to refresh messages', err); }
    };
    load();
  }, [showNotifications]);

  // Poll for new messages every 15s so the dot appears when new messages arrive
  useEffect(() => {
    let mounted = true;
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const url = (window.__env__ && window.__env__.API_URL) || 'http://localhost:5001';
        const res = await axios.get(`${url}/api/messages`, { headers: { Authorization: `Bearer ${token}` } });
        if (!mounted) return;
        if (res.data?.success) setMessages(res.data.data);
      } catch (err) {
        // ignore polling errors silently
      }
    }, 15000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <div className='navbar'>
      <div className="logo-wrapper">
        <img className="logo" src={assets.TOT_logo} alt="Logo" />
      </div>

      <div className="navbar-right">
        <div className="lang-select">
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            {availableLanguages.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="divider">|</div>

        <div className="icon-wrapper maroon-bg" title="Notifications" onClick={() => setShowNotifications(!showNotifications)}>
          <FaBell className="icon" />
          {messages.some(m => !m.read) && <span className="notification-dot"></span>}
        </div>

  {showNotifications && (
          <div className="notifications-dropdown">
            <div className="notifications-header"><strong>Messages</strong></div>
            <div className="notifications-list">
              {messages.length === 0 && <div className="notification-empty">No messages</div>}
              {messages.map((m) => (
                <div key={m._id} className={`notification-item ${m.read ? 'read' : 'unread'}`}>
                  <div className="notification-meta">
                    <div className="notification-sender">{m.name} &lt;{m.email}&gt;</div>
                    <div className="notification-time">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="notification-subject">{m.subject}</div>
                  <div className="notification-body">{m.message}</div>
                  <div className="notification-actions">
                    {!m.read && <button onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        if (!token) { toast.error('Not authenticated'); return; }
                        const url = (window.__env__ && window.__env__.API_URL) || 'http://localhost:5001';
                        const res = await axios.put(`${url}/api/messages/${m._id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
                        if (res.data?.success) {
                          // replace with server copy (has read=true)
                          setMessages((prev) => prev.map(x => x._id === m._id ? res.data.data : x));
                        } else {
                          toast.error(res.data?.message || 'Could not mark read');
                        }
                      } catch (err) { console.error(err); toast.error('Could not mark read'); }
                    }}>Mark read</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="icon-wrapper maroon-bg" title="Emails">
          <FaEnvelope className="icon" />
        </div>

        <div className="divider">|</div>

        {/* Toggle for Dark/Light mode */}
        <label className={`switch ${darkMode ? "dark" : "light"}`}>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <div className="slider-circle">
            {darkMode ? <FaSun /> : <FaMoon />}
          </div>
        </label>

        <div className="divider">|</div>

        <span className="greeting">Hello, {adminName}!</span>
        <img className='profile' src={assets.profile_image} alt={adminName} />
      </div>
    </div>
  );
};

export default Navbar;
