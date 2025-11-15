import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import './About.css';
import { FaUserTie, FaUtensils, FaShoppingCart, FaHeadset, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
// social icons removed (not used in this component)
import { assets } from '../../assets/assets';
import ourStory from '../../assets/ourstory.jpg';

const About = () => {
  const [experience, setExperience] = useState(0);
  const [dishes, setDishes] = useState(0);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const contactSection = document.querySelector('.contact-main');
      if (contactSection) {
        const rect = contactSection.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          setShowContact(true);
        }
      }

      const section = document.querySelector('.counters-section');
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100 && experience === 0) {
          let exp = 0;
          let dish = 0;
          const expInterval = setInterval(() => {
            exp += 1;
            setExperience(exp);
            if (exp === 15) clearInterval(expInterval);
          }, 300);

          const dishInterval = setInterval(() => {
            dish += 1;
            setDishes(dish);
            if (dish === 50) clearInterval(dishInterval);
          }, 60);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [experience, dishes]);

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = (window.__env__ && window.__env__.API_URL) || 'http://localhost:5001';
      const res = await axios.post(`${url}/api/messages`, form);
      if (res.data.success) {
        toast.success('Message sent — admin will be notified');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(res.data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error — try again');
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="about-hero" style={{ backgroundImage: `url(${ourStory})` }}></div>

      {/* Features Section */}
      <section className="features-section">
        <div className="features">
          <div className="card">
            <FaUserTie className="icon" />
            <h3>Master Chefs</h3>
            <p>Our team of skilled chefs bring years of experience to deliver authentic flavors.</p>
          </div>
          <div className="card">
            <FaUtensils className="icon" />
            <h3>Quality Food</h3>
            <p>We serve only the freshest ingredients to ensure every meal is delicious.</p>
          </div>
          <div className="card">
            <FaShoppingCart className="icon" />
            <h3>Online Order</h3>
            <p>Convenient online ordering makes it easy to enjoy your favorite dishes.</p>
          </div>
          <div className="card">
            <FaHeadset className="icon" />
            <h3>24/7 Service</h3>
            <p>We’re always here to serve you, day or night.</p>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-content">
          <div className="image-grid">
            <img src={assets.bollywood} alt="About 1" className="large-img" />
            <img src={assets.about2} alt="About 2" className="small-img" />
            <img src={assets.about2} alt="About 3" className="small-img" />
            <img src={assets.fresh} alt="About 4" className="large-img" />
          </div>

          <div className="welcome-text">
            <div className="welcome-heading-logo">
              <h3 className="welcome-heading">WELCOME TO</h3>
              <img src={assets.TOT_logo} alt="Logo" className="welcome-logo" />
            </div>
            <p>
              Taste of Thayagam! We are passionate about delivering
              an unforgettable dining experience with delicious food and warm hospitality.
            </p>
            <p>
              Whether you dine in or order online, our mission is to bring happiness
              to your table every time.
            </p>

            {/* Counters */}
            <div className="counters-section">
              <div className="counter">
                <span className="line">|</span>
                <div>
                  <div className="counter-number">{experience}</div>
                  <div className="counter-text">
                    <strong>YEARS OF<br />EXPERIENCE</strong>
                  </div>
                </div>
              </div>
              <div className="counter">
                <span className="line">|</span>
                <div>
                  <div className="counter-number">{dishes}</div>
                  <div className="counter-text">
                    <strong>POPULAR<br />DISHES</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="triple-divider">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`contact-main ${showContact ? 'fade-in' : ''}`}>
        <div className="contact-header">
          <h2>Contact Us</h2>
          <p>Get in touch with us for any query</p>
        </div>

        {/* Info Boxes */}
        <div className="contact-info-boxes">
          <div className="box">
            <FaEnvelope /> <h4>Booking</h4>
            <p>booking@tasteofthayagam.com</p>
          </div>
          <div className="box">
            <FaEnvelope /> <h4>General</h4>
            <p>info@tasteofthayagam.com</p>
          </div>
          <div className="box">
            <FaPhone /> <h4>Mobile</h4>
            <p>+94 123 456 789</p>
          </div>
        </div>

        {/* Map + Form */}
        <div className="contact-map-form">
          <div className="map">
            <iframe
              title="Taste of Thayagam Map"
              src="https://www.google.com/maps?q=Dockyard+Road,+Trincomalee,+Sri+Lanka&output=embed"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
            <p className="map-address">
              <FaMapMarkerAlt className="location-icon" />
              283, Dockyard Road, Taste of Thayagam, Trincomalee
            </p>

          </div>

          <form className="query-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Your Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Your Email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <textarea
              placeholder="Message"
              rows="5"
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            ></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </section>
    </>
  );
};

export default About;
