import HostelComplaint from "../models/HostelComplaint.js";
import AcademicComplaint from "../models/AcademicComplaint.js";
import AdministrationComplaint from "../models/AdministrationComplaint.js";
import InfrastructureComplaint from "../models/InfrastructureComplaint.js";
import MedicalComplaint from "../models/MedicalComplaint.js";
import RaggingComplaint from "../models/RaggingComplaint.js";

const modelsMap = {
    hostel: HostelComplaint,
    academic: AcademicComplaint,
    administration: AdministrationComplaint,
    infrastructure: InfrastructureComplaint,
    medical: MedicalComplaint,
    ragging: RaggingComplaint
};

// Helper transformation for testing
export function formatComplaint(complaint, req, category) {
    return {
        ...complaint._doc,
        attachments: complaint.attachments.map(filePath => ({
            url: `${req.protocol}://${req.get("host")}/${filePath}`
        })),
        AdminAttachments: complaint.AdminAttachments.map(filePath => ({
            url: `${req.protocol}://${req.get("host")}/${filePath}`
        })),
        category: category.charAt(0).toUpperCase() + category.slice(1)
    };
}

export const searchController = async (req, res) => {
    const category = req.params.type;
    const id = req.query.complainId;

    try {
        const complaintModel = modelsMap[category];
        if (!complaintModel) {
            return res.status(400).json({ status: "error", message: "Invalid category" });
        }
        const complaint = await complaintModel.findById(id);

        if (!complaint) {
            return res.status(404).json({ status: "error", message: "Complaint not found" });
        }

        const transformedComplaint = formatComplaint(complaint, req, category);

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "success",
            complaint: transformedComplaint
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};
