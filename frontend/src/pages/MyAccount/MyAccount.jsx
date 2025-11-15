import { useEffect, useState } from 'react';
import './MyAccount.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyAccount = () => {
	const navigate = useNavigate();
 const [user, setUser] = useState({ firstName: '', lastName: '', email: '', phone: '' });
	const [password, setPassword] = useState('');
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');

	useEffect(() => {
			try {
				const u = JSON.parse(localStorage.getItem('user')) || {};
				setUser({ firstName: u.firstName || (u.name ? u.name.split(' ')[0] : ''), lastName: u.lastName || (u.name ? u.name.split(' ').slice(1).join(' ') : ''), email: u.email || '', phone: u.phone || '' });
			} catch (e) {
			// ignore
		}
	}, []);

		const onChange = (e) => setUser((p) => ({ ...p, [e.target.name]: e.target.value }));

	const onSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setMessage('');
		try {
			const stored = JSON.parse(localStorage.getItem('user')) || {};
			const id = stored.id || stored._id;
			if (!id) throw new Error('User id missing');
			const payload = { firstName: user.firstName, lastName: user.lastName, name: `${user.firstName} ${user.lastName}`.trim(), email: user.email };
			if (user.phone) payload.phone = user.phone;
			if (password) payload.password = password;

			const url = (window.__env__ && window.__env__.API_URL) || 'http://localhost:5001';
			const res = await axios.put(`${url}/api/users/${id}`, payload);
			if (res.data && res.data.success) {
				setMessage('Saved successfully');
				// update localStorage.user with returned data if present
			const updated = res.data.data || { ...stored, ...payload };
				// keep id
				updated.id = updated.id || updated._id || id;
				localStorage.setItem('user', JSON.stringify(updated));
				setPassword('');
				// small delay then navigate or just stay
				setTimeout(() => setMessage(''), 2500);
			} else {
				setMessage(res.data.message || 'Save failed');
			}
		} catch (err) {
			console.error(err);
			setMessage(err.response?.data?.message || err.message || 'Error saving');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="myaccount-page">
			<form className="myaccount-card" onSubmit={onSave}>
				<h2>My Account</h2>
					<label>First name</label>
					<input name="firstName" value={user.firstName} onChange={onChange} />

					<label>Last name</label>
					<input name="lastName" value={user.lastName} onChange={onChange} />

				<label>Contact (phone)</label>
				<input name="phone" value={user.phone} onChange={onChange} />

				<label>Email</label>
				<input name="email" type="email" value={user.email} onChange={onChange} />

				<label>New password (leave blank to keep)</label>
				<input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

				<div className="actions">
					<button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
					<button type="button" className="cancel" onClick={() => navigate('/')}>Cancel</button>
				</div>

				{message && <p className="message">{message}</p>}
			</form>
		</div>
	);
};

export default MyAccount;

