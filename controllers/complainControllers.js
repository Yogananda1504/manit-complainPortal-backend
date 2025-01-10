// import Complaints from "../models/HostelComplaint.js";
import appError from "../utils/appError.js";
import dotenv from "dotenv";
import { registerComplaintHostel, getComplaintsHostel ,updateComplaintHostel , deleteComplaintHostel,getComplaintsByDate} from "../controllerFunctions/hostelFunctions.js";
import { registerComplaintAcademic,getComplaintsAcademic,getAcademicComplaintsByDate,deleteAcademicComplaint,updateAcademicComplaint } from "../controllerFunctions/academicFunctions.js";
import { registerAdministrationComplaint,getAdministrationComplaints,getAdministrationComplaintsByDate,updateAdministrationComplaint,deleteAdministrationComplaint } from "../controllerFunctions/administrationFunctions.js";
import { registerInfrastructureComplaint,getInfrastructureComplaints,getInfrastructureComplaintsByDate,updateInfrastructureComplaint,deleteInfrastructureComplaint } from "../controllerFunctions/infrastructureFunctions.js";
import { registerMedicalComplaint,getMedicalComplaints,getMedicalComplaintsByDate,updateMedicalComplaint,deleteMedicalComplaint} from "../controllerFunctions/medicalFunctions.js";
import { registerRaggingComplaint,getRaggingComplaints,getRaggingComplaintsByDate,updateRaggingComplaint,deleteRaggingComplaint } from "../controllerFunctions/raggingFunctions.js";
// Environment variables
dotenv.config();

/**
 * Register a complaint based on the type.
 * @file ./controllers/complainControllers.js
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
/**
 * @file /d:/compliant-portal/manit-complainPortal-backend/controllers/complainControllers.js
 * @module controllers/complainControllers
 */

 /**
	* Registers a complaint based on the type specified in the request parameters.
	* 
	* @async
	* @function registerComplain
	* @param {Object} req - Express request object.
	* @param {Object} res - Express response object.
	* @param {Function} next - Express next middleware function.
	* @throws Will throw an error if the complaint registration fails.
	*/
export const registerComplain = async (req, res, next) => {
	try {
		if (req.params.type === "Hostel") {
			await registerComplaintHostel(req, res, next);
		} else if (req.params.type === "Academic") {
			await registerComplaintAcademic(req, res, next);
		} else if (req.params.type === "Administration") {
			await registerAdministrationComplaint(req, res, next);
		} else if (req.params.type === "Infrastructure") {
			await registerInfrastructureComplaint(req, res, next);
		} else if (req.params.type === "Medical") {
			await registerMedicalComplaint(req, res, next);
		} else if (req.params.type === "Ragging") {
			await registerRaggingComplaint(req, res, next);
		}
		else {
			return next(new appError("Development phase ", 400));
		}
	} catch (error) {
		// Log the error for debugging
		console.error("Error during complaint registration:", error);

		// Pass error to the error handling middleware
		next(new appError("Internal server error!", 500));
	}
};

/**
 * Get complaints based on the type.
 * @file ./controllers/complainControllers.js
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const getComplaints = async (req, res, next) => {
    try {
        if (req.params.type === "Hostel") {
			await getComplaintsHostel(req, res, next);
		} else if (req.params.type === "Academic") {
			await getComplaintsAcademic(req, res, next);
		} else if (req.params.type === "Administration") {
			await getAdministrationComplaints(req, res, next);
		} else if (req.params.type === "Infrastructure") {
			await getInfrastructureComplaints(req, res, next);
		} else if (req.params.type === "Medical") {
			await getMedicalComplaints(req, res, next);
		} else if (req.params.type === "Ragging") {
			await getRaggingComplaints(req, res, next);
		}
		else {
			return next(new appError("Development phase ", 400));	
		}
    } catch (error) {
        console.error("Error fetching complaints:", error);
        next(new appError("Internal server error!", 500));
    }
};

/**
 * Get complaints by date based on the type.
 * @file ./controllers/complainControllers.js
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const getComplaintsByDate_main = async (req, res, next) => {
	try {
		if(new Date(req.query.startDate) >new Date(req.query.endDate)){
              return next(new appError("Start date should be less than end date", 400));
		}
		if (req.params.type === "Hostel") {
			await getComplaintsByDate(req, res, next);
		} else if (req.params.type === "Academic") {
			await getAcademicComplaintsByDate(req, res, next);
		} else if (req.params.type === "Administration") {
			await getAdministrationComplaintsByDate(req, res, next);
		} else if (req.params.type === "Infrastructure") {
			await getInfrastructureComplaintsByDate(req, res, next);
		} else if (req.params.type === "Medical") {
			await getMedicalComplaintsByDate(req, res, next);
		} else if (req.params.type === "Ragging") {
			await getRaggingComplaintsByDate(req, res, next);
		}
		else {
			return next(new appError("Development phase ", 400));
		}
	} catch (error) {
		console.error("Error fetching complaints:", error);
		next(new appError("Internal server error!", 500));
	}
}	

/**
 * Update complaints based on the type.
 * @file ./controllers/complainControllers.js
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const updateComplaints = async (req, res, next) => {
	try {
		  if(req.params.type === "Hostel"){
			await updateComplaintHostel(req, res, next);
		}else if(req.params.type === "Academic"){
			await updateAcademicComplaint(req, res, next);
		}else if(req.params.type === "Administration"){
			await updateAdministrationComplaint(req, res, next);
		}else if(req.params.type === "Infrastructure"){
			await updateInfrastructureComplaint(req, res, next);
		}else if(req.params.type === "Medical"){
			await updateMedicalComplaint(req, res, next);
		}else if(req.params.type === "Ragging"){
			await updateRaggingComplaint(req, res, next);
		}
		else {
			return next(new appError("Development phase ", 400));
		}
	} catch (err) {
		next(new appError("Internal server error!", 500));
	}
};

/**
 * Delete complaints based on the type.
 * @file ./controllers/complainControllers.js
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const deleteComplaints = async (req, res, next) => {
	try {
		if(req.params.type === "Hostel"){
			await deleteComplaintHostel(req, res, next);
		}else if(req.params.type === "Academic"){
			await deleteAcademicComplaint(req, res, next);	
		}else if(req.params.type === "Administration"){
			await deleteAdministrationComplaint(req, res, next);
		}else if(req.params.type === "Infrastructure"){
			await deleteInfrastructureComplaint(req, res, next);
		}else if(req.params.type === "Medical"){
			await deleteMedicalComplaint(req, res, next);
		}else if(req.params.type === "Ragging"){
			await deleteRaggingComplaint(req, res, next);
		}
		else {
			return next(new appError("Development phase ", 400));
		}
	} catch (error) {
		next(new appError("Internal server error!", 500));
	}
};
