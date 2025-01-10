/**
 * @module controllerFunctions/HostelFunctions
 */
import Complaints from "../models/HostelComplaint.js";
import appError from "../utils/appError.js";
import validator from "validator";
import { automateEmail } from "../utils/email_automator.js";
import mongoose from "mongoose";

/**
 * Registers a hostel complaint.
 *
 * @async
 * @function registerComplaintHostel
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.complainType - The type of the complaint.
 * @param {string} req.body.complainDescription - The description of the complaint.
 * @param {string} req.body.hostelNumber - The hostel number.
 * @param {string} req.body.studentName - The name of the student.
 * @param {string} req.body.scholarNumber - The scholar number of the student.
 * @param {string} req.body.room - The room number.
 * @param {Array<string>} [req.filePaths] - The file paths of the attachments.
 * @param {string} req.sn - The scholar number for validation.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {appError} If the scholar numbers do not match or required fields are missing.
 * @returns {Promise<void>} A promise that resolves to void.
 */
const registerComplaintHostel = async (req, res, next) => {
	try {
		const {
			complainType,
			complainDescription,
			hostelNumber,
			studentName,
			scholarNumber,
			room,
		} = req.body;

		const attachments = req.filePaths || [];
		const scholarNumber2 = req.sn;
		const useremail = req.em;

		if (scholarNumber2 !== scholarNumber) {
			return next(new appError("Invalid scholar number", 400));
		}
		if (!validator.isEmail(useremail)) {
			return next(new appError("Invalid email", 400));
		}

		if (
			!complainType ||
			!complainDescription ||
			!hostelNumber ||
			!studentName ||
			!scholarNumber ||
			!room ||
			!useremail
		) {
			return next(new appError("Please enter all details!", 400));
		}

		const complaint = await Complaints.create({
			complainType,
			complainDescription,
			attachments,
			scholarNumber,
			hostelNumber,
			studentName,
			room,
			useremail,
		});

		res.status(201).json({
			success: true,
			message: "Complaint registered successfully!",
		});

		await automateEmail({ category: "Hostel", complaint });

	} catch (error) {
		next(error);
	}
};

/**
 * Retrieves hostel complaints for a specific scholar number.
 *
 * @async
 * @function getComplaintsHostel
 * @param {Object} req - The request object.
 * @param {string} req.sn - The scholar number for validation.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {appError} If the scholar number is missing.
 * @returns {Promise<void>} A promise that resolves to void.
 */
const getComplaintsHostel = async (req, res, next) => {
	try {
		const scholarNumber = validator.escape(req.sn);

		if (!scholarNumber) {
			return next(new appError("Scholar number is required!", 400));
		}

		const complaints = await Complaints.find({ scholarNumber });

		const complaintsWithUrls = complaints.map((complaint) => ({
			...complaint._doc,
			attachments: complaint.attachments.map((filePath) => ({
				url: `${req.protocol}://${req.get("host")}/${filePath}`,
			})),
			category: "Hostel",
		}));

		res.status(200).json({ complaints: complaintsWithUrls });
	} catch (error) {
		next(error);
	}
};

/**
 * Retrieves hostel complaints for a specific scholar number within a date range.
 *
 * @async
 * @function getComplaintsByDate
 * @param {Object} req - The request object.
 * @param {string} req.sn - The scholar number for validation.
 * @param {Object} req.query - The query parameters.
 * @param {string} [req.query.startDate] - The start date for filtering complaints.
 * @param {string} [req.query.endDate] - The end date for filtering complaints.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {appError} If the scholar number is missing.
 * @returns {Promise<void>} A promise that resolves to void.
 */
const getComplaintsByDate = async (req, res, next) => {
	try {
		const scholarNumber = validator.escape(req.sn);
		const { startDate, endDate } = req.query;
		const { complaintType, status, readStatus } = req.query;
		let complaintIds = req.query.complaintIds || [];
		
		if (typeof complaintIds === 'string') {
			complaintIds = complaintIds.split(',').map(id => id.trim());
		}
		// ComplaintIds is an array of strings which has MongoDB complaintIds

		if (!scholarNumber) {
			return next(new appError("Scholar number is required!", 400));
		}

		const dateFilter = {};
		if (startDate) {
			dateFilter.$gte = new Date(startDate);
		}
		if (endDate) {
			dateFilter.$lte = new Date(endDate);
		}

		const filter = {
			scholarNumber,
			...(startDate || endDate ? { createdAt: dateFilter } : {}),
		};

		if (complaintIds.length > 0) {
			filter._id = { $in: complaintIds.map(id => new mongoose.Types.ObjectId(id)) };
		}
		if (complaintType) {
			filter.complainType = complaintType;
		}
		if (status) {
			filter.status = status;
		}
		if (readStatus) {
			filter.readStatus = readStatus;
		}

		const complaints = await Complaints.find(filter);
		if (!complaints || complaints.length === 0) {
			return res.status(404).json({ message: "No complaints found." });
		}

		const complaintsWithUrls = complaints.map((complaint) => ({
			...complaint._doc,
			attachments: complaint.attachments.map((filePath) => ({
				url: `${req.protocol}://${req.get("host")}/${filePath}`,
			})),
			AdminAttachments: complaint.AdminAttachments.map((filePath) => ({
				url: `${req.protocol}://${req.get("host")}/${filePath}`,
			})),
			category: "Hostel",
		}));
		res.status(200).json({ complaints: complaintsWithUrls });
	} catch (error) {
		next(error);
	}
};

/**
 * Updates a hostel complaint.
 *
 * @async
 * @function updateComplaintHostel
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.complainId - The ID of the complaint to update.
 * @param {Object} req.body.updates - The updates to apply to the complaint.
 * @param {Object} req.body.updates.updateFields - The fields to update.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {appError} If the complain ID or updates are missing.
 * @returns {Promise<void>} A promise that resolves to void.
 */
const updateComplaintHostel = async (req, res, next) => {
	try {
		const { complainId, updates } = req.body;

		if (!updates) {
			return next(new appError("Please provide updates!", 400));
		}

		const { updateFields } = updates;

		if (!complainId) {
			return next(new appError("Complain ID is required!", 400));
		}

		const updatedComplaint = await Complaints.findByIdAndUpdate(
			complainId,
			{ $set: updateFields },
			{ new: true }
		);

		if (!updatedComplaint) {
			return next(new appError("Complaint not found!", 404));
		}

		res.status(200).json({
			success: true,
			message: "Complaints updated successfully!",
			data: updatedComplaint,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Deletes a hostel complaint.
 *
 * @async
 * @function deleteComplaintHostel
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters.
 * @param {string} req.query.complainId - The ID of the complaint to delete.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {appError} If the complain ID is missing.
 * @returns {Promise<void>} A promise that resolves to void.
 */
const deleteComplaintHostel = async (req, res, next) => {
	try {
		const { complainId } = req.query;
		if (!complainId) {
			return next(new appError("Complain ID is required!", 400));
		}

		const deletedComplaint = await Complaints.findByIdAndDelete(complainId);

		if (!deletedComplaint) {
			return next(new appError("Complaint not found!", 404));
		}

		res.status(200).json({
			success: true,
			message: "Complaint deleted successfully!",
		});
	} catch (error) {
		next(error);
	}
};

export {
	registerComplaintHostel,
	getComplaintsHostel,
	updateComplaintHostel,
	deleteComplaintHostel,
	getComplaintsByDate,
};
