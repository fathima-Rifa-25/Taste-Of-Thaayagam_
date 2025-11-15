import { useContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const LoginPopup = ({ setShowLogin, isAdminAdd }) => {
  const { setToken, url, loadCartData } = useContext(StoreContext);
  const [currState, setCurrState] = useState(isAdminAdd ? "Add User" : "Login");
  // navigate not needed for inline forgot flow
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotToken, setForgotToken] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [awaitingToken, setAwaitingToken] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const tokenInputRef = useRef(null);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: ""
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    let new_url = url;
    if (isAdminAdd) {
      // Admin adding a new user
      new_url += "/api/users"; // ✅ correct admin endpoint
    } else if (currState === "Login") {
      new_url += "/api/users/login";
    } else {
      new_url += "/api/users/register";
    }

    try {
      const response = await axios.post(new_url, data);
      console.log("Auth response:", response.data);

      if (response.data.success) {
        if (!isAdminAdd) {
          // Normal login/signup
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user)); // store user info
          }
          loadCartData({ token: response.data.token });
          // If this user is an admin, redirect to the admin panel and pass the token+user
          if (response.data.user && response.data.user.isAdmin) {
            try {
              const adminUrl = `http://localhost:5174/?adminToken=${encodeURIComponent(response.data.token)}&adminUser=${encodeURIComponent(JSON.stringify(response.data.user))}`;
              // navigate to admin app which will pick up the token from the query
              window.location.assign(adminUrl);
              return;
            } catch (e) {
              console.warn('Admin redirect failed', e);
            }
          }
          setShowLogin(false);
        } else {
          // Admin adding user
          toast.success("User added successfully");
          setData({ firstName: "", lastName: "", email: "", password: "", phone: "" });
        }
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Auth error:", err.response?.data || err.message);
      toast.error("Error connecting to server");
    }
  };

  // Send reset code to email (dev: API returns token)
  const sendForgotCode = async () => {
    try {
      if (!forgotEmail) return toast.error('Please enter an email');
      setIsSending(true);
      const res = await axios.post(`${url}/api/users/forgot-password`, { email: forgotEmail });
      if (res.data?.success) {
        toast.success('Reset code sent. Check your email (including spam).');
        setForgotToken('');
        setAwaitingToken(true);
        // autofocus by deferring to next tick
        setTimeout(() => {
          try { tokenInputRef.current?.focus(); } catch (e) { /* ignore */ }
        }, 100);
      } else {
        toast.error(res.data?.message || 'Could not send code');
      }
      setIsSending(false);
    } catch (err) {
      console.error(err);
      toast.error('Network error');
      setIsSending(false);
    }
  };

  const onForgotEmailBlur = () => {
    // simple email regex
    const re = /^\S+@\S+\.\S+$/;
    if (forgotEmail && re.test(forgotEmail)) {
      sendForgotCode();
    }
  };

  const submitReset = async () => {
    try {
      const res = await axios.post(`${url}/api/users/reset-password/${forgotToken}`, { password: forgotNewPassword });
      if (res.data?.success) {
        toast.success('Password reset successful — you can login now');
        setForgotMode(false);
        setForgotEmail(''); setForgotToken(''); setForgotNewPassword('');
        setCurrState('Login');
      } else {
        toast.error(res.data?.message || 'Could not reset password');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error');
    }
  };

  

  // close handler (guarded)
  const close = useCallback(() => {
    try {
      if (typeof setShowLogin === 'function') setShowLogin(false);
    } catch (e) {
      // ignore
    }
  }, [setShowLogin]);

  // Only close via the X icon — no overlay click or Escape handling per request.

  return (
    <div className='login-popup'>
      <form onSubmit={onSubmit} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img className="login-close-img" onClick={close} src={assets.cross_icon} alt="close" style={{ width: 16 }} role="button" tabIndex={0} />
        </div>
        <div className="login-popup-inputs">
          {(currState === "Sign Up" || currState === "Add User") && 
            <>
              <input 
                name='firstName' 
                onChange={onChangeHandler} 
                value={data.firstName} 
                type="text" 
                placeholder='First name' 
                required 
              />
              <input 
                name='lastName' 
                onChange={onChangeHandler} 
                value={data.lastName} 
                type="text" 
                placeholder='Last name' 
              />
            </>
          }
          {(currState === "Sign Up" || currState === "Add User") && 
            <input 
              name='phone' 
              onChange={onChangeHandler} 
              value={data.phone} 
              type="text" 
              placeholder='Phone number' 
            />
          }
          <input 
            name='email' 
            onChange={onChangeHandler} 
            value={data.email} 
            type="email" 
            placeholder='Your email' 
            required 
          />
          <input 
            name='password' 
            onChange={onChangeHandler} 
            value={data.password} 
            type="password" 
            placeholder='Password' 
            required 
          />
        </div>
        {!forgotMode && (
          <button>
            {currState === "Login" 
              ? "Login" 
              : (currState === "Add User" ? "Add User" : "Create Account")
            }
          </button>
        )}


        {currState === 'Login' && !forgotMode && (
          <p>
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                setForgotMode(true);
              }}
            >
              Forgot password?
            </a>
          </p>
        )}

        {forgotMode && (
          <div className="forgot-inline">
              {!awaitingToken ? (
              <div>
                <input className="forgot-input" type="email" placeholder="Enter your email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} onBlur={onForgotEmailBlur} />
                <div className="forgot-actions">
                  <button type="button" onClick={sendForgotCode} disabled={isSending}>{isSending ? 'Sending...' : 'Send code'}</button>
                  <button type="button" onClick={() => { setForgotMode(false); setForgotEmail(''); setAwaitingToken(false); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                {/* The box above the new password is the one-time reset code sent to the user's email */}
                <input ref={tokenInputRef} className="forgot-input" placeholder="Reset code (check your email)" required value={forgotToken} onChange={(e) => setForgotToken(e.target.value)} />
                <input className="forgot-input" type="password" placeholder="New password (min 6 chars)" required value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} />
                <div className="forgot-actions">
                  <button type="button" onClick={submitReset}>Set new password</button>
                  <button type="button" onClick={() => { setForgotMode(false); setForgotEmail(''); setForgotToken(''); setForgotNewPassword(''); setAwaitingToken(false); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {!isAdminAdd && !forgotMode && (
          <div className="login-popup-condition">
            <input type="checkbox" required={currState !== 'Login'} />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>
        )}

        {!isAdminAdd && !forgotMode && (
          currState === "Login"
          ? <p>Create a new account? <span onClick={() => setCurrState('Sign Up')}>Click here</span></p>
          : <p>Already have an account? <span onClick={() => setCurrState('Login')}>Login here</span></p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;

LoginPopup.propTypes = {
  setShowLogin: PropTypes.func,
  isAdminAdd: PropTypes.bool,
};
