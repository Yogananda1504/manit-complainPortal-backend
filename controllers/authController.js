/**
 * @module controllers/authController
 */

import appError from "../utils/appError.js";
import { generateToken } from "../utils/tokenUtils.js";
import dotenv from "dotenv";
import DataService from "../utils/dataService.js";
import Ldap_authenticator from "../utils/Ldap_authenticator.js";

dotenv.config();

const authenticator = new Ldap_authenticator(
	process.env.LDAP_BASE_DN || "dc=dev,dc=com",
	{
		// TLS configuration based on environment variable
		secure: process.env.LDAP_USE_TLS === "true",
		tlsOptions: process.env.LDAP_USE_TLS === "true" ? {
			rejectUnauthorized: false, // Adjust based on your TLS requirements
		} : undefined,
	}
);
const dataServiceInstance = new DataService();

/**
 * Authenticate the user using LDAP and generate a JWT token.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
/**
 * Controller for handling user authentication.
 *
 * @file ./controllers/authController.js
 *
 * @async
 * @function authController
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.username - The username of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @throws {appError} If username or password is missing.
 * @throws {appError} If authentication fails.
 * @throws {appError} If there is an error during authentication.
 *
 * @returns {Promise<void>} Sends a JSON response with user details if authentication is successful.
 */
const authController = async (req, res, next) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return next(new appError("Username and password are required", 401));
		}

		// Authenticate the user using LDAP
		const status = await authenticator.authenticate(username, password);

		if (!status) {
			return next(new appError("Invalid scholar number or password", 401));
		} else {
			
			
			// Fetch user details and send response in parallel
			const userPromise = dataServiceInstance.getGenericDetails(username);
            const [user] = await Promise.all([userPromise]);
            // Create the JWT token for the user
			const token = generateToken({ username, email: user.email });
			// Set the token as a secure, HTTP-only cookie
			res.cookie("jwt", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
			});

			res.status(200).json({
				success: true,
				message: "User authenticated successfully",
				user,
			});
		}
	} catch (err) {
		return next(new appError("Error in authenticating user", 500));
	}
};

export default authController;
