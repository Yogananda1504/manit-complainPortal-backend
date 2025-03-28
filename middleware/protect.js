/**
 * @module middleware/protect
 * @file Middleware to protect routes by verifying JWT tokens.
 * @exports protect
 */

import { verifyToken } from "../utils/tokenUtils.js";
import appError from "../utils/appError.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Middleware function to protect routes.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {Function} next - Next middleware function.
 */

const protect = async (req, res, next) => {
	try {
		// Extract the token from the request cookies
		const token = req.cookies.jwt;
		console.log("Token:", token);
		if (!token) {
			return next(new appError("You are not logged in!", 401));
		}

		// Verify the token and extract the scholar number
		const decoded = verifyToken(token);
		console.log("Decoded:", decoded);
		if (!decoded) {
			return next(new appError("Invalid token. Please log in again!", 401));
		}

		// Grant access to protected route
		req.sn = decoded.username; // Attach the scholar number of the student to the request
		req.em = decoded.email;
		next();
	} catch (err) {
		return res.status(401).json({expired:true,message:"Session Expired",});
	}
};

export { protect };
