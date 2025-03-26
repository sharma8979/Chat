import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";


export const authUser = async (req, res, next) => {
    try {
      let token = req.cookies?.token || req.header("Authorization");
  
      if (!token) {
        return res.status(401).json({ error: "Please authenticate" });
      }
  
      // Extract Bearer token
      if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
      }
  
      const isBlackListed = await redisClient.get(token);
      if (isBlackListed) {
        res.cookie("token", "", ""); // Clear the token cookie
        return res.status(401).json({ error: "Token is blacklisted. Please log in again." });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
  