import jwt from 'jsonwebtoken';
import User from '../models/User.js';

;

const protectRoute = async (req, res, next) => {
 
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token provided, authorization denied' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find the user
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Token is not valid, authorization denied' });
        }

        req.user = user; // Attach user to request object
        next(); // Call the next middleware or route handler
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(500).json({ message: "Token is not valid" });

    }
}

export default protectRoute;