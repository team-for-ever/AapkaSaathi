import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Profile from '../models/Profile.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No authentication token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and attach to request
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Find profile ID if exists and attach to request
      const profile = await Profile.findOne({ user: user._id });
      
      req.user = {
        id: user._id,
        profileId: profile?._id
      };
      
      next();
    } catch (jwtError) {
      console.error('JWT Verification failed:', jwtError);
      return res.status(401).json({ message: "Token is not valid" });
    }
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
