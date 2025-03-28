/**
 * @file InfrastructureComplaint Model Module
 * @description This module defines the InfrastructureComplaint schema and model for handling infrastructure-related complaints.
 */

import { model, Schema } from 'mongoose';

/**
 * @module models/InfrastructureComplaint
 */

/** 
 * InfrastructureComplaint Schema
 * @typedef {Object} InfrastructureComplaint
 * @property {string} scholarNumber - Student ID
 * @property {string} studentName - Student name
 * @property {string} landmark - Landmark of the complaint
 * @property {string} [complainType] - Type of the complaint
 * @property {string} [complainDescription] - Description of the complaint
 * @property {string[]} [attachments] - List of attachment URLs
 * @property {string} [status="Pending"] - Status of the complaint
 * @property {string} [readStatus="Not viewed"] - Read status of the complaint
 */
const infrastructureComplaint = new Schema({
    scholarNumber: {
        type: String,
        required: [true, "Student ID is required!"]
    },
    studentName: {
        type: String,
        required: [true, "Student name is required!"],
        trim: true
    },
    landmark: {
        type: String,
        required: [true, "Landmark is required!"],
        trim: true,
    },
    complainType: {
        type: String,
        trim: true,
        enum: ["Electricity", "Water", "Internet", "Bus", "Classroom", "Library", "Sports", "Lab", "Other"]
    },
    complainDescription: {
        type: String,
        trim: true
    },
    attachments: {
        type: [String]
    },
    status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Resolved"]
    },
    readStatus: {
        type: String,
        default: "Not viewed",
        enum: ["Not viewed", "Viewed"]
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
    AdminRemarks : {
        type: String,
        trim: true
    },
    AdminAttachments: {
        type: [String],
        default: [],
        trim: true
        
    },
    resolvedAt:{
        type: Date
    }

}, {
    timestamps: true
});

infrastructureComplaint.index({ scholarNumber: 1 });
infrastructureComplaint.index({ createdAt: 1,_id:1 });


/**
 * InfrastructureComplaint Model
 * @type {Model<InfrastructureComplaint>}
 */
const InfrastructureComplaint = model('InfrastructureComplaints', infrastructureComplaint);
export default InfrastructureComplaint;