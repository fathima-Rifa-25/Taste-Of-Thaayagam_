import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    // Check for Bearer token first, fallback to token header
    const token = req.headers['authorization']?.split(' ')[1] || req.headers['token'];

    if (!token) {
        return res.json({ success: false, message: 'Not Authorized. Login Again' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id }; // <-- set user ID here
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export default authMiddleware;
