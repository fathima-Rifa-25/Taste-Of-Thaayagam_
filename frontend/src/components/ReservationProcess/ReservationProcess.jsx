import "./ReservationProcess.css";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";

const Step = ({ icon, title, body, onClick }) => {
  const handleKey = (e) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") onClick();
  };
  return (
    <div className="rp-step" role="group" aria-label={title}>
      <div className="rp-icon" aria-hidden>
        {icon}
      </div>
      <div
        className="rp-card"
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={handleKey}
        aria-pressed={onClick ? false : undefined}
      >
        <h4>{title}</h4>
        <p>{body}</p>
      </div>
    </div>
  );
};

const ReservationProcess = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setInView(true);
        });
      },
      { threshold: 0.16 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="reservation-process rp-maroon">
      <h2>Reservation process</h2>
      <div className="rp-subtitle">
        Walkthrough: reserve, order online or enjoy dining
      </div>
      <div className="rp-grid">
        <div className="rp-col left">
          <Step
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#7b1120"
                  d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"
                />
              </svg>
            }
            title="Explore the Menu"
            body="Browse our selection of delicious dishes, crafted for every occasion."
            onClick={() => navigate("/menu")}
            inView={inView}
          />
          <Step
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#7b1120"
                  d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"
                />
              </svg>
            }
            title="Confirm Your Reservation"
            body="Receive instant confirmation via email or SMS."
            onClick={() => navigate("/menu")}
            inView={inView}
          />
        </div>
        <div className="rp-center">
          <div
            className="center-marker"
            role="button"
            tabIndex={0}
            aria-label="Go to menu"
            onClick={() => navigate("/menu")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/menu");
            }}
          ></div>
          <div style={{ height: 10 }} />
          <div className="rp-delivery-badge" role="status" aria-live="polite">
            Online Delivery Available
          </div>
          <div style={{ height: 10 }} />
          <div
            className="center-marker"
            role="button"
            tabIndex={0}
            aria-label="Go to menu"
            onClick={() => navigate("/menu")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/menu");
            }}
          ></div>
        </div>
        <div className="rp-col right">
          <Step
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="#7b1120" d="M7 10l5 5 5-9z" />
              </svg>
            }
            title="Book a Table"
            body="Choose your preferred date and time for a hassle-free dining experience."
            onClick={() => navigate("/menu")}
            inView={inView}
          />
          <Step
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#7b1120"
                  d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.5V18h-2v-1.5c-1.7-.5-3-2.1-3-3.9V10h2v3.6c0 1.1.9 2 2 2s2-.9 2-2V10h2v2.6c0 1.8-1.3 3.4-3 3.9z"
                />
              </svg>
            }
            title="Dine & Enjoy"
            body="Arrive at your reserved time and enjoy an unforgettable culinary experience."
            onClick={() => navigate("/menu")}
            inView={inView}
          />
        </div>
      </div>
      <div className="rp-cta">
        <button className="rp-cta-btn" onClick={() => navigate("/menu")}>
          Explore Our Menu
        </button>
      </div>
    </section>
  );
};

export default ReservationProcess;

Step.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  body: PropTypes.string,
  onClick: PropTypes.func,
};
