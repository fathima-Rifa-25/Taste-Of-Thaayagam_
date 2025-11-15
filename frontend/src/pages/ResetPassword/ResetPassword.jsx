import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const url = (window.__env__ && window.__env__.API_URL) || 'http://localhost:5001';

  const requestReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${url}/api/users/forgot-password`, { email });
      if (res.data?.success) {
        toast.success('Reset token created (dev: token returned)');
        if (res.data.token) setToken(res.data.token);
      } else toast.error(res.data?.message || 'Failed');
    } catch (err) { console.error(err); toast.error('Network error'); }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${url}/api/users/reset-password/${token}`, { password: newPassword });
      if (res.data?.success) {
        toast.success('Password reset! You can login now.');
        navigate('/');
      } else toast.error(res.data?.message || 'Failed');
    } catch (err) { console.error(err); toast.error('Network error'); }
  };

  return (
    <div className="page-container reset-password-page">
      <h2>Reset Password</h2>
      <div className="reset-block">
        {!token ? (
          <form onSubmit={requestReset}>
            <input type="email" placeholder="Your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit">Request reset token</button>
          </form>
        ) : (
          <form onSubmit={submitReset}>
            <input placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} />
            <input type="password" placeholder="New password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <button type="submit">Set new password</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
