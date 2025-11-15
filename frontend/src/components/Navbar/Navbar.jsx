import { useContext, useState, useEffect, useRef, useCallback } from "react";
import PropTypes from 'prop-types';
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const { getTotalCartAmount, token, setToken, food_list } =
    useContext(StoreContext);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchBoxRef = useRef(null);
  const navigate = useNavigate();

  // Update isMobile on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    navigate("/");
  };

  // Profile dropdown state and refs
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Toggle profile dropdown when avatar is clicked
  const toggleProfile = useCallback(() => {
    setProfileOpen((v) => !v);
  }, []);

  // Close profile on outside click or Escape key
  useEffect(() => {
    if (!profileOpen) return;
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  // Filtered list (limit 10)
  const filtered = (food_list || [])
    .filter((f) => !query || f.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10);

  // Close on outside click
  useEffect(() => {
    if (!showSearch) return;
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSearch(false);
        setQuery("");
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSearch]);

  const selectItem = useCallback((item) => {
    setShowSearch(false);
    setQuery("");
    setActiveIndex(-1);
    navigate("/menu");
    setTimeout(() => {
      const el = document.querySelector(`[data-food-id='${item._id}']`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }, [navigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!showSearch) return;
    const keyHandler = (e) => {
      if (e.key === "Escape") {
        setShowSearch(false);
        setQuery("");
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      }
      if (e.key === "Enter" && filtered[activeIndex]) {
        selectItem(filtered[activeIndex]);
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [showSearch, filtered, activeIndex, selectItem]);

  return (
    <div className="navbar">
      <Link to="/">
        <img className="logo" src={assets.TOT_logo} alt="Logo" />
      </Link>

      {/* Desktop Menu */}
      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={`${menu === "home" ? "active" : ""}`}
        >
          HOME
        </Link>
        <Link
          to="/menu"
          onClick={() => setMenu("menu")}
          className={`${menu === "menu" ? "active" : ""}`}
        >
          MENU
        </Link>
        <Link
          to="/about"
          onClick={() => setMenu("about")}
          className={`${menu === "about" ? "active" : ""}`}
        >
          ABOUT
        </Link>
        <Link
          to="/reservation"
          onClick={() => setMenu("reservation")}
          className={`${menu === "reservation" ? "active" : ""}`}
        >
          RESERVATION
        </Link>
      </ul>

      {/* Desktop Right Icons */}
      {!isMobile && (
        <div className="navbar-right">
          <img
            src={assets.search_icon}
            alt="search"
            className="navbar-icon"
            onClick={() => {
              setShowSearch(true);
              setTimeout(() => {
                searchBoxRef.current?.querySelector("input")?.focus();
              }, 30);
            }}
            style={{ cursor: "pointer" }}
          />
          <Link to="/cart" className="navbar-search-icon">
            <img src={assets.basket_icon} alt="" className="navbar-icon" />
            <div className={getTotalCartAmount() > 0 ? "dot" : ""}></div>
          </Link>

          {!token ? (
            <button onClick={() => setShowLogin(true)}>SIGN IN</button>
          ) : (
            <div className={`navbar-profile ${profileOpen ? 'open' : ''}`} tabIndex={0} ref={profileRef}>
              {/* show initial from localStorage.user if available, fallback to profile icon */}
              {(() => {
                try {
                  const u = JSON.parse(localStorage.getItem("user")) || {};
                  const first = u?.firstName || (u?.name ? u.name.trim().split(' ')[0] : '');
                  const initial = first ? first.charAt(0).toUpperCase() : null;
                  if (initial) return <div className="avatar-initial" onClick={toggleProfile}>{initial}</div>;
                } catch (e) {
                  /* ignore */
                }
                return <img src={assets.profile_icon} alt="profile" onClick={toggleProfile} />;
              })()}

              <ul className="navbar-profile-dropdown">
                <li onClick={() => navigate("/myaccount")}>
                  <img src={assets.profile_icon} alt="" /> <p>My Account</p>
                </li>
                <li onClick={() => navigate("/myorders")}>
                  <img src={assets.bag_icon} alt="" /> <p>My Orders</p>
                </li>
                <hr />
                <li onClick={logout}>
                  <img src={assets.logout_icon} alt="" /> <p>Logout</p>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Mobile: hamburger + icons */}
      {isMobile && (
        <div className="mobile-toggle-wrapper">
          <div className="mobile-icons">
            <img
              src={assets.search_icon}
              alt="search"
              className="navbar-icon"
              onClick={() => {
                setShowSearch(true);
                setTimeout(() => {
                  searchBoxRef.current?.querySelector("input")?.focus();
                }, 30);
              }}
              style={{ cursor: "pointer" }}
            />
            <Link to="/cart" className="navbar-search-icon">
              <img src={assets.basket_icon} alt="" className="navbar-icon" />
              <div className={getTotalCartAmount() > 0 ? "dot" : ""}></div>
            </Link>
          </div>
          <div
            className="mobile-menu-toggle"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? (
              <FaTimes className="hamburger-icon" />
            ) : (
              <FaBars className="hamburger-icon" />
            )}
          </div>
        </div>
      )}
      {showSearch && (
        <div className="nav-search-overlay">
          <div className="nav-search-dialog" ref={searchBoxRef}>
            <div className="nav-search-header">
              <input
                type="text"
                placeholder="Search dishes..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
              />
              <button
                className="close-btn"
                onClick={() => {
                  setShowSearch(false);
                  setQuery("");
                }}
              >
                ×
              </button>
            </div>
            <div className="nav-search-results">
              {filtered.map((item, idx) => (
                <div
                  key={item._id}
                  className={`nav-search-result ${
                    idx === activeIndex ? "active" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => selectItem(item)}
                >
                  <img
                    src={`http://localhost:5001/images/${item.image}`}
                    alt={item.name}
                  />
                  <div className="meta">
                    <p className="title">{item.name}</p>
                    <p className="price">LKR {item.price}</p>
                  </div>
                </div>
              ))}
              {query && filtered.length === 0 && (
                <p className="nav-search-empty">No results</p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Mobile Slide Menu */}
      <div className={`mobile-menu ${mobileMenu ? "open" : ""}`}>
        <Link
          to="/"
          onClick={() => {
            setMenu("home");
            setMobileMenu(false);
          }}
        >
          HOME
        </Link>
        <Link
          to="/menu"
          onClick={() => {
            setMenu("menu");
            setMobileMenu(false);
          }}
        >
          MENU
        </Link>
        <Link
          to="/about"
          onClick={() => {
            setMenu("about");
            setMobileMenu(false);
          }}
        >
          ABOUT
        </Link>
        <Link
          to="/reservation"
          onClick={() => {
            setMenu("reservation");
            setMobileMenu(false);
          }}
        >
          RESERVATION
        </Link>

        {!token ? (
          <button
            className="mobile-signin"
            onClick={() => {
              setShowLogin(true);
              setMobileMenu(false);
            }}
          >
            SIGN IN
          </button>
        ) : (
          <div className="mobile-profile-menu">
            <p
              onClick={() => {
                navigate("/myorders");
                setMobileMenu(false);
              }}
            >
              My Orders
            </p>
            <p
              onClick={() => {
                navigate("/myaccount");
                setMobileMenu(false);
              }}
            >
              My Account
            </p>
            <p
              onClick={() => {
                logout();
                setMobileMenu(false);
              }}
            >
              Logout
            </p>
          </div>
        )}
      </div>

      {mobileMenu && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default Navbar;

Navbar.propTypes = {
  setShowLogin: PropTypes.func,
};
