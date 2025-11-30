import jwt from "jsonwebtoken";
import supabase from "../config/supabaseClient.js";

// Middleware to verify JWT token and extract user info
export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied. No token provided. Please login first.",
      });
    }

    // Extract token (format: "Bearer TOKEN")
    const token = authHeader.split(" ")[1];

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if token is blacklisted
    console.log("Checking if token is blacklisted...");
    const { data: blacklistedToken, error: blacklistError } = await supabase
      .from("token_blacklist")
      .select("token")
      .eq("token", token)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

    if (blacklistError) {
       console.error("Error checking blacklist:", blacklistError);
    }

    if (blacklistedToken) {
      console.log("⛔ Token found in blacklist. Denying access.");
      return res.status(401).json({ 
        error: "Session expired. Please login again." 
      });
    }
    
    console.log("✅ Token is valid and not blacklisted");

    // Attach user info to request object
    req.user = {
      id: decoded.id,
      reg_no: decoded.reg_no,
      name: decoded.name,
    };

    next(); // Continue to the next middleware/controller
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please login again." });
    }
    return res.status(500).json({ error: "Authentication failed" });
  }
};
