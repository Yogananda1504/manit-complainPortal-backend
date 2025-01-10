import appError from "../utils/appError.js";
import dataService from "../utils/dataService.js";
import validator from "validator";
import dotenv from "dotenv";
dotenv.config();

const dataServiceInstance = new dataService();

/**
 * Get profile details of a user.
 * @file ./controllers/profileController.js
 * @module controllers/profileController
 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const getProfileDetails = async (req, res, next) => {
	
		try {
			// Extract the scholar number set by the auth middleware
			const scholarNumber = validator.escape(req.sn);
			const complaintStats = await dataServiceInstance.getComplaintDetails(
				scholarNumber
			);
			if (!complaintStats) {
				return next(new appError("User not found!", 404));
			}
			
			res.status(200).json({
				success: true,
				...complaintStats,
			});
		} catch (error) {
			console.error("Internal error:", error);
			return next(new appError("Internal server error!", 500));
		}

};

export { getProfileDetails };
