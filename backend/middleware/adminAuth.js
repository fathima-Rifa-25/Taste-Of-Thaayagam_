(function() {
})();

import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
	const token = req.headers['authorization']?.split(' ')[1] || req.headers['token'];
	if (!token) return res.status(401).json({ success: false, message: 'Not Authorized' });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });
		req.user = { id: decoded.id, isAdmin: decoded.isAdmin };
		next();
	} catch (err) {
		return res.status(401).json({ success: false, message: 'Invalid token' });
	}
};

export default adminAuth;

