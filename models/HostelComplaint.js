/**
 * @file HostelComplaint Model Module
 * @description This module defines the HostelComplaint schema and model for handling hostel-related complaints.
 */

// This for the hostel wise complaints
import { model, Schema } from 'mongoose';

/**
 * @module models/HostelComplaint
 */

/**
 * HostelComplaint Schema
 * @typedef {Object} HostelComplaint
 * @property {string} scholarNumber - Student ID
 * @property {string} studentName - Student name
 * @property {string} hostelNumber - Hostel number
 * @property {string} [complainType] - Type of the complaint
 * @property {string} [complainDescription] - Description of the complaint
 * @property {string[]} [attachments] - List of attachment URLs
 * @property {string} [room] - Room number
 * @property {string} [status="Pending"] - Status of the complaint
 * @property {string} [readStatus="Not viewed"] - Read status of the complaint
 */
const HostelComplaintSchema = new Schema({
    scholarNumber: {
        type: String, 
        required: [true, "Student ID is required!"],
    },
    studentName: {
        type: String,
        required: [true, "Student name is required!"],
        trim: true
    },
    hostelNumber: {
        type: String,
        required: [true, "Hostel number is required!"],
    },
    complainType: {
        type: String,
        trim: true,
        enum: ["Maintenance", "Hygiene", "Security", "Mess", "Bathroom", "Room", "Noise","Internet", "Other"],
        required: [true, "Complaint type is required!"]
    },
    complainDescription: {
        type: String,
        trim: true,
        required: [true, "Complaint description is required!"]
    },
    attachments: {
        type: [String],
        default: []
    },
    room: {
        type: String,
        trim: true
    },
    useremail:{
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Resolved"],
    },
    readStatus: { 
        type: String,
        default: "Not viewed",
        enum: ["Not viewed", "Viewed"]
    },
    AdminRemarks : {
        type: String,
        default: "",
        trim: true
    },
    AdminAttachments : {
        type: [String],
        default:[],
        trim:true
    },
    resolvedAt:{
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
HostelComplaintSchema.index({ scholarNumber: 1 });
HostelComplaintSchema.index({ createdAt: 1, _id: 1 }); 



/**
 * HostelComplaint Model
 * @type {Model<HostelComplaint>}
 */
const HostelComplaint = model('HostelComplaints', HostelComplaintSchema);

export default HostelComplaint;